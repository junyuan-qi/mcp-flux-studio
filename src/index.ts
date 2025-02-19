#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError, } from '@modelcontextprotocol/sdk/types.js';
import { spawn } from 'child_process';

class FluxServer {
    constructor() {
        this.server = new Server({
            name: 'flux-server',
            version: '0.1.0',
        }, {
            capabilities: {
                tools: {},
            },
        });
        // Path to Flux installation
        this.fluxPath = process.env.FLUX_PATH || '/Users/speed/CascadeProjects/flux';
        this.setupToolHandlers();
        // Error handling
        this.server.onerror = (error) => console.error('[MCP Error]', error);
        process.on('SIGINT', async () => {
            await this.server.close();
            process.exit(0);
        });
    }

    async runPythonCommand(args) {
        return new Promise((resolve, reject) => {
            // Use python from virtual environment if available
            const pythonPath = process.env.VIRTUAL_ENV ? 
                `${process.env.VIRTUAL_ENV}/bin/python` : 'python3';

            const childProcess = spawn(pythonPath, ['fluxcli.py', ...args], {
                cwd: this.fluxPath,
                env: process.env, // Pass through all environment variables
            });

            let output = '';
            let errorOutput = '';

            childProcess.stdout?.on('data', (data) => {
                output += data.toString();
            });

            childProcess.stderr?.on('data', (data) => {
                errorOutput += data.toString();
            });

            childProcess.on('close', (code) => {
                if (code === 0) {
                    resolve(output);
                } else {
                    reject(new Error(`Flux command failed: ${errorOutput}`));
                }
            });
        });
    }

    setupToolHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: 'generate',
                    description: 'Generate an image from a text prompt',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            prompt: {
                                type: 'string',
                                description: 'Text prompt for image generation',
                            },
                            model: {
                                type: 'string',
                                description: 'Model to use for generation',
                                enum: ['flux.1.1-pro', 'flux.1-pro', 'flux.1-dev', 'flux.1.1-ultra'],
                                default: 'flux.1.1-pro',
                            },
                            aspect_ratio: {
                                type: 'string',
                                description: 'Aspect ratio of the output image',
                                enum: ['1:1', '4:3', '3:4', '16:9', '9:16'],
                            },
                            width: {
                                type: 'number',
                                description: 'Image width (ignored if aspect-ratio is set)',
                            },
                            height: {
                                type: 'number',
                                description: 'Image height (ignored if aspect-ratio is set)',
                            },
                            output: {
                                type: 'string',
                                description: 'Output filename',
                                default: 'generated.jpg',
                            },
                        },
                        required: ['prompt'],
                    },
                },
                {
                    name: 'img2img',
                    description: 'Generate an image using another image as reference',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            image: {
                                type: 'string',
                                description: 'Input image path',
                            },
                            prompt: {
                                type: 'string',
                                description: 'Text prompt for generation',
                            },
                            model: {
                                type: 'string',
                                description: 'Model to use for generation',
                                enum: ['flux.1.1-pro', 'flux.1-pro', 'flux.1-dev', 'flux.1.1-ultra'],
                                default: 'flux.1.1-pro',
                            },
                            strength: {
                                type: 'number',
                                description: 'Generation strength',
                                default: 0.85,
                            },
                            width: {
                                type: 'number',
                                description: 'Output image width',
                            },
                            height: {
                                type: 'number',
                                description: 'Output image height',
                            },
                            output: {
                                type: 'string',
                                description: 'Output filename',
                                default: 'outputs/generated.jpg',
                            },
                            name: {
                                type: 'string',
                                description: 'Name for the generation',
                            },
                        },
                        required: ['image', 'prompt', 'name'],
                    },
                },
                {
                    name: 'inpaint',
                    description: 'Inpaint an image using a mask',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            image: {
                                type: 'string',
                                description: 'Input image path',
                            },
                            prompt: {
                                type: 'string',
                                description: 'Text prompt for inpainting',
                            },
                            mask_shape: {
                                type: 'string',
                                description: 'Shape of the mask',
                                enum: ['circle', 'rectangle'],
                                default: 'circle',
                            },
                            position: {
                                type: 'string',
                                description: 'Position of the mask',
                                enum: ['center', 'ground'],
                                default: 'center',
                            },
                            output: {
                                type: 'string',
                                description: 'Output filename',
                                default: 'inpainted.jpg',
                            },
                        },
                        required: ['image', 'prompt'],
                    },
                },
                {
                    name: 'control',
                    description: 'Generate an image using structural control',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            type: {
                                type: 'string',
                                description: 'Type of control to use',
                                enum: ['canny', 'depth', 'pose'],
                            },
                            image: {
                                type: 'string',
                                description: 'Input control image path',
                            },
                            prompt: {
                                type: 'string',
                                description: 'Text prompt for generation',
                            },
                            steps: {
                                type: 'number',
                                description: 'Number of inference steps',
                                default: 50,
                            },
                            guidance: {
                                type: 'number',
                                description: 'Guidance scale',
                            },
                            output: {
                                type: 'string',
                                description: 'Output filename',
                            },
                        },
                        required: ['type', 'image', 'prompt'],
                    },
                },
            ],
        }));

        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            try {
                switch (request.params.name) {
                    case 'generate': {
                        const args = request.params.arguments;
                        const cmdArgs = ['generate'];
                        cmdArgs.push('--prompt', args.prompt);
                        if (args.model) cmdArgs.push('--model', args.model);
                        if (args.aspect_ratio) cmdArgs.push('--aspect-ratio', args.aspect_ratio);
                        if (args.width) cmdArgs.push('--width', args.width.toString());
                        if (args.height) cmdArgs.push('--height', args.height.toString());
                        if (args.output) cmdArgs.push('--output', args.output);
                        const output = await this.runPythonCommand(cmdArgs);
                        return {
                            content: [{ type: 'text', text: output }],
                        };
                    }
                    case 'img2img': {
                        const args = request.params.arguments;
                        const cmdArgs = ['img2img'];
                        cmdArgs.push('--image', args.image);
                        cmdArgs.push('--prompt', args.prompt);
                        cmdArgs.push('--name', args.name);
                        if (args.model) cmdArgs.push('--model', args.model);
                        if (args.strength) cmdArgs.push('--strength', args.strength.toString());
                        if (args.width) cmdArgs.push('--width', args.width.toString());
                        if (args.height) cmdArgs.push('--height', args.height.toString());
                        if (args.output) cmdArgs.push('--output', args.output);
                        const output = await this.runPythonCommand(cmdArgs);
                        return {
                            content: [{ type: 'text', text: output }],
                        };
                    }
                    case 'inpaint': {
                        const args = request.params.arguments;
                        const cmdArgs = ['inpaint'];
                        cmdArgs.push('--image', args.image);
                        cmdArgs.push('--prompt', args.prompt);
                        if (args.mask_shape) cmdArgs.push('--mask-shape', args.mask_shape);
                        if (args.position) cmdArgs.push('--position', args.position);
                        if (args.output) cmdArgs.push('--output', args.output);
                        const output = await this.runPythonCommand(cmdArgs);
                        return {
                            content: [{ type: 'text', text: output }],
                        };
                    }
                    case 'control': {
                        const args = request.params.arguments;
                        const cmdArgs = ['control'];
                        cmdArgs.push('--type', args.type);
                        cmdArgs.push('--image', args.image);
                        cmdArgs.push('--prompt', args.prompt);
                        if (args.steps) cmdArgs.push('--steps', args.steps.toString());
                        if (args.guidance) cmdArgs.push('--guidance', args.guidance.toString());
                        if (args.output) cmdArgs.push('--output', args.output);
                        const output = await this.runPythonCommand(cmdArgs);
                        return {
                            content: [{ type: 'text', text: output }],
                        };
                    }
                    default:
                        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
                }
            } catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error: ${error instanceof Error ? error.message : String(error)}`,
                        },
                    ],
                    isError: true,
                };
            }
        });
    }

    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('Flux MCP server running on stdio');
    }
}

const server = new FluxServer();
server.run().catch(console.error);
