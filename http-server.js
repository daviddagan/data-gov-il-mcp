#!/usr/bin/env node
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerAllTools } from './src/tools/index.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Store tools registry
const toolsRegistry = {};

// Create custom MCP server that captures tools
const mcp = new McpServer({
  name: "data-gov-il-http",
  version: "1.0.0",
  description: "HTTP wrapper for data.gov.il MCP server"
});

// Override the tool registration method to capture tools
const originalTool = mcp.tool.bind(mcp);
mcp.tool = function(name, schema, handler) {
  // Register in MCP as normal
  originalTool(name, schema, handler);
  
  // Store in our registry for HTTP access
  toolsRegistry[name] = {
    name,
    schema,
    handler,
    description: schema._def?.description || 'No description available'
  };
};

// Now register all tools (this will populate our registry)
registerAllTools(mcp);

// Helper function to get tool by name
function getTool(toolName) {
  return toolsRegistry[toolName];
}

// Static UI at /ui
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, 'public');

app.use('/ui', express.static(publicDir));
app.get('/ui', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: "Data.gov.il HTTP API",
    version: "1.0.0",
    description: "HTTP wrapper for Israeli Government Open Data MCP server",
    endpoints: [
      "/tools - List all available tools",
      "/tool/:name - Execute a specific tool",
      "/health - Health check"
    ]
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// List available tools
app.get('/tools', (req, res) => {
  try {
    const toolList = Object.keys(toolsRegistry).map(name => ({
      name,
      description: toolsRegistry[name].description,
      schema: toolsRegistry[name].schema
    }));
    
    res.json({
      tools: toolList,
      count: toolList.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Execute a tool
app.post('/tool/:name', async (req, res) => {
  const { name } = req.params;
  const args = req.body;
  
  try {
    const tool = getTool(name);
    
    if (!tool) {
      return res.status(404).json({ 
        error: `Tool '${name}' not found`,
        availableTools: Object.keys(toolsRegistry)
      });
    }
    
    // Execute the tool handler
    const result = await tool.handler(args);
    
    res.json({
      tool: name,
      arguments: args,
      result: result
    });
    
  } catch (error) {
    console.error(`Error executing tool '${name}':`, error);
    res.status(500).json({ 
      error: error.message,
      tool: name,
      arguments: args
    });
  }
});

// Example usage endpoint
app.get('/examples', (req, res) => {
  res.json({
    examples: [
      {
        description: "List available tags",
        method: "POST",
        url: "/tool/list_available_tags",
        body: {}
      },
      {
        description: "Search for transportation tags",
        method: "POST", 
        url: "/tool/search_tags",
        body: { keyword: "תחבורה" }
      },
      {
        description: "Find datasets about municipal budgets",
        method: "POST",
        url: "/tool/find_datasets",
        body: { query: "תקציב עירייה", sort: "popular" }
      },
      {
        description: "Get info about bank branches dataset",
        method: "POST",
        url: "/tool/get_dataset_info",
        body: { dataset: "branches" }
      },
      {
        description: "Search for banks in Tel Aviv",
        method: "POST",
        url: "/tool/search_records",
        body: {
          resource_id: "2202bada-4baf-45f5-aa61-8c5bad9646d3",
          q: "תל אביב",
          limit: 10
        }
      }
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Data.gov.il HTTP server running on http://localhost:${PORT}`);
  console.log(`📋 View available tools at http://localhost:${PORT}/tools`);
  console.log(`💡 See examples at http://localhost:${PORT}/examples`);
});
