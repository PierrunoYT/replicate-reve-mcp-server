#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import Replicate from "replicate";
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';

// Check for required environment variable
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
let replicateClient: Replicate | null = null;

if (!REPLICATE_API_TOKEN) {
  console.error('REPLICATE_API_TOKEN environment variable is required');
  console.error('Please set your Replicate API token: export REPLICATE_API_TOKEN=your_token_here');
  // Server continues running, no process.exit()
} else {
  // Configure Replicate client
  replicateClient = new Replicate({
    auth: REPLICATE_API_TOKEN,
  });
}

// Download image function
async function downloadImage(url: string, filename: string): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const parsedUrl = new URL(url);
      const client = parsedUrl.protocol === 'https:' ? https : http;
      
      // Create images directory if it doesn't exist
      const imagesDir = path.join(process.cwd(), 'images');
      if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true });
      }
      
      const filePath = path.join(imagesDir, filename);
      const file = fs.createWriteStream(filePath);
      
      client.get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download image: HTTP ${response.statusCode}`));
          return;
        }
        
        response.pipe(file);
        
        file.on('finish', () => {
          file.close();
          resolve(filePath);
        });
        
        file.on('error', (err) => {
          fs.unlink(filePath, () => {}); // Delete partial file
          reject(err);
        });
      }).on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
}

// Generate safe filename for images
function generateImageFilename(prompt: string, index: number): string {
  const safePrompt = prompt
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 50);
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `reve_${safePrompt}_${index}_${timestamp}.png`;
}

// Create MCP server
const server = new McpServer({
  name: "reve-create-server",
  version: "1.0.0",
});

// Tool: Generate images with Reve Create
server.tool(
  "reve_create",
  {
    description: "Generate high-quality images using Reve Create - image generation model from Reve that generates detailed visual output closely following your instructions, with strong aesthetic quality and accurate text rendering",
    inputSchema: {
      type: "object",
      properties: {
        prompt: {
          type: "string",
          description: "Text prompt for image generation"
        },
        aspect_ratio: {
          type: "string",
          enum: ["16:9", "9:16", "3:2", "2:3", "4:3", "3:4", "1:1"],
          description: "The desired aspect ratio of the generated image",
          default: "3:2"
        },
        version: {
          type: "string",
          description: "The specific model version to use when generating the image (e.g., 'latest' or a version hash)",
          default: "latest"
        },
        seed: {
          type: "integer",
          description: "Random seed. Set for reproducible generation",
        },
        image: {
          type: "string",
          description: "Optional image file path or URL for image editing. If provided, the model will edit the image based on the prompt instead of generating from scratch.",
          format: "uri"
        }
      },
      required: ["prompt"]
    }
  },
  async (args: any) => {
    // Check if Replicate client is configured
    if (!replicateClient) {
      return {
        content: [{
          type: "text",
          text: "Error: REPLICATE_API_TOKEN environment variable is not set. Please configure your Replicate API token."
        }],
        isError: true
      };
    }

    const { 
      prompt, 
      aspect_ratio = "3:2",
      version = "latest",
      seed,
      image
    } = args;
    
    try {
      // Prepare input for Replicate API
      const input: any = {
        prompt,
        aspect_ratio,
        version
      };

      if (seed !== undefined) {
        input.seed = seed;
      }

      if (image) {
        input.image = image;
      }

      console.error(`Generating image with Reve Create - prompt: "${prompt}"`);

      // Call Replicate API
      const output = await replicateClient.run("reve/create", { input }) as string;

      if (!output) {
        throw new Error("No output received from Replicate API");
      }

      // Download image locally
      console.error("Downloading image locally...");
      const filename = generateImageFilename(prompt, 1);
      
      let localPath: string | null = null;
      try {
        localPath = await downloadImage(output, filename);
        console.error(`Downloaded: ${filename}`);
      } catch (downloadError) {
        console.error(`Failed to download image:`, downloadError);
      }

      // Format response with download information
      let responseText = `Successfully generated image using Reve Create:

Prompt: "${prompt}"
Aspect Ratio: ${aspect_ratio}
Version: ${version}${seed !== undefined ? `\nSeed: ${seed}` : ''}${image ? `\nInput Image: ${image}` : ''}

Generated Image:
  Original URL: ${output}`;

      if (localPath) {
        responseText += `\n  Local Path: ${localPath}`;
      }

      responseText += `\n\n${localPath ? 'Image has been downloaded to the local \'images\' directory.' : 'Note: Local download failed, but original URL is available.'}`;

      return {
        content: [
          {
            type: "text",
            text: responseText
          }
        ]
      };

    } catch (error) {
      console.error('Error generating image:', error);
      
      let errorMessage = "Failed to generate image with Reve Create.";
      
      if (error instanceof Error) {
        errorMessage += ` Error: ${error.message}`;
      }

      return {
        content: [
          {
            type: "text",
            text: errorMessage
          }
        ],
        isError: true
      };
    }
  }
);

// Graceful shutdown handlers
process.on('SIGINT', () => {
  console.error('Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.error('Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Reve Create MCP server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  // Don't exit the process, let it continue running
});
