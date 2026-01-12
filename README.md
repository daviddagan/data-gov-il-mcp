
# Real-Estate Focused data.gov.il MCP Server

[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-blue)](https://modelcontextprotocol.io/) [![License: MIT-NC](https://img.shields.io/badge/license-MIT--NC-blue)](LICENSE)
 ![Version](https://img.shields.io/badge/version-2.1.0-blue)

🇮🇱 **Vertical MCP server specialized for Israeli Real Estate & Parcel Intelligence via data.gov.il**

Purpose-built to let AI assistants (Claude, Cursor, etc.) discover and analyze Israeli real-estate related open data: parcel (גוש/חלקה) information, transaction & pricing datasets, environmental context, and early-stage valuation signals.

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

## 🛠️ Toolset (Real-Estate Focus)

Minimal, opinionated set covering discovery → inspection → extraction → valuation → aggregated insight.

| Tool | Purpose |
|------|---------|
| 🔍 `find_datasets` | Search for candidate datasets (keywords in Hebrew/English) |
| 📊 `get_dataset_info` | Inspect metadata & searchable resources (datastore_active) |
| 📁 `list_resources` | List resource IDs for a dataset |
| 🎯 `search_records` | Query raw records with q / filters / fields / sort |
| 🏘️ `price_per_meter` | Compute price per square meter for parcel/address |
| 🏠 `property_insights` | Aggregated multi-category context (pricing, parcels, environment, population, transportation, religion, education, services, socioeconomic) |

Removed generic exploration tools (tags, organizations, full dataset dump) to keep responses focused and fast.
  

## 💡 Example Usage (Real-Estate Flow)

```javascript
// 1. Find real-estate / transactions datasets
find_datasets(query="נדלן")

// 2. Inspect a promising dataset
get_dataset_info(dataset="mechir-lamishtaken")

// 3. List resources & pick a datastore_active resource
list_resources(dataset="mechir-lamishtaken")

// 4. Sample records for a parcel
search_records(resource_id="<uuid>", filters={"GUSH": "12345", "HELKA": "67"}, limit=5)

// 5. Compute price per meter
price_per_meter(resource_id="<uuid>", gush="12345", helka="67")

// 6. Aggregated insight (address OR gush+helka OR lat+lng)
property_insights(gush="12345", helka="67")
```

## 🚀 What's New (Real-Estate Edition)

- ✂️ Trimmed non-real-estate tools for leaner workflow
- 🏠 Added `property_insights` aggregated context tool (pricing, parcels, environment, population, transportation, religion, education, services, socioeconomic)
- 🏘️ Improved valuation path via `price_per_meter`
- 🔍 Tuned dataset search patterns for גוש/חלקה & pricing keywords
- 📦 Modular design ready for future zoning, demographics & news integrations

## 🌐 About

This server connects to [data.gov.il](https://data.gov.il) (CKAN) focusing on datasets containing:
* Real estate transactions & government price programs (e.g. מחיר למשתכן)
* Parcel / cadastral references (GUSH / HELKA)
* Environmental indicators (air quality, contamination)
* Potential expansion: planning decisions, socioeconomic context

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
