# Flux Kontext MCP Tools

## generateImage
Generate an image from a text prompt.

**Parameters**
- `prompt` (string, required) – text describing the desired image.
- `negative_prompt` (string, optional) – undesirable elements to avoid.
- `width` (number, optional, default 1024)
- `height` (number, optional, default 1024)
- `steps` (number, optional, default 30) – number of diffusion steps.
- `guidance_scale` (number, optional, default 7.5)

Returns the URL of the generated image.

## editImage
Edit an existing image using a prompt and optional mask.

**Parameters**
- `image` (string, required) – path to the base image or base64 data URL.
- `mask` (string, optional) – path or base64 mask image.
- `prompt` (string, required) – text describing the desired changes.
- `negative_prompt` (string, optional)
- `width` (number, optional, default 1024)
- `height` (number, optional, default 1024)
- `steps` (number, optional, default 30)
- `guidance_scale` (number, optional, default 7.5)

Returns the URL of the edited image.
