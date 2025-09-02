/**
 * Example client for using the data.gov.il MCP server via HTTP from Cursor
 * 
 * Usage:
 * 1. First, start the HTTP server: npm run http
 * 2. Then run this script: node examples/cursor-client.js
 */

import axios from 'axios';

const API_BASE = 'http://localhost:3000';

// Helper function to call a tool
async function callTool(toolName, args = {}) {
  try {
    const response = await axios.post(`${API_BASE}/tool/${toolName}`, args);
    return response.data;
  } catch (error) {
    console.error(`Error calling tool ${toolName}:`, error.response?.data || error.message);
    throw error;
  }
}

// Example functions for common operations
class DataGovClient {
  // List all available tags
  async listTags() {
    const result = await callTool('list_available_tags');
    console.log('📋 Available Tags:', result);
    return result;
  }

  // Search for tags by keyword
  async searchTags(keyword) {
    const result = await callTool('search_tags', { keyword });
    console.log(`🔍 Tags matching "${keyword}":`, result);
    return result;
  }

  // Find datasets
  async findDatasets(query, options = {}) {
    const result = await callTool('find_datasets', { 
      q: query,
      ...options 
    });
    console.log(`📊 Datasets for "${query}":`, result);
    return result;
  }

  // Get dataset information
  async getDatasetInfo(datasetId) {
    const result = await callTool('get_dataset_info', { 
      dataset_id: datasetId 
    });
    console.log(`ℹ️ Dataset info for "${datasetId}":`, result);
    return result;
  }

  // Search records in a resource
  async searchRecords(resourceId, query, limit = 10) {
    const result = await callTool('search_records', {
      resource_id: resourceId,
      q: query,
      limit
    });
    console.log(`🔎 Records matching "${query}":`, result);
    return result;
  }

  // List organizations
  async listOrganizations(options = {}) {
    const result = await callTool('list_organizations', options);
    console.log('🏛️ Organizations:', result);
    return result;
  }

  // List all available tools
  async listTools() {
    const response = await axios.get(`${API_BASE}/tools`);
    console.log('🛠️ Available tools:', response.data);
    return response.data;
  }
}

// Example usage
async function main() {
  const client = new DataGovClient();
  
  console.log('🚀 Data.gov.il Client Example\n');
  console.log('================================\n');

  try {
    // 1. List available tools
    console.log('1️⃣ Listing available tools...\n');
    await client.listTools();
    console.log('\n---\n');

    // 2. Search for transportation-related tags
    console.log('2️⃣ Searching for transportation tags...\n');
    await client.searchTags('תחבורה');
    console.log('\n---\n');

    // 3. Find datasets about municipal budgets
    console.log('3️⃣ Finding municipal budget datasets...\n');
    await client.findDatasets('תקציב עירייה', { limit: 5 });
    console.log('\n---\n');

    // 4. Get information about a specific dataset (if you know the ID)
    // Example: Bank branches dataset
    console.log('4️⃣ Getting info about bank branches dataset...\n');
    await client.getDatasetInfo('branches');
    console.log('\n---\n');

    // 5. List some organizations
    console.log('5️⃣ Listing government organizations...\n');
    await client.listOrganizations({ limit: 5 });
    
  } catch (error) {
    console.error('❌ Error in example:', error.message);
  }
}

// Run the example if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

// Export for use in other scripts
export default DataGovClient;
