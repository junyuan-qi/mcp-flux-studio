# Installing MCP Flux Studio

This guide provides detailed instructions for installing and configuring the MCP Flux Studio server in both Cursor and Windsurf (Codeium) IDEs.

## Prerequisites

Before installing MCP Flux Studio, ensure you have:

- **Updated IDEs**:
  - Cursor v0.45.7 or later (early 2025)
  - Windsurf "Wave 3" or later (late 2024)

- **Runtime Environment**:
  - Node.js 18+ (for running the MCP server)
  - Python 3.12+ (for the Flux CLI)

- **API Keys**:
  - Flux API key (BFL_API_KEY)

## Installation in Cursor

1. **Install Dependencies**:
```bash
# Install Node.js dependencies
npm install

# Install Python dependencies
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
```

2. **Build the Server**:
```bash
npm run build
```

3. **Configure in Cursor**:
- Open Cursor Settings > Features > MCP
- Click "+ Add New MCP Server"
- Enter the following details:
  ```
  Type: stdio
  Name: Flux Studio
  Command: node /path/to/mcp-flux-studio/build/index.js
  ```

4. **Set Environment Variables**:
Create a wrapper script (e.g., `start-flux.sh`):
```bash
#!/bin/bash
export BFL_API_KEY="your_flux_api_key"
export FLUX_PATH="/path/to/flux/installation"
node /path/to/mcp-flux-studio/build/index.js
```

Make it executable:
```bash
chmod +x start-flux.sh
```

Then update the Cursor MCP command to use this script.

## Installation in Windsurf (Codeium)

1. **Install Dependencies** (same as Cursor steps above)

2. **Configure in Windsurf**:
- Open the Cascade panel
- Click the MCP toolbar icon > Configure
- Edit `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "flux-studio": {
      "command": "node",
      "args": ["/path/to/mcp-flux-studio/build/index.js"],
      "env": {
        "BFL_API_KEY": "your_flux_api_key",
        "FLUX_PATH": "/path/to/flux/installation",
        "NODE_ENV": "production"
      }
    }
  }
}
```

## Verifying Installation

1. **Check Server Status**:
- In Cursor: Click the Refresh icon on the MCP server's card
- In Windsurf: Click Refresh in the MCP toolbar

2. **Test Tool Availability**:
You should see the following tools available:
- generate
- img2img
- inpaint
- control

3. **Test Basic Generation**:
Try a simple image generation:
```json
{
  "prompt": "A test image",
  "model": "flux.1.1-pro",
  "aspect_ratio": "1:1",
  "output": "test.jpg"
}
```

## Troubleshooting

### Common Issues

1. **Server Not Starting**:
- Check if Node.js and Python are installed and in PATH
- Verify all dependencies are installed
- Check environment variables are set correctly

2. **Missing Tools**:
- Refresh the MCP server list
- Check server logs for errors
- Verify the Flux CLI is accessible

3. **Generation Failures**:
- Verify your Flux API key is valid
- Check network connectivity
- Ensure the Flux installation path is correct

### Environment Variables

Required environment variables:
```env
BFL_API_KEY=your_flux_api_key
FLUX_PATH=/path/to/flux/installation
```

Optional configuration:
```env
NODE_ENV=production  # or development
LOG_LEVEL=info      # debug, info, warn, error
```

## Updating

To update MCP Flux Studio:

1. Pull the latest changes:
```bash
git pull origin main
```

2. Rebuild the server:
```bash
npm install
npm run build
```

3. Refresh the MCP server in your IDE

## Additional Resources

- [Model Context Protocol Documentation](https://github.com/modelcontextprotocol/mcp)
- [Cursor MCP Documentation](https://cursor.sh/docs/mcp)
- [Windsurf (Codeium) Documentation](https://codeium.com/docs/cascade-mcp)

## Support

If you encounter issues:
1. Check the [GitHub Issues](https://github.com/jmanhype/mcp-flux-studio/issues)
2. Join our [Discord Community](https://discord.gg/your-server)
3. Submit a bug report with detailed reproduction steps
