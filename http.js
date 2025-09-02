#!/usr/bin/env node
import express from 'express';
import { randomUUID } from 'node:crypto';
import cors from 'cors';
import { config } from 'dotenv';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { createMcpServer, setupGracefulShutdown, logEnvironmentInfo } from './src/server.js';

// Load environment variables
config();

const PORT = process.env.PORT || 3664;
const HOST = process.env.HOST || '0.0.0.0';
const SERVICE_NAME = process.env.SERVICE_NAME || 'data-gov-il-mcp';
const SERVICE_VERSION = process.env.SERVICE_VERSION || '1.2.0';
const SERVICE_DESCRIPTION = process.env.SERVICE_DESCRIPTION || 'MCP server for data.gov.il';

async function main() {
  try {
    logEnvironmentInfo();
    console.error('🌐 Starting HTTP server mode...');
    
    // Create MCP server
    const mcp = createMcpServer({
      name: SERVICE_NAME,
      version: SERVICE_VERSION,
      description: SERVICE_DESCRIPTION
    });
    
    setupGracefulShutdown(mcp);
    
    // Create Express app
    const app = express();
    
    // CORS configuration
    app.use(cors({
      origin: '*',
      exposedHeaders: ['Mcp-Session-Id'],
      allowedHeaders: ['Content-Type', 'mcp-session-id']
    }));
    
    app.use(express.json());

    // Store transports by session ID
    const transports = {};

    // Handle POST requests for client-to-server communication
    app.post('/mcp', async (req, res) => {
      try {
        const sessionId = req.headers['mcp-session-id'];
        let transport;

        if (sessionId && transports[sessionId]) {
          // Reuse existing transport
          transport = transports[sessionId];
        } else if (!sessionId && isInitializeRequest(req.body)) {
          // New initialization request
          transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: () => randomUUID(),
            onsessioninitialized: (sessionId) => {
              transports[sessionId] = transport;
              console.error(`📡 New MCP session initialized: ${sessionId}`);
            },
            enableDnsRebindingProtection: true,
            allowedHosts: ['127.0.0.1', 'localhost', `localhost:${PORT}`]
          });

          // Clean up transport when closed
          transport.onclose = () => {
            if (transport.sessionId) {
              console.error(`📡 MCP session closed: ${transport.sessionId}`);
              delete transports[transport.sessionId];
            }
          };

          // Connect to MCP server
          await mcp.connect(transport);
          console.error('✅ MCP server connected via Streamable HTTP');
        } else {
          // Invalid request
          res.status(400).json({
            jsonrpc: '2.0',
            error: {
              code: -32000,
              message: 'Bad Request: No valid session ID provided',
            },
            id: null,
          });
          return;
        }

        // Handle the request
        await transport.handleRequest(req, res, req.body);
        
      } catch (error) {
        console.error('❌ Error handling MCP request:', error);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Failed to handle MCP request' });
        }
      }
    });

    // Handle GET and DELETE requests with shared logic
    const handleSessionRequest = async (req, res) => {
      const sessionId = req.headers['mcp-session-id'];
      if (!sessionId || !transports[sessionId]) {
        res.status(400).send('Invalid or missing session ID');
        return;
      }
      
      const transport = transports[sessionId];
      await transport.handleRequest(req, res);
    };

    // Handle GET requests for server-to-client notifications
    app.get('/mcp', handleSessionRequest);

    // Handle DELETE requests for session termination
    app.delete('/mcp', handleSessionRequest);

    // Health check
    app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        server: 'data-gov-il-mcp',
        version: '1.2.0',
        transport: 'streamable-http'
      });
    });
    
    // Server info
    app.get('/', (req, res) => {
      res.json({
        name: 'Data.gov.il MCP Server',
        version: '1.2.0',
        description: 'MCP server for Israeli Government Open Data',
        transport: 'streamable-http',
        endpoints: {
          mcp: '/mcp',
          health: '/health'
        }
      });
    });
    
    // Start the server
    const server = app.listen(PORT, HOST, () => {
      console.error(`🚀 Data.gov.il MCP Server is running!`);
      console.error(`🌐 Server: http://${HOST}:${PORT}`);
      console.error(`🔌 MCP endpoint: http://${HOST}:${PORT}/mcp`);
      console.error(`🏥 Health check: http://${HOST}:${PORT}/health`);
    });
    
    // Graceful shutdown
    process.on('SIGINT', () => {
      console.error('\n🛑 Shutting down HTTP server...');
      server.close(() => {
        console.error('✅ HTTP server closed');
        process.exit(0);
      });
    });
    
  } catch (error) {
    console.error('❌ Failed to start HTTP server:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('❌ HTTP server startup error:', error);
  process.exit(1);
});
