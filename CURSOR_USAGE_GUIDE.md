# Using data.gov.il MCP with Cursor

While Cursor doesn't have native support for external MCP servers like Claude Desktop does, you can still use this MCP server with Cursor through an HTTP wrapper.

## Quick Start

### 1. Install Dependencies

First, install the required dependencies:

```bash
npm install
```

### 2. Start the HTTP Server

Run the HTTP wrapper server that exposes the MCP tools as REST endpoints:

```bash
npm run http
```

Or for development with auto-reload:

```bash
npm run http:dev
```

The server will start on `http://localhost:3000` by default.

### 3. Use the API in Cursor

You can now interact with the Israeli government data API in several ways:

#### Option A: Direct HTTP Requests

You can make HTTP requests directly from your code or terminal:

```bash
# List available tools
curl http://localhost:3000/tools

# Search for tags
curl -X POST http://localhost:3000/tool/search_tags \
  -H "Content-Type: application/json" \
  -d '{"keyword": "תחבורה"}'

# Find datasets
curl -X POST http://localhost:3000/tool/find_datasets \
  -H "Content-Type: application/json" \
  -d '{"q": "תקציב עירייה", "limit": 5}'
```

#### Option B: Use the JavaScript Client

Use the provided client library in your code:

```javascript
import DataGovClient from './examples/cursor-client.js';

const client = new DataGovClient();

// Search for transportation data
const transportData = await client.searchTags('תחבורה');

// Find budget datasets
const budgetData = await client.findDatasets('תקציב עירייה');

// Get dataset details
const datasetInfo = await client.getDatasetInfo('branches');
```

#### Option C: Run Example Script

Run the example client to see all capabilities:

```bash
node examples/cursor-client.js
```

## Available Endpoints

### `GET /` - API Information
Returns general information about the API.

### `GET /tools` - List Available Tools
Returns all available MCP tools and their descriptions.

### `POST /tool/:name` - Execute Tool
Execute a specific tool with the provided arguments.

Available tools:
- `list_available_tags` - Explore curated tags by topic/category
- `search_tags` - Search for tags by Hebrew/English keyword
- `find_datasets` - Search for datasets by keywords
- `get_dataset_info` - Get detailed information about any dataset
- `search_records` - Extract and analyze actual data
- `list_organizations` - Browse government organizations
- `list_all_datasets` - List all available datasets

### `GET /examples` - Usage Examples
Returns example requests for common operations.

### `GET /health` - Health Check
Check if the server is running.

## Example Workflows in Cursor

### 1. Analyzing Municipal Budget Data

```javascript
// Start by finding relevant datasets
const datasets = await client.findDatasets('תקציב עירוני');

// Get detailed info about a specific dataset
const datasetId = datasets.result.results[0].id;
const info = await client.getDatasetInfo(datasetId);

// Search for specific records
const resourceId = info.result.resources[0].id;
const records = await client.searchRecords(resourceId, 'תל אביב', 100);
```

### 2. Exploring Healthcare Data

```javascript
// Search for health-related tags
const healthTags = await client.searchTags('בריאות');

// Find datasets with those tags
const healthDatasets = await client.findDatasets('בתי חולים');

// Get organization info
const healthOrgs = await client.listOrganizations({ 
  q: 'משרד הבריאות' 
});
```

### 3. Transportation Analysis

```javascript
// Find transportation datasets
const transport = await client.findDatasets('תחבורה ציבורית');

// Get dataset details
const busData = await client.getDatasetInfo('bus-routes');

// Search for specific routes
const routes = await client.searchRecords(
  busData.result.resources[0].id,
  'קו 1',
  50
);
```

## Tips for Using with Cursor

1. **Keep the HTTP server running** - The HTTP server needs to be running in a terminal for the API to work.

2. **Use environment variables** - You can set a custom port:
   ```bash
   PORT=8080 npm run http
   ```

3. **Error handling** - Always wrap API calls in try-catch blocks:
   ```javascript
   try {
     const data = await client.findDatasets('תקציב');
   } catch (error) {
     console.error('API Error:', error.message);
   }
   ```

4. **Hebrew text** - The API fully supports Hebrew searches and returns bilingual data.

5. **Rate limiting** - The data.gov.il API may have rate limits, so avoid making too many requests in quick succession.

## Troubleshooting

### Server won't start
- Make sure port 3000 is available or set a different port
- Check that all dependencies are installed: `npm install`

### Can't connect to API
- Verify the HTTP server is running: `npm run http`
- Check the server logs for any errors
- Try accessing `http://localhost:3000/health`

### Hebrew text issues
- Ensure your terminal/editor supports UTF-8 encoding
- Use proper Content-Type headers when making requests

## Advanced Usage

### Custom Tool Implementation

You can extend the client with custom methods:

```javascript
class ExtendedDataGovClient extends DataGovClient {
  async findEducationData(city) {
    const datasets = await this.findDatasets(`חינוך ${city}`);
    return datasets.result.results.filter(d => 
      d.organization?.title?.includes('חינוך')
    );
  }
  
  async analyzePopulationData(area) {
    const data = await this.findDatasets(`אוכלוסייה ${area}`);
    // Add your analysis logic here
    return processedData;
  }
}
```

### Batch Operations

Process multiple queries efficiently:

```javascript
async function batchSearch(queries) {
  const results = await Promise.all(
    queries.map(q => client.findDatasets(q, { limit: 3 }))
  );
  return results.map((r, i) => ({
    query: queries[i],
    count: r.result.count,
    topResults: r.result.results.slice(0, 3)
  }));
}

const topics = ['תקציב', 'חינוך', 'בריאות', 'תחבורה'];
const summary = await batchSearch(topics);
```

## Contributing

If you'd like to add Cursor-specific features or improvements:

1. Fork the repository
2. Create a feature branch
3. Add your improvements
4. Submit a pull request

## Support

For issues or questions:
- GitHub Issues: https://github.com/DavidOsherProceed/data-gov-il-mcp/issues
- data.gov.il documentation: https://data.gov.il/api/3/action/
