/**
 * Cursor Demo - How to use data.gov.il MCP in Cursor
 * 
 * This script demonstrates how to access Israeli government data
 * from within Cursor using the HTTP wrapper.
 * 
 * Prerequisites:
 * 1. Start the HTTP server: npm run http
 * 2. Run this script: node examples/cursor-demo.js
 */

import axios from 'axios';

const API_BASE = 'http://localhost:3000';

// Simple function to call any tool
async function callTool(toolName, args = {}) {
  try {
    const response = await axios.post(`${API_BASE}/tool/${toolName}`, args);
    return response.data.result;
  } catch (error) {
    console.error(`Error calling ${toolName}:`, error.response?.data || error.message);
    return null;
  }
}

// Format content blocks for display
function displayContent(result) {
  if (result?.content) {
    result.content.forEach(block => {
      console.log(block.text);
      console.log('---\n');
    });
  }
}

async function main() {
  console.log('🇮🇱 Israeli Government Data Explorer\n');
  console.log('=====================================\n');
  
  // Example 1: Explore available topics
  console.log('📋 Example 1: Exploring Available Topics\n');
  const tags = await callTool('list_available_tags', { 
    category: 'health_welfare' 
  });
  displayContent(tags);
  
  // Example 2: Search for specific datasets
  console.log('🔍 Example 2: Finding Healthcare Datasets\n');
  const healthData = await callTool('find_datasets', {
    query: 'בתי חולים',
    sort: 'popular',
    limit: 3
  });
  displayContent(healthData);
  
  // Example 3: Get detailed dataset information
  console.log('📊 Example 3: Getting Dataset Details\n');
  // Note: You'd need to use an actual dataset ID from the previous search
  const datasetInfo = await callTool('get_dataset_info', {
    dataset: 'branches'  // Bank branches dataset
  });
  
  if (datasetInfo?.content) {
    // Show just the first block (basic info)
    console.log(datasetInfo.content[0].text);
    console.log('---\n');
  }
  
  // Example 4: Search for specific records
  console.log('🔎 Example 4: Searching for Banks in Tel Aviv\n');
  const records = await callTool('search_records', {
    resource_id: '2202bada-4baf-45f5-aa61-8c5bad9646d3',  // Bank branches resource
    q: 'תל אביב',
    limit: 5
  });
  
  if (records?.content) {
    const dataBlock = records.content.find(b => b.text.includes('Records found'));
    if (dataBlock) {
      console.log(dataBlock.text.split('\n').slice(0, 20).join('\n'));
      console.log('... (truncated for demo)\n');
    }
  }
  
  // Example 5: List government organizations
  console.log('🏛️ Example 5: Government Organizations\n');
  const orgs = await callTool('list_organizations', {});
  if (orgs?.content) {
    const orgText = orgs.content[0].text;
    const lines = orgText.split('\n');
    console.log(lines.slice(0, 10).join('\n'));
    console.log('... (showing first 10 organizations)\n');
  }
  
  console.log('✅ Demo Complete!\n');
  console.log('💡 Tips for using in Cursor:\n');
  console.log('1. Keep the HTTP server running (npm run http)');
  console.log('2. Use the callTool function to access any MCP tool');
  console.log('3. Check CURSOR_USAGE_GUIDE.md for more examples');
  console.log('4. Explore the data using Hebrew or English keywords');
}

// Run the demo
main().catch(console.error);
