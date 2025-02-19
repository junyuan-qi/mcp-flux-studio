# Flux MCP Server

A Model Context Protocol (MCP) server for the Flux image generation API. This server provides tools for generating, manipulating, and controlling image generation through the Flux API.

## Features

- Image generation from text prompts
- Image-to-image generation
- Inpainting with customizable masks
- Control-based generation (canny, depth, pose)
- Support for multiple Flux models

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/flux-mcp-server.git
cd flux-mcp-server
```

2. Install dependencies:
```bash
npm install
```

3. Build the server:
```bash
npm run build
```

## Configuration

1. Create a `.env` file in the root directory:
```env
FLUX_PATH=/path/to/flux/installation
BFL_API_KEY=your_flux_api_key
```

2. Add the server to your MCP settings file (typically located at `~/Library/Application Support/Cursor/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`):
```json
{
  "mcpServers": {
    "flux": {
      "command": "/opt/homebrew/bin/node",
      "args": ["/path/to/flux-mcp-server/build/index.js"],
      "env": {
        "FLUX_PATH": "/path/to/flux/installation",
        "BFL_API_KEY": "your_flux_api_key"
      }
    }
  }
}
```

## Usage

The server provides the following tools:

### generate
Generate an image from a text prompt.
```json
{
  "prompt": "A photorealistic cat",
  "model": "flux.1.1-pro",
  "aspect_ratio": "1:1",
  "output": "generated.jpg"
}
```

### img2img
Generate an image using another image as reference.
```json
{
  "image": "input.jpg",
  "prompt": "Convert to oil painting",
  "model": "flux.1.1-pro",
  "strength": 0.85,
  "output": "output.jpg",
  "name": "oil_painting"
}
```

### inpaint
Inpaint an image using a mask.
```json
{
  "image": "input.jpg",
  "prompt": "Add flowers",
  "mask_shape": "circle",
  "position": "center",
  "output": "inpainted.jpg"
}
```

### control
Generate an image using structural control.
```json
{
  "type": "canny",
  "image": "control.jpg",
  "prompt": "A realistic photo",
  "output": "controlled.jpg"
}
```

## Development

### Project Structure

```
flux-mcp-server/
├── src/
│   ├── index.ts          # Main server implementation
│   └── types.ts          # TypeScript type definitions
├── tests/
│   └── server.test.ts    # Server tests
├── docs/
│   ├── API.md           # API documentation
│   └── CONTRIBUTING.md  # Contribution guidelines
├── examples/
│   ├── generate.json    # Example tool usage
│   └── config.json      # Example configuration
├── package.json
├── tsconfig.json
└── README.md
```

### Running Tests

```bash
npm test
```

### Building

```bash
npm run build
```

## Contributing

Please read [CONTRIBUTING.md](docs/CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Model Context Protocol](https://github.com/modelcontextprotocol/mcp) - The protocol specification
- [Flux API](https://flux.ai) - The underlying image generation API
