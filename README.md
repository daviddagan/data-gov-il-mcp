
# Data.gov.il MCP Server

[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-blue)](https://modelcontextprotocol.io/) [![License: MIT-NC](https://img.shields.io/badge/license-MIT--NC-blue)](LICENSE)
 ![Version](https://img.shields.io/badge/version-2.1.0-blue)

 🇮🇱 **MCP server for accessing Israeli Government Open Data through data.gov.il**

Enables Claude and other AI assistants to search, discover, and analyze thousands of government datasets from Israel's open data portal.

<img width="1920" height="544" alt="Gemini_Generated_Image_2ma5vu2ma5vu2ma5" src="https://github.com/user-attachments/assets/a597c2cc-783e-40e3-aaf4-3cf681072dcc" />


## ⚡ Quick Start

### Installation
```bash
# Clone and install
git clone https://github.com/DavidOsherProceed/data-gov-il-mcp.git
cd data-gov-il-mcp
npm install
```

### Option 1: Claude Desktop Setup
Add to your Claude Desktop config:

```json
{
  "mcpServers": {
    "data-gov-il": {
      "command": "node",
      "args": ["/path/to/data-gov-il-mcp/stdio.js"]
    }
  }
}
```

Restart Claude Desktop and look for the 🔧 MCP tools icon.

### Option 2: Using with Cursor (NEW!)
Cursor doesn't have native MCP support, but you can use our HTTP wrapper:

```bash
# Start the HTTP server
npm run http

# In your Cursor project, make HTTP requests to localhost:3000
# See CURSOR_USAGE_GUIDE.md for detailed instructions
```

Quick example:
```javascript
// Use in any JavaScript file in Cursor
const response = await fetch('http://localhost:3000/tool/find_datasets', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: 'תקציב עירייה' })
});
const data = await response.json();
```

See [CURSOR_USAGE_GUIDE.md](CURSOR_USAGE_GUIDE.md) for complete documentation.

## 🛠️ Available Tools (v2.0.0)
## 🛠️ Available Tools (v2.1.0)

## 🛠️ Available Tools (v2.1.0)

### Data Discovery & Search
- **🏷️ list_available_tags** – Explore curated tags by topic/category
- **🔍 search_tags** – Search for tags by Hebrew/English keyword
- **🔍 find_datasets** - Search for datasets by keywords (Hebrew/English)
- **📊 get_dataset_info** - Get detailed information about any dataset  
- **🎯 search_records** - Extract and analyze actual data
- **🏘️ price_per_meter** - Calculate price per square meter for parcels
- **🏛️ list_organizations** - Browse government organizations
- **📋 list_all_datasets** - List all available datasets

### NEW! Expert Analysis Prompts
- **🍎 food-nutrition-analysis** - Food industry and nutrition data expert
- **🌱 environmental-sustainability-analysis** - Environmental data analysis
- **🏘️ real-estate-market-analysis** - Real estate market insights
  

## 💡 Example Usage

```javascript
// Explore tag-based categories
list_available_tags()

// Search for tags
search_tags("תחבורה")

// Find municipal budget data
find_datasets("תקציב עירייה")

// Get info about bank branches dataset
get_dataset_info("branches")

// Search for banks in Tel Aviv
search_records(resource_id="2202bada-4baf-45f5-aa61-8c5bad9646d3", 
               q="תל אביב", limit=10)
```

## � What's New in v2.1.0

- **Expert Analysis Prompts**: New AI-powered domain experts for:
  - Food & Nutrition Analysis
  - Environmental Sustainability
  - Real Estate Market Insights
- **Enhanced Performance**: Improved data retrieval and analysis
- **Better Hebrew Support**: Enhanced Hebrew text processing
- **Updated Dependencies**: Latest MCP SDK and core libraries
- **Real Estate Price Tool**: Compute price per meter for parcels using data.gov.il

## 🌐 About

This server connects to [data.gov.il](https://data.gov.il) - Israel's national open data portal with datasets from:
- Government ministries (Health, Finance, Transportation, etc.)
- Local authorities and municipalities  
- Public companies and regulatory bodies

Uses the CKAN API for real-time access to live government data.

## 📋 Requirements

- Node.js 18+
- Claude Desktop or any MCP-compatible client
- Internet connection

## 🤝 Contributing

Issues and pull requests welcome! This is an open source project to make Israeli government data more accessible.

## 📄 License

MIT License - see [LICENSE](LICENSE) file.

---
<div align="center">

Made with ❤️ by **David Osher** for the Israeli open data community 🇮🇱

[GitHub](https://github.com/DavidOsherProceed)

</div>
