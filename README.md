# MCP Flux Studio

A minimal Model Context Protocol (MCP) server for [Black Forest Labs](https://bfl.ai) Flux models.  
This project provides two tools powered by the Flux **flux.1 Kontext** API:

- **generateImage** – generate an image from a text prompt.
- **editImage** – edit an existing image using a prompt and optional mask.

The server is written in TypeScript and uses the official [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk).

## Quick start

```bash
npm install
npm run build
BFL_API_KEY=your_api_key node build/index.js
```

## Configuration

Set the `BFL_API_KEY` environment variable to your Black Forest Labs API key.  
The server exposes MCP tools over stdio and can be used with any IDE that supports MCP, including Claude Desktop, Cursor and Windsurf.

## Tools

See [docs/API.md](docs/API.md) for parameter details.

## License

MIT
