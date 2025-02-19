#!/usr/bin/env python3
import os
import json
import argparse
from typing import Optional
import base64
from PIL import Image, ImageDraw
import requests
import io
import time
from io import BytesIO
import datetime

class FluxAPI:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("BFL_API_KEY")
        if not self.api_key:
            raise ValueError("API key must be provided or set in BFL_API_KEY environment variable")
        self.base_url = "https://api.bfl.ml"
        self.headers = {"X-Key": self.api_key}
    
    def encode_image(self, image_path: str) -> str:
        """Convert an image file to base64 string."""
        with open(image_path, 'rb') as image_file:
            return base64.b64encode(image_file.read()).decode('utf-8')
    
    def save_image_from_url(self, url: str, filename: str, target_width: int = None, target_height: int = None) -> bool:
        """Download and save image from URL."""
        try:
            response = requests.get(url)
            response.raise_for_status()
            
            # Save the original image
            with open(filename, 'wb') as f:
                f.write(response.content)
            
            # If target dimensions are specified, resize the image
            if target_width and target_height:
                with Image.open(filename) as img:
                    # Resize image maintaining aspect ratio
                    img = img.resize((target_width, target_height), Image.Resampling.LANCZOS)
                    # Save resized image
                    img.save(filename, quality=95)
            
            print(f"✨ Saved as {filename}")
            return True
        except Exception as e:
            print(f"Failed to save image: {str(e)}")
            return False
    
    def get_task_result(self, task_id: str, silent: bool = False) -> Optional[dict]:
        """Poll for task result."""
        max_attempts = 30
        attempt = 0
        
        print("Processing image...")
        while attempt < max_attempts:
            if not silent:
                print(f"Processing image... (attempt {attempt + 1}/{max_attempts})")
            
            response = requests.get(f"{self.base_url}/v1/get_result", params={'id': task_id})
            result = response.json()
            
            if result['status'] == 'Ready':
                return result
            elif result['status'] == 'failed':
                print(f"Task failed: {result.get('error', 'Unknown error')}")
                return None
            
            attempt += 1
            time.sleep(2)
        
        print("Timeout waiting for result")
        return None

    def generate_image(self, prompt: str, model: str = "flux.1.1-pro", width: int = None, height: int = None, aspect_ratio: str = None) -> Optional[str]:
        """Generate an image using any FLUX model."""
        endpoint = {
            "flux.1.1-pro": "/v1/flux-pro-1.1",
            "flux.1-pro": "/v1/flux-pro",
            "flux.1-dev": "/v1/flux-dev",
            "flux.1.1-ultra": "/v1/flux-pro-1.1-ultra",
        }.get(model)
        
        if not endpoint:
            raise ValueError(f"Unknown model: {model}")
        
        # Set default dimensions based on aspect ratio if provided
        if aspect_ratio:
            if aspect_ratio == '1:1':
                width, height = 1024, 1024
            elif aspect_ratio == '4:3':
                width, height = 1024, 768
            elif aspect_ratio == '3:4':
                width, height = 768, 1024
            elif aspect_ratio == '16:9':
                width, height = 1024, 576
            elif aspect_ratio == '9:16':
                width, height = 576, 1024
        else:
            # Use defaults if neither aspect ratio nor dimensions are provided
            width = width or 1024
            height = height or 768
        
        payload = {
            "prompt": prompt,
            "width": width,
            "height": height,
            "aspect_ratio": aspect_ratio if aspect_ratio else None
        }
        response = requests.post(
            f"{self.base_url}{endpoint}",
            json=payload,
            headers=self.headers
        )
        
        task_id = response.json().get('id')
        if not task_id:
            print("Failed to start generation task")
            return None
            
        result = self.get_task_result(task_id)
        if result and result.get('result', {}).get('sample'):
            return result['result']['sample']
        return None

    def create_mask(self, size: tuple, shape: str = 'rectangle', position: str = 'center') -> Image:
        """Create a mask for inpainting."""
        mask = Image.new('L', size, 0)
        draw = ImageDraw.Draw(mask)
        
        width, height = size
        
        if position == 'ground':
            horizon_y = height * 0.65
            y_start = horizon_y - (height * 0.05)
            points = [
                (0, y_start),
                (0, height),
                (width, height),
                (width, y_start)
            ]
            draw.polygon(points, fill=255)
        else:
            x1 = width * 0.25
            y1 = height * 0.25
            x2 = width * 0.75
            y2 = height * 0.75
            
            if shape == 'rectangle':
                draw.rectangle([x1, y1, x2, y2], fill=255)
            else:  # circle
                center = (width // 2, height // 2)
                radius = min(width, height) // 4
                draw.ellipse([center[0] - radius, center[1] - radius,
                             center[0] + radius, center[1] + radius], fill=255)
        
        return mask

    def inpaint(self, image_path: str, prompt: str, mask_shape: str = 'circle', position: str = 'center') -> Optional[str]:
        """Inpaint an image using a mask."""
        base_image = Image.open(image_path)
        mask = self.create_mask(base_image.size, shape=mask_shape, position=position)
        
        mask_path = 'temp_mask.jpg'
        mask.save(mask_path)
        
        payload = {
            "image": self.encode_image(image_path),
            "mask": self.encode_image(mask_path),
            "prompt": prompt,
            "steps": 50,
            "guidance": 60,
            "output_format": "jpeg",
            "safety_tolerance": 2
        }
        
        response = requests.post(
            f"{self.base_url}/v1/flux-pro-1.0-fill",
            json=payload,
            headers=self.headers
        )
        
        os.remove(mask_path)
        
        task_id = response.json().get('id')
        if not task_id:
            return None
            
        result = self.get_task_result(task_id)
        if result and result.get('result', {}).get('sample'):
            return result['result']['sample']
        return None

    def control_generate(self, control_type: str, control_image: str, prompt: str, **kwargs) -> Optional[str]:
        """Generate an image using any supported control type."""
        endpoints = {
            'canny': '/v1/flux-pro-1.0-canny',
            'depth': '/v1/flux-pro-1.0-depth',
            'pose': '/v1/flux-pro-1.0-pose'
        }
        
        default_params = {
            'canny': {'guidance': 30},
            'depth': {'guidance': 15},
            'pose': {'guidance': 25}
        }
        
        if control_type not in endpoints:
            raise ValueError(f"Unsupported control type: {control_type}")
            
        payload = {
            "prompt": prompt,
            "control_image": self.encode_image(control_image),
            "steps": kwargs.get('steps', 50),
            "output_format": kwargs.get('output_format', 'jpeg'),
            "safety_tolerance": kwargs.get('safety_tolerance', 2)
        }
        
        payload.update(default_params.get(control_type, {}))
        payload.update(kwargs)
        
        response = requests.post(
            f"{self.base_url}{endpoints[control_type]}",
            json=payload,
            headers=self.headers
        )
        
        task_id = response.json().get('id')
        if not task_id:
            return None
            
        result = self.get_task_result(task_id)
        if result and result.get('result', {}).get('sample'):
            return result['result']['sample']
        return None

    def img2img(self, image_path: str, prompt: str, model: str = "flux.1.1-pro", strength: float = 0.75, width: int = None, height: int = None) -> Optional[str]:
        """Generate an image using another image as reference"""
        endpoint = {
            "flux.1.1-pro": "/v1/flux-pro-1.1",
            "flux.1-pro": "/v1/flux-pro",
            "flux.1-dev": "/v1/flux-dev",
            "flux.1.1-ultra": "/v1/flux-pro-1.1-ultra",
        }.get(model)
        
        if not endpoint:
            raise ValueError(f"Unknown model: {model}")
            
        with Image.open(image_path) as img:
            orig_width, orig_height = img.size
            
            if width is None or height is None:
                width, height = orig_width, orig_height
            
            aspect_ratio = orig_height / orig_width
            
            total_pixels = width * height
            if total_pixels > 1048576:
                max_area = 1048576
                width = int((max_area / aspect_ratio) ** 0.5)
                height = int(width * aspect_ratio)
            
            buffered = BytesIO()
            img.save(buffered, format="JPEG", quality=95)
            image_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')

        payload = {
            "prompt": prompt,
            "image": image_base64,
            "strength": strength,
            "width": width,
            "height": height,
            "guidance_scale": 7.5,
            "num_inference_steps": 50,
            "scheduler": "euler_ancestral",
            "preserve_init_image_color_profile": True
        }
        
        response = requests.post(
            f"{self.base_url}{endpoint}",
            headers=self.headers,
            json=payload
        )
        
        task_id = response.json().get('id')
        if not task_id:
            print("Failed to start image-to-image task")
            return None
            
        result = self.get_task_result(task_id)
        if result and result.get('result', {}).get('sample'):
            return result['result']['sample']
        return None

def main():
    parser = argparse.ArgumentParser(description="FLUX CLI - Image Generation Tool")
    subparsers = parser.add_subparsers(dest='command', help='Commands')
    
    # Generate command
    generate_parser = subparsers.add_parser('generate', help='Generate an image from a text prompt')
    generate_parser.add_argument('--prompt', '-p', required=True, help='Text prompt for image generation')
    generate_parser.add_argument('--model', '-m', choices=['flux.1.1-pro', 'flux.1-pro', 'flux.1-dev', 'flux.1.1-ultra'],
                                default='flux.1.1-pro', help='Model to use for generation')
    generate_parser.add_argument('--aspect-ratio', '-ar', choices=['1:1', '4:3', '3:4', '16:9', '9:16'],
                                help='Aspect ratio of the output image')
    generate_parser.add_argument('--width', '-w', type=int, help='Image width (ignored if aspect-ratio is set)')
    generate_parser.add_argument('--height', type=int, help='Image height (ignored if aspect-ratio is set)')
    generate_parser.add_argument('--output', '-o', default='generated.jpg', help='Output filename')
    
    # Inpaint command
    inpaint_parser = subparsers.add_parser('inpaint', help='Inpaint an image using a mask')
    inpaint_parser.add_argument('--image', '-i', required=True, help='Input image for inpainting')
    inpaint_parser.add_argument('--prompt', '-p', required=True, help='Text prompt for inpainting')
    inpaint_parser.add_argument('--mask-shape', '-m', choices=['circle', 'rectangle'], default='circle',
                               help='Shape of the mask')
    inpaint_parser.add_argument('--position', '-pos', choices=['center', 'ground'], default='center',
                               help='Position of the mask')
    inpaint_parser.add_argument('--output', '-o', default='inpainted.jpg', help='Output filename')
    
    # Control command
    control_parser = subparsers.add_parser('control', help='Generate an image using control')
    control_parser.add_argument('--type', '-t', required=True, choices=['canny', 'depth', 'pose'],
                               help='Type of control to use')
    control_parser.add_argument('--image', '-i', required=True, help='Input control image')
    control_parser.add_argument('--prompt', '-p', required=True, help='Text prompt for generation')
    control_parser.add_argument('--steps', type=int, default=50, help='Number of inference steps')
    control_parser.add_argument('--guidance', type=float, help='Guidance scale')
    control_parser.add_argument('--output', '-o', help='Output filename')
    
    # Img2img command
    img2img_parser = subparsers.add_parser('img2img', help='Generate an image using another image as reference')
    img2img_parser.add_argument('--image', '-i', required=True, help='Input image')
    img2img_parser.add_argument('--prompt', '-p', required=True, help='Text prompt for generation')
    img2img_parser.add_argument('--model', '-m', choices=['flux.1.1-pro', 'flux.1-pro', 'flux.1-dev', 'flux.1.1-ultra'],
                               default='flux.1.1-pro', help='Model to use')
    img2img_parser.add_argument('--strength', '-s', type=float, default=0.85, help='Generation strength')
    img2img_parser.add_argument('--width', '-w', type=int, help='Output width')
    img2img_parser.add_argument('--height', type=int, help='Output height')
    img2img_parser.add_argument('--output', '-o', default='outputs/generated.jpg', help='Output filename')
    img2img_parser.add_argument('--name', '-n', required=True, help='Name for the generation')
    
    args = parser.parse_args()
    
    try:
        api = FluxAPI()
        
        if args.command == 'generate':
            print(f"Generating image with {args.model}...")
            print(f"Prompt: {args.prompt}")
            
            image_url = api.generate_image(
                prompt=args.prompt,
                model=args.model,
                width=args.width,
                height=args.height,
                aspect_ratio=args.aspect_ratio
            )
            
            if image_url and api.save_image_from_url(image_url, args.output):
                print("✨ Generation complete!")
            else:
                print("Generation failed")
                
        elif args.command == 'inpaint':
            print(f"Inpainting image...")
            print(f"Prompt: {args.prompt}")
            
            image_url = api.inpaint(args.image, args.prompt, args.mask_shape, args.position)
            if image_url and api.save_image_from_url(image_url, args.output):
                print("✨ Inpainting complete!")
            else:
                print("Inpainting failed")
                
        elif args.command == 'control':
            output = args.output or f"{args.type}_result.jpg"
            kwargs = {'steps': args.steps}
            if args.guidance is not None:
                kwargs['guidance'] = args.guidance
            
            result_url = api.control_generate(args.type, args.image, args.prompt, **kwargs)
            if result_url and api.save_image_from_url(result_url, output):
                print("✨ Control generation complete!")
            else:
                print("Control generation failed")
                
        elif args.command == 'img2img':
            os.makedirs(os.path.dirname(args.output), exist_ok=True)
            
            print(f"Generating image-to-image with {args.model}...")
            print(f"Input image: {args.image}")
            print(f"Prompt: {args.prompt}")
            
            result = api.img2img(
                image_path=args.image,
                prompt=args.prompt,
                model=args.model,
                strength=args.strength,
                width=args.width,
                height=args.height
            )
            
            if result and api.save_image_from_url(result, args.output):
                print("✨ Generation complete!")
            else:
                print("Generation failed")
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return 1
    
    return 0

if __name__ == '__main__':
    exit(main())
