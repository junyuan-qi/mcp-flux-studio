# Installation Guide

This project can be used with any MCP‑compatible IDE. The server communicates over stdio.

## Build

```bash
npm install
npm run build
```

## Running

Set your Black Forest Labs API key and start the server:

```bash
BFL_API_KEY=your_api_key node build/index.js
```

## IDE Setup

### Claude Desktop

1. Open the MCP settings and add a new server.
2. Command: `node /path/to/mcp-flux-studio/build/index.js`
3. Set the environment variable `BFL_API_KEY` in the configuration panel.

### Cursor

1. Go to Settings → Features → MCP.
2. Add a new server with the same command as above.
3. Provide `BFL_API_KEY` via a wrapper script or environment settings.

### Windsurf

1. Edit `~/.codeium/windsurf/mcp_config.json` and add an entry:

```json
{
  "command": "node",
  "args": ["/path/to/mcp-flux-studio/build/index.js"],
  "env": { "BFL_API_KEY": "your_api_key" }
}
```

Restart the IDE after editing the configuration.
