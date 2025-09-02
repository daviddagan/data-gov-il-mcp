/**
 * הגדרת השרת MCP הראשי עם תמיכה בPrompts
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerAllTools } from './tools/index.js';
import { registerPrompts } from './prompts/index.js';

/**
 * יוצר ומגדיר שרת MCP חדש עם Tools + Prompts
 * @param {Object} config - קונפיגורציה לשרת
 * @returns {McpServer} שרת MCP מוכן לשימוש
 */
export function createMcpServer(config = {}) {
  console.error('🚀 Creating MCP server...');
  
  // יצירת שרת עם קונפיגורציה ברירת מחדל
  const serverConfig = {
    name: "data-gov-il-js",
    version: "2.0.0",
    description: "MCP server for Israeli government data (data.gov.il) with tools and prompts",
    ...config
  };
  
  const mcp = new McpServer(serverConfig);
  
  console.error(`📋 Server info: ${serverConfig.name} v${serverConfig.version}`);
  console.error(`📝 Description: ${serverConfig.description}`);
  
  // רישום כל הכלים
  registerAllTools(mcp);
  
  // רישום כל ה-prompts
  registerPrompts(mcp);
  
  console.error('✅ MCP server created successfully with Tools + Prompts');
  console.error('🛠️  Tools: 9 data analysis tools');
  console.error('📝 Prompts: 3 expert analysis templates');
  
  return mcp;
}

/**
 * מחבר שרת MCP לtransport מסוים
 * @param {McpServer} mcp - שרת MCP
 * @param {Object} transport - transport (stdio/http)
 * @returns {Promise<void>}
 */
export async function connectServer(mcp, transport) {
  try {
    console.error('🔌 Connecting server to transport...');
    
    await mcp.connect(transport);
    
    console.error('✅ Server connected successfully!');
    console.error('🎯 Data.gov.il MCP server is ready to serve requests');
    console.error('🛠️  Available: Tools + Prompts for Israeli government data analysis');
    
  } catch (error) {
    console.error('❌ Failed to connect server:', error);
    throw error;
  }
}

/**
 * טיפול נקי בסגירת שרת
 * @param {McpServer} mcp - שרת MCP
 */
export function setupGracefulShutdown(mcp) {
  const shutdown = async (signal) => {
    console.error(`\n🛑 Received ${signal}, shutting down gracefully...`);
    
    try {
      // כאן ניתן להוסיף ניקוי נוסף בעתיד
      console.error('✅ Server shutdown completed');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  };
  
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  
  // טיפול בשגיאות לא צפויות
  process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
  });
}

/**
 * מידע על הסביבה והקונפיגורציה
 */
export function logEnvironmentInfo() {
  console.error('🔧 Environment Info:');
  console.error(`  Node.js: ${process.version}`);
  console.error(`  Platform: ${process.platform}`);
  console.error(`  Architecture: ${process.arch}`);
  console.error(`  Working Directory: ${process.cwd()}`);
  console.error(`  Process ID: ${process.pid}`);
  console.error('🆕 Features: Tools + Prompts + Multiple transports');
}