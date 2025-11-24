# Reve Create MCP Server

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MCP](https://img.shields.io/badge/MCP-Model%20Context%20Protocol-blue)](https://modelcontextprotocol.io/)
[![Replicate](https://img.shields.io/badge/Replicate-Reve%20Create-green)](https://replicate.com/reve/create)

A Model Context Protocol (MCP) server that provides access to Reve Create - an image generation model from Reve that generates detailed visual output closely following your instructions, with strong aesthetic quality and accurate text rendering.

**🔗 Repository**: [https://github.com/PierrunoYT/fal-reve-mcp-server](https://github.com/PierrunoYT/fal-reve-mcp-server)

> **🚀 Ready to use!** Pre-built executable included - no compilation required.
>
> **✅ Enhanced Reliability**: Server handles missing API keys gracefully without crashes and includes robust error handling.

## Features

- **High-Quality Image Generation**: Uses Reve Create - image generation model from Reve via Replicate
- **Detailed Visual Output**: Generates images that closely follow your instructions
- **Strong Aesthetic Quality**: Produces visually appealing results
- **Accurate Text Rendering**: Superior text integration and rendering capabilities
- **Image Editing Support**: Optional image editing capabilities (edit any image with natural language)
- **Automatic Image Download**: Generated images are automatically saved to local `images` directory
- **Multiple Aspect Ratios**: Support for 16:9, 9:16, 3:2, 2:3, 4:3, 3:4, and 1:1
- **Reproducible Generation**: Optional seed parameter for consistent results
- **Version Control**: Specify model version (latest or specific version hash)
- **Detailed Responses**: Returns both local file paths and original URLs
- **Robust Error Handling**: Graceful handling of missing API keys without server crashes
- **Universal Portability**: Works anywhere with npx - no local installation required
- **Enhanced Reliability**: Graceful shutdown handlers and comprehensive error reporting

## Prerequisites

- Node.js 18 or higher
- Replicate API token

## Installation

### 1. Get your Replicate API Token

- Visit [Replicate](https://replicate.com/)
- Sign up for an account
- Navigate to [Account API Tokens](https://replicate.com/account/api-tokens)
- Generate an API token

### 2. Clone or Download

```bash
git clone https://github.com/PierrunoYT/fal-reve-mcp-server.git
cd fal-reve-mcp-server
```

### 3. Install Dependencies (Optional)

The server is pre-built, but if you want to modify it:

```bash
npm install
npm run build
```

## Configuration

### 🚀 Recommended: Universal npx Configuration (Works Everywhere)

**Best option for portability** - works on any machine with Node.js:

```json
{
  "mcpServers": {
    "reve-create": {
      "command": "npx",
      "args": [
        "-y",
        "https://github.com/PierrunoYT/fal-reve-mcp-server.git"
      ],
      "env": {
        "REPLICATE_API_TOKEN": "your-replicate-api-token-here"
      }
    }
  }
}
```

**Benefits:**
- ✅ **Universal Access**: Works on any machine with Node.js
- ✅ **No Local Installation**: npx downloads and runs automatically
- ✅ **Always Latest Version**: Pulls from GitHub repository
- ✅ **Cross-Platform**: Windows, macOS, Linux compatible
- ✅ **Settings Sync**: Works everywhere you use your MCP client

### Alternative: Local Installation

If you prefer to install locally, use the path helper:

```bash
npm run get-path
```

This will output the complete MCP configuration with the correct absolute path.

#### For Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "reve-create": {
      "command": "node",
      "args": ["path/to/fal-reve-mcp-server/build/index.js"],
      "env": {
        "REPLICATE_API_TOKEN": "your-replicate-api-token-here"
      }
    }
  }
}
```

#### For Kilo Code MCP Settings

Add to your MCP settings file at:
`C:\Users\[username]\AppData\Roaming\Kilo-Code\MCP\settings\mcp_settings.json`

```json
{
  "mcpServers": {
    "reve-create": {
      "command": "node",
      "args": ["path/to/fal-reve-mcp-server/build/index.js"],
      "env": {
        "REPLICATE_API_TOKEN": "your-replicate-api-token-here"
      },
      "disabled": false,
      "alwaysAllow": []
    }
  }
}
```

## Available Tools

### `reve_create`

Generate or edit images using Reve Create model from Replicate.

**Parameters:**
- `prompt` (required): Text prompt for image generation
- `aspect_ratio` (optional): "16:9", "9:16", "3:2", "2:3", "4:3", "3:4", or "1:1" (default: "3:2")
- `version` (optional): The specific model version to use (e.g., "latest" or a version hash) (default: "latest")
- `seed` (optional): Random seed for reproducible generation (integer)
- `image` (optional): Image file path or URL for image editing. If provided, the model will edit the image based on the prompt instead of generating from scratch (format: uri)

**Response includes:**
- Image URL for immediate access
- Local file path for downloaded image
- Generation parameters used

**Use Cases:**
- **Text-to-Image**: Generate images from text descriptions
- **Image Editing**: Edit existing images with natural language instructions (when `image` parameter is provided)
- **Reproducible Results**: Use `seed` parameter for consistent outputs

## 📥 **How Image Download Works**

The FAL Reve MCP server automatically downloads generated images to your local machine. Here's the complete process:

### **1. Image Generation Flow**
1. **API Call**: Server calls FAL AI's Reve API
2. **Response**: FAL returns temporary URLs for generated images
3. **Auto-Download**: Server immediately downloads images to local storage
4. **Response**: Returns both local paths and original URLs

### **2. Download Implementation**

#### **Download Function** ([`downloadImage`](src/index.ts:37-71)):
```typescript
async function downloadImage(url: string, filename: string): Promise<string> {
  // 1. Parse the URL and determine HTTP/HTTPS client
  const parsedUrl = new URL(url);
  const client = parsedUrl.protocol === 'https:' ? https : http;
  
  // 2. Create 'images' directory if it doesn't exist
  const imagesDir = path.join(process.cwd(), 'images');
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }
  
  // 3. Create file write stream
  const filePath = path.join(imagesDir, filename);
  const file = fs.createWriteStream(filePath);
  
  // 4. Download and pipe to file
  client.get(url, (response) => {
    response.pipe(file);
    // Handle completion and errors
  });
}
```

#### **Filename Generation** ([`generateImageFilename`](src/index.ts:79-89)):
```typescript
function generateImageFilename(prompt: string, index: number): string {
  // Creates safe filename: reve_prompt_index_timestamp.png
  const safePrompt = prompt
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')  // Remove special characters
    .replace(/\s+/g, '_')         // Replace spaces with underscores
    .substring(0, 50);            // Limit length
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `reve_${safePrompt}_${index}_${timestamp}.png`;
}
```

### **3. File Storage Details**

#### **Directory Structure:**
```
your-project/
├── images/                    # Auto-created directory
│   ├── reve_mountain_landscape_1_2025-06-24T18-30-45-123Z.png
│   ├── reve_cute_robot_1_2025-06-24T18-31-20-456Z.png
│   └── ...
```

#### **Filename Format:**
- **Prefix**: `reve_`
- **Prompt**: First 50 chars, sanitized (alphanumeric + underscores)
- **Index**: Image number
- **Timestamp**: ISO timestamp for uniqueness
- **Extension**: `.png` (Replicate returns PNG format)

### **4. Response Format**

The server returns both local and remote information:
```
Successfully generated image using Reve Create:

Prompt: "a serene mountain landscape with text 'REVE' painted in white"
Aspect Ratio: 3:2
Version: latest

Generated Image:
  Original URL: https://replicate.delivery/xezq/...
  Local Path: /path/to/project/images/reve_a_serene_mountain_landscape_1_2025-06-24T18-30-45-123Z.png

Image has been downloaded to the local 'images' directory.
```

## Example Usage

### Basic Image Generation
```
Generate a photorealistic image of a golden retriever playing in a field of sunflowers with the text "HAPPY DOG" written in bold letters
```

### With Specific Parameters
```
Generate an image with:
- Prompt: "A minimalist logo design for a tech startup, clean lines, with 'STARTUP' text"
- Aspect ratio: 16:9
- Version: latest
```

### Reproducible Generation
```
Generate an image with:
- Prompt: "A serene mountain landscape at sunset"
- Aspect ratio: 3:2
- Seed: 42
```

### Image Editing
```
Edit an image:
- Image: /path/to/image.jpg
- Prompt: "Move her to a sunny beach"
- Aspect ratio: 3:2
```

### Text-Heavy Prompts (Reve Specialty)
```
Create an image of a vintage bookstore with multiple book spines showing titles like "The Art of Code", "Digital Dreams", and "Future Stories" clearly readable
```

### Advanced Usage with Text Rendering
```
Generate an image: "A futuristic cityscape at night with neon lights and flying cars, large billboard displaying 'FUTURE CITY 2025'" 
with aspect ratio 16:9
```

## Technical Details

### Architecture
- **Language**: TypeScript with ES2022 target
- **Runtime**: Node.js 18+ with ES modules
- **Protocol**: Model Context Protocol (MCP) SDK v1.0.0
- **API Client**: Replicate JavaScript client
- **Validation**: Zod schema validation

### API Endpoints Used
- **Image Generation**: `reve/create` model via Replicate API

### Error Handling
- **Graceful API key handling**: Server continues running even without REPLICATE_API_TOKEN set
- **No crash failures**: Removed `process.exit()` calls that caused connection drops
- **Null safety checks**: All tools validate API client availability before execution
- **Graceful shutdown**: Proper SIGINT and SIGTERM signal handling
- **API error catching**: Comprehensive error reporting with detailed context
- **User-friendly messages**: Clear error descriptions instead of technical crashes

## Development

### Project Structure
```
├── src/
│   └── index.ts          # Main MCP server implementation
├── build/                # Compiled JavaScript (ready to use)
├── test-server.js        # Server testing utility
├── get-path.js          # Configuration path helper
├── example-mcp-config.json # Example configuration
├── package.json         # Project metadata and dependencies
└── tsconfig.json        # TypeScript configuration
```

### Scripts
- `npm run build` - Compile TypeScript to JavaScript
- `npm run dev` - Watch mode for development
- `npm run start` - Start the server directly
- `npm run test` - Test server startup and basic functionality
- `npm run get-path` - Get configuration path for your system

### Making Changes
1. Edit files in the `src/` directory
2. Run `npm run build` to compile
3. Restart your MCP client to use the updated server

### Testing
```bash
npm run test
```

This runs a basic connectivity test that verifies:
- Server starts correctly
- MCP protocol initialization
- Tool discovery functionality

## API Costs

This server uses the Replicate platform, which charges per image generation. Check [Replicate pricing](https://replicate.com/pricing) for current rates.

**Typical costs**:
- Reve Create: Check [Replicate pricing](https://replicate.com/pricing) for current rates
- Costs vary by model version and complexity
- Visit [Replicate Reve Create page](https://replicate.com/reve/create) for detailed pricing

## Troubleshooting

### Server not appearing in MCP client
1. **Recommended**: Use the npx configuration for universal compatibility
2. If using local installation, verify the path to `build/index.js` is correct and absolute
3. Ensure Node.js 18+ is installed: `node --version`
4. Test server startup: `npm run test`
5. Restart your MCP client (Claude Desktop, Kilo Code, etc.)
6. **Note**: Server will start successfully even without REPLICATE_API_TOKEN - check tool responses for API token errors

### Image generation failing
1. Verify your Replicate API token is valid and has sufficient credits
2. Check that your prompt follows Replicate's content policy
3. Try simplifying the prompt or using a different aspect ratio
4. Check the server logs for detailed error messages
5. Ensure the Reve Create model is available: [replicate.com/reve/create](https://replicate.com/reve/create)
6. Verify your account has sufficient balance on Replicate

### Build issues
If you need to rebuild the server:
```bash
npm install
npm run build
```

### Configuration issues
Use the helper script to get the correct path:
```bash
npm run get-path
```

## Support

For issues with:
- **This MCP server**: Create an issue in this repository
- **Replicate API**: Check [Replicate documentation](https://replicate.com/docs)
- **Reve Create Model**: Visit [Replicate Reve Create page](https://replicate.com/reve/create)
- **MCP Protocol**: See [MCP documentation](https://modelcontextprotocol.io/)

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `npm run test`
5. Submit a pull request

## Changelog

### v1.0.0
- **🚀 Initial release**: Reve Create support via Replicate
- **📥 Automatic image download**: Generated images are automatically saved to local `images` directory
- **🗂️ Smart filename generation**: Images saved with descriptive names including prompt and timestamp
- **🔄 Enhanced responses**: Returns both local file paths and original URLs for maximum flexibility
- **📁 Auto-directory creation**: Creates `images` folder automatically if it doesn't exist
- **🛡️ Download error handling**: Graceful fallback to original URLs if local download fails
- **🎨 Accurate text rendering**: Superior text integration capabilities with Reve Create
- **⚙️ Comprehensive controls**: Full parameter support including aspect ratios, version, and seed
- **📐 Multiple aspect ratios**: Support for 7 different aspect ratios (16:9, 9:16, 3:2, 2:3, 4:3, 3:4, 1:1)
- **🎯 Reproducible generation**: Seed parameter support for consistent results
- **🖼️ Image editing**: Optional image editing support with natural language prompts
- **🔧 Robust error handling**: Graceful shutdown handlers and comprehensive error reporting
- **🌍 Universal portability**: Works everywhere with npx configuration