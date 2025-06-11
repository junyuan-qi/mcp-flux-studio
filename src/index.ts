#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequest, CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError } from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs/promises';

class FluxKontextServer {
  private server: Server;
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.BFL_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('BFL_API_KEY must be provided in environment');
    }

    this.server = new Server(
      { name: 'flux-kontext-server', version: '0.1.0' },
      { capabilities: { tools: {} } }
    );

    this.setupHandlers();
    this.server.onerror = (err: Error) => console.error('[MCP Error]', err);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'generateImage',
          description: 'Generate an image with Flux Kontext',
          inputSchema: {
            type: 'object',
            properties: {
              prompt: { type: 'string', description: 'Text prompt to generate' },
              negative_prompt: { type: 'string', description: 'Negative prompt', nullable: true },
              width: { type: 'number', description: 'Output width', default: 1024 },
              height: { type: 'number', description: 'Output height', default: 1024 },
              steps: { type: 'number', description: 'Inference steps', default: 30 },
              guidance_scale: { type: 'number', description: 'Guidance scale', default: 7.5 }
            },
            required: ['prompt']
          }
        },
        {
          name: 'editImage',
          description: 'Edit an image with Flux Kontext',
          inputSchema: {
            type: 'object',
            properties: {
              image: { type: 'string', description: 'Path to image file or base64 data' },
              mask: { type: 'string', description: 'Optional mask image' },
              prompt: { type: 'string', description: 'Edit prompt' },
              negative_prompt: { type: 'string', description: 'Negative prompt', nullable: true },
              width: { type: 'number', description: 'Output width', default: 1024 },
              height: { type: 'number', description: 'Output height', default: 1024 },
              steps: { type: 'number', description: 'Inference steps', default: 30 },
              guidance_scale: { type: 'number', description: 'Guidance scale', default: 7.5 }
            },
            required: ['image', 'prompt']
          }
        }
      ]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (req: CallToolRequest) => {
      try {
        if (req.params.name === 'generateImage') {
          const resUrl = await this.generate(req.params.arguments ?? {});
          return { content: [{ type: 'text', text: resUrl }] };
        }
        if (req.params.name === 'editImage') {
          const resUrl = await this.edit(req.params.arguments ?? {});
          return { content: [{ type: 'text', text: resUrl }] };
        }
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${req.params.name}`);
      } catch (err) {
        return { content: [{ type: 'text', text: (err as Error).message }], isError: true };
      }
    });
  }

  private async requestBfl(payload: any): Promise<string> {
    const response = await fetch('https://api.bfl.ai/v1/flux-kontext-pro', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Key': this.apiKey
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error(`BFL API error: ${response.status} ${response.statusText}`);
    const data: any = await response.json();
    const id = data.id;
    if (!id) throw new Error('Invalid response from BFL API');
    return this.pollResult(id);
  }

  private async pollResult(id: string): Promise<string> {
    for (let i = 0; i < 30; i++) {
      const res = await fetch(`https://api.bfl.ai/v1/get_result?id=${id}`, {
        headers: { 'X-Key': this.apiKey }
      });
      const json: any = await res.json();
      if (json.status === 'Ready') {
        return json.result.sample as string;
      }
      if (json.status === 'failed') {
        throw new Error(json.error || 'Task failed');
      }
      await new Promise((r) => setTimeout(r, 2000));
    }
    throw new Error('Timed out waiting for result');
  }

  private async generate(args: any): Promise<string> {
    const payload = {
      prompt: args.prompt,
      negative_prompt: args.negative_prompt,
      width: args.width,
      height: args.height,
      num_inference_steps: args.steps,
      guidance_scale: args.guidance_scale
    };
    return this.requestBfl(payload);
  }

  private async fileToBase64(path: string): Promise<string> {
    if (path.startsWith('data:')) {
      return path.split(',')[1];
    }
    const buf = await fs.readFile(path);
    return buf.toString('base64');
  }

  private async edit(args: any): Promise<string> {
    const payload: any = {
      prompt: args.prompt,
      negative_prompt: args.negative_prompt,
      image: await this.fileToBase64(args.image),
      width: args.width,
      height: args.height,
      num_inference_steps: args.steps,
      guidance_scale: args.guidance_scale
    };
    if (args.mask) {
      payload.mask = await this.fileToBase64(args.mask);
    }
    return this.requestBfl(payload);
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Flux Kontext MCP server running');
  }
}

const server = new FluxKontextServer();
server.run().catch((err) => console.error(err));
