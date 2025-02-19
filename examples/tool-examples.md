# Flux MCP Server Tool Examples

This document provides practical examples of using each tool provided by the Flux MCP server.

## Generate Tool Examples

### Basic Image Generation
```json
{
  "prompt": "A serene mountain landscape at sunset, with snow-capped peaks reflecting golden light",
  "model": "flux.1.1-pro",
  "aspect_ratio": "16:9",
  "output": "mountain_sunset.jpg"
}
```

### High-Resolution Portrait
```json
{
  "prompt": "Professional studio portrait of a person, high-quality lighting, detailed features",
  "model": "flux.1.1-ultra",
  "width": 1024,
  "height": 1024,
  "output": "portrait.jpg"
}
```

### Artistic Composition
```json
{
  "prompt": "Abstract art in the style of Kandinsky, vibrant colors, geometric shapes",
  "model": "flux.1.1-pro",
  "aspect_ratio": "1:1",
  "output": "abstract_art.jpg"
}
```

## Image-to-Image Examples

### Style Transfer
```json
{
  "image": "photo.jpg",
  "prompt": "Convert to watercolor painting style, artistic, soft edges",
  "model": "flux.1.1-pro",
  "strength": 0.75,
  "name": "watercolor_conversion",
  "output": "watercolor.jpg"
}
```

### Content Modification
```json
{
  "image": "summer_scene.jpg",
  "prompt": "Convert to winter scene with snow",
  "model": "flux.1.1-ultra",
  "strength": 0.85,
  "name": "season_change",
  "output": "winter_scene.jpg"
}
```

### Resolution Upscaling
```json
{
  "image": "low_res.jpg",
  "prompt": "Enhance details and resolution while maintaining style",
  "model": "flux.1.1-pro",
  "strength": 0.6,
  "width": 2048,
  "height": 2048,
  "name": "upscale",
  "output": "high_res.jpg"
}
```

## Inpainting Examples

### Object Removal
```json
{
  "image": "street_photo.jpg",
  "prompt": "Remove object and fill with matching background",
  "mask_shape": "rectangle",
  "position": "center",
  "output": "cleaned_photo.jpg"
}
```

### Object Addition
```json
{
  "image": "portrait.jpg",
  "prompt": "Add a flower crown with roses and daisies",
  "mask_shape": "circle",
  "position": "center",
  "output": "portrait_with_crown.jpg"
}
```

### Background Modification
```json
{
  "image": "product_photo.jpg",
  "prompt": "Replace background with clean white surface",
  "mask_shape": "rectangle",
  "position": "ground",
  "output": "product_white_bg.jpg"
}
```

## Control Examples

### Pose Control
```json
{
  "type": "pose",
  "image": "pose_reference.jpg",
  "prompt": "A person in business attire in this pose",
  "steps": 50,
  "output": "business_portrait.jpg"
}
```

### Edge Control
```json
{
  "type": "canny",
  "image": "sketch.jpg",
  "prompt": "Convert sketch to realistic architectural rendering",
  "steps": 50,
  "guidance": 7.5,
  "output": "architecture.jpg"
}
```

### Depth Control
```json
{
  "type": "depth",
  "image": "depth_map.jpg",
  "prompt": "Create a fantasy landscape matching this depth structure",
  "steps": 50,
  "guidance": 7.5,
  "output": "fantasy_landscape.jpg"
}
```

## Advanced Usage

### Chaining Tools
You can chain multiple tools together for complex transformations:

1. First, generate a base image:
```json
{
  "prompt": "A cityscape at night",
  "model": "flux.1.1-pro",
  "aspect_ratio": "16:9",
  "output": "cityscape.jpg"
}
```

2. Then, use img2img to enhance it:
```json
{
  "image": "cityscape.jpg",
  "prompt": "Add rain and neon reflections",
  "model": "flux.1.1-ultra",
  "strength": 0.7,
  "name": "rainy_city",
  "output": "rainy_cityscape.jpg"
}
```

3. Finally, use inpainting for specific details:
```json
{
  "image": "rainy_cityscape.jpg",
  "prompt": "Add a person with umbrella",
  "mask_shape": "rectangle",
  "position": "center",
  "output": "final_scene.jpg"
}
```

## Tips and Best Practices

1. **Prompts**
   - Be specific and detailed in your prompts
   - Include style references when relevant
   - Use descriptive adjectives for better results

2. **Models**
   - Use flux.1.1-ultra for highest quality
   - Use flux.1.1-pro for balanced quality/speed
   - Use flux.1-dev for experimentation

3. **Parameters**
   - Start with default parameters
   - Adjust strength gradually in img2img
   - Use appropriate aspect ratios for your use case

4. **Output**
   - Use meaningful filenames
   - Organize outputs in subdirectories
   - Include metadata in filenames when relevant
