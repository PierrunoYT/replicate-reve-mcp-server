#!/usr/bin/env node

// Simple script to get the absolute path for MCP configuration
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serverPath = join(__dirname, 'build', 'index.js');

console.log('=== Reve Create MCP Server Configuration ===\n');
console.log('🎨 Image Generation with Reve Create\n');

console.log('🚀 Universal npx Configuration (Works Everywhere)\n');

const config = {
  "mcpServers": {
    "reve-create": {
      "command": "npx",
      "args": [
        "-y",
        "https://github.com/PierrunoYT/fal-reve-mcp-server.git"
      ],
      "env": {
        "REPLICATE_API_TOKEN": "YOUR_REPLICATE_API_TOKEN_HERE"
      }
    }
  }
};

console.log(JSON.stringify(config, null, 2));

console.log('\n=== Available Tools ===');
console.log('📸 reve_create - Generate or edit images from text prompts');

console.log('\n=== Instructions ===');
console.log('1. Get your Replicate API token from https://replicate.com/account/api-tokens');
console.log('2. Replace "YOUR_REPLICATE_API_TOKEN_HERE" with your actual API token');
console.log('3. Add this configuration to your MCP settings file');
console.log('4. Restart your MCP client');
console.log('\n✅ Benefits of npx configuration:');
console.log('  • Works on any machine with Node.js');
console.log('  • No local installation required');
console.log('  • Always uses the latest version');
console.log('  • Cross-platform compatible');
console.log('\n🎨 Reve Create Features:');
console.log('  • Image generation model from Reve');
console.log('  • Detailed visual output closely following instructions');
console.log('  • Strong aesthetic quality');
console.log('  • Accurate text rendering');
console.log('  • Multiple aspect ratios');
console.log('  • Optional image editing support');