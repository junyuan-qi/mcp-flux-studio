# Flux MCP Server API Documentation

This document details the tools provided by the Flux MCP Server and their usage.

## Tools

### generate

Generate an image from a text prompt.

**Parameters:**
```typescript
{
  // Required: Text prompt describing the desired image
  prompt: string;

  // Optional: Model to use for generation
  // Default: "flux.1.1-pro"
  model: "flux.1.1-pro" | "flux.1-pro" | "flux.1-dev" | "flux.1.1-ultra";

  // Optional: Aspect ratio of the output image
  aspect_ratio?: "1:1" | "4:3" | "3:4" | "16:9" | "9:16";

  // Optional: Custom width (ignored if aspect_ratio is set)
  width?: number;

  // Optional: Custom height (ignored if aspect_ratio is set)
  height?: number;

  // Optional: Output filename
  // Default: "generated.jpg"
  output?: string;
}
```

**Example:**
```json
{
  "prompt": "A serene mountain landscape at sunset",
  "model": "flux.1.1-pro",
  "aspect_ratio": "16:9",
  "output": "landscape.jpg"
}
```

### img2img

Generate an image using another image as reference.

**Parameters:**
```typescript
{
  // Required: Path to input image
  image: string;

  // Required: Text prompt describing desired modifications
  prompt: string;

  // Required: Name for the generation
  name: string;

  // Optional: Model to use for generation
  // Default: "flux.1.1-pro"
  model?: "flux.1.1-pro" | "flux.1-pro" | "flux.1-dev" | "flux.1.1-ultra";

  // Optional: Generation strength (0.0 to 1.0)
  // Default: 0.85
  strength?: number;

  // Optional: Output width
  width?: number;

  // Optional: Output height
  height?: number;

  // Optional: Output filename
  // Default: "outputs/generated.jpg"
  output?: string;
}
```

**Example:**
```json
{
  "image": "photo.jpg",
  "prompt": "Convert to oil painting style",
  "name": "oil_painting",
  "model": "flux.1.1-pro",
  "strength": 0.75,
  "output": "painting.jpg"
}
```

### inpaint

Inpaint an image using a mask.

**Parameters:**
```typescript
{
  // Required: Path to input image
  image: string;

  // Required: Text prompt describing what to add in masked area
  prompt: string;

  // Optional: Shape of the mask
  // Default: "circle"
  mask_shape?: "circle" | "rectangle";

  // Optional: Position of the mask
  // Default: "center"
  position?: "center" | "ground";

  // Optional: Output filename
  // Default: "inpainted.jpg"
  output?: string;
}
```

**Example:**
```json
{
  "image": "portrait.jpg",
  "prompt": "Add a flower crown",
  "mask_shape": "circle",
  "position": "center",
  "output": "portrait_with_crown.jpg"
}
```

### control

Generate an image using structural control.

**Parameters:**
```typescript
{
  // Required: Type of control to use
  type: "canny" | "depth" | "pose";

  // Required: Path to control image
  image: string;

  // Required: Text prompt for generation
  prompt: string;

  // Optional: Number of inference steps
  // Default: 50
  steps?: number;

  // Optional: Guidance scale
  guidance?: number;

  // Optional: Output filename
  // Default: "{type}_result.jpg"
  output?: string;
}
```

**Example:**
```json
{
  "type": "pose",
  "image": "pose.jpg",
  "prompt": "A person in a superhero costume",
  "steps": 50,
  "output": "superhero.jpg"
}
```

## Error Handling

All tools return a standard error format:

```typescript
{
  content: [
    {
      type: "text",
      text: "Error message"
    }
  ],
  isError: true
}
```

Common error scenarios:
- Invalid parameters
- File not found
- API authentication failure
- Generation failure
- Network errors

## Environment Variables

The server requires the following environment variables:

```env
FLUX_PATH=/path/to/flux/installation
BFL_API_KEY=your_flux_api_key
```

## Rate Limiting

The server respects the Flux API's rate limits. If you encounter rate limiting, the error response will include the retry-after period.

## Versioning

The API follows semantic versioning. Breaking changes will only be introduced in major version updates.
