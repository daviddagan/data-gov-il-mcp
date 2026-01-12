/**
 * מרכז רישום כל הכלים - נקודת כניסה אחת לכל הtools
 */

import { registerFindDatasetsTool } from './find.js';
import { registerGetDatasetInfoTool } from './dataset_info.js';
import { registerListResourcesTool } from './resources.js';
import { registerSearchRecordsTool } from './search.js';
import { registerRealEstateTools } from './real_estate.js';
import { registerPropertyInsightsTool } from './property_insights.js';

/**
 * רושם את כל הכלים על שרת MCP
 * @param {McpServer} mcp - שרת MCP
 */
export function registerAllTools(mcp) {
  console.error('📋 Registering MCP tools (Real-Estate Focus)...');
  
  try {
  // Core discovery & extraction tools kept minimal for real-estate vertical
  registerFindDatasetsTool(mcp);      console.error('  ✅ find_datasets registered');
  registerGetDatasetInfoTool(mcp);    console.error('  ✅ get_dataset_info registered');
  registerListResourcesTool(mcp);     console.error('  ✅ list_resources registered');
  registerSearchRecordsTool(mcp);     console.error('  ✅ search_records registered');
    registerRealEstateTools(mcp);       console.error('  ✅ price_per_meter registered');
    registerPropertyInsightsTool(mcp);  // logs inside
  // TODO: registerPropertyInsightsTool(mcp)  ← coming soon
  console.error('� Real-estate focused toolset registered successfully!');
    
  } catch (error) {
    console.error('❌ Error registering tools:', error);
    throw error;
  }
}

/**
 * מידע על הכלים הזמינים (מעודכן עם כלים חדשים)
 */
export const AVAILABLE_TOOLS = {
  // Core tools (trimmed for real-estate focus)
  find_datasets: {
    description: '🔍 ENHANCED: Advanced search for datasets with sorting and filtering options.',
    parameters: ['query?', 'sort?', 'tags?'],
    examples: [
      'find_datasets with query="תקציב"',
      'find_datasets with query="budget" and sort="newest"',
      'find_datasets with query="municipality" and sort="popular"',
      'find_datasets with tags="transportation"',
      'find_datasets with query="health" and tags="medical" and sort="updated"'
    ],
    sortOptions: ['newest', 'relevance', 'popular', 'updated'],
    notes: 'At least one of query or tags is required. Sort options: newest (creation date), relevance (best match), popular (most viewed), updated (recently modified). Now works seamlessly with list_available_tags.'
  },

  get_dataset_info: {
    description: '📊 DETAILED: Get comprehensive information about a specific dataset including metadata, resources, and usage guidance.',
    parameters: ['dataset'],
    examples: [
      'get_dataset_info with dataset="branches"',
      'get_dataset_info with dataset="jerusalem-municipality-budget"', 
      'get_dataset_info with dataset="mechir-lamishtaken"'
    ],
    features: [
      'Complete metadata (creation date, last modified, views, tags)',
      'Organization information', 
      'Resource analysis (which ones are searchable)',
      'Ready-to-use resource IDs for search_records',
      'Data quality indicators',
      'Usage recommendations'
    ],
    notes: 'Perfect bridge between find_datasets and search_records. Shows exactly what data is available and how to access it.'
  },

  list_resources: {
    description: 'List resources for a specific dataset and get resource IDs for data access.',
    parameters: ['dataset', 'include_tracking?'],
    examples: [
      'list_resources with dataset="branches"',
      'list_resources with dataset="jerusalem-municipality-budget" and include_tracking=true'
    ],
    notes: 'Look for resources with datastore_active=true to use with search_records. Consider using get_dataset_info for more detailed analysis.'
  },
  
  search_records: {
    description: '🎯 POWERFUL: Search and extract actual data from government resources with advanced filtering, sorting, and pagination.',
    parameters: ['resource_id', 'q?', 'limit?', 'offset?', 'filters?', 'fields?', 'sort?', 'include_total?', 'distinct?'],
    examples: [
      'search_records with resource_id="2202bada-4baf-45f5-aa61-8c5bad9646d3" and limit=5',
      'search_records with resource_id="..." and q="תל אביב" and limit=20',
      'search_records with resource_id="..." and filters={"City": "תל אביב", "Type": "בנק"}',
      'search_records with resource_id="..." and fields=["Name", "City", "Address"] and sort=["Name asc"]',
      'search_records with resource_id="..." and distinct="City"'
    ],
    parameterDetails: {
      resource_id: 'UUID from list_resources or get_dataset_info (required). Must have datastore_active=true.',
      q: 'Free-text search across all fields. Supports Hebrew/English and partial matches.',
      limit: 'Number of results (1-1000). Use 5-10 for exploration, 100+ for analysis.',
      offset: 'Skip N results for pagination. Use with limit for paging.',
      filters: 'Exact matches as JSON. Examples: {"City": "תל אביב"}, {"City": ["תל אביב", "חיפה"]}',
      fields: 'Return specific fields only. Improves performance and reduces response size.',
      sort: 'Sort by fields. Format: ["field_name asc/desc"]. Multiple sorts supported.',
      include_total: 'Include total count for pagination planning.',
      distinct: 'Get unique values for a field (returns values, not full records).'
    },
    useCases: [
      'Data exploration: Basic search with small limit',
      'Analysis: Large limit with specific fields',
      'Geographic analysis: Filter by location, get distinct cities',
      'Financial data: Sort by amount, filter by date ranges',
      'Pagination: Use limit/offset with include_total',
      'Performance: Use fields parameter for large datasets'
    ],
    notes: 'This is the most powerful tool for actual data extraction. Always start with small limits to understand the data structure.'
    },
  price_per_meter: {
    description: '🏘️ Calculate price per square meter for real estate transactions',
    parameters: ['resource_id', 'gush?', 'helka?', 'address?', 'gush_field?', 'helka_field?', 'price_field?', 'area_field?'],
    examples: [
      'price_per_meter(resource_id="<resource_id>", gush="12345", helka="67")'
    ],
    notes: 'Uses data.gov.il datasets to compute price per meter for specific parcels or addresses.'
  }
};

/**
 * סטטיסטיקות על הכלים (מעודכן)
 */
export function getToolsInfo() {
  return {
    totalTools: Object.keys(AVAILABLE_TOOLS).length,
    toolNames: Object.keys(AVAILABLE_TOOLS),
    version: '2.0.0', // עדכון לגרסה חדשה עם כלי התגיות
    newFeatures: ['list_available_tags', 'search_tags']
  };
}

/**
 * זרימת עבודה מומלצת עם הכלים (מעודכנת)
 */
export const RECOMMENDED_WORKFLOW = {
  step1: {
    tool: 'find_datasets',
    purpose: 'Search for real-estate related datasets (transactions, prices, planning, environment)',
    example: 'find_datasets(query="נדלן" )'
  },
  step2: {
    tool: 'get_dataset_info',
    purpose: 'Inspect dataset metadata & locate searchable resources',
    example: 'get_dataset_info("mechir-lamishtaken")'
  },
  step3: {
    tool: 'list_resources',
    purpose: 'List resources and obtain resource IDs with datastore_active=true',
    example: 'list_resources(dataset="mechir-lamishtaken")'
  },
  step4: {
    tool: 'search_records',
    purpose: 'Query specific resource for transactions / attributes',
    example: 'search_records(resource_id="<uuid>", limit=5)'
  },
  step5: {
    tool: 'price_per_meter',
    purpose: 'Compute price per square meter for parcel/address',
    example: 'price_per_meter(resource_id="<uuid>", gush="12345", helka="67")'
  }
};

/**
 * זרימות עבודה אלטרנטיביות (מעודכנות)
 */
export const ALTERNATIVE_WORKFLOWS = {
  parcelValuation: {
    description: 'Evaluate parcel pricing quickly',
    steps: [
      'find_datasets(query="עסקאות נדלן")',
      'get_dataset_info',
      'list_resources',
      'search_records(filters={"GUSH": "<gush>", "HELKA": "<helka>"}, limit=20)',
      'price_per_meter(gush, helka)'
    ]
  },
  addressInvestigation: {
    description: 'Investigate an address across datasets',
    steps: [
      'find_datasets(query="כתובת" )',
      'search_records with address filter',
      'price_per_meter(address="<street house>")'
    ]
  },
  environmentalRisk: {
    description: 'Check environmental context around a parcel',
    steps: [
      'find_datasets(query="סביבה" )',
      'search_records (air quality / contaminated land resources)',
      'Integrate (future) property_insights for aggregated view'
    ]
  }
};

/**
 * קטגוריות כלים לפי שימוש (מעודכנות)
 */
export const TOOL_CATEGORIES = {
  discovery: {
    name: 'Real-Estate Discovery',
    tools: ['find_datasets'],
    purpose: 'Locate relevant real-estate & environmental datasets'
  },
  analysis: {
    name: 'Dataset Analysis', 
    tools: ['get_dataset_info', 'list_resources'],
    purpose: 'Inspect metadata & resource readiness'
  },
  extraction: {
    name: 'Data Extraction & Valuation',
    tools: ['search_records', 'price_per_meter'],
    purpose: 'Query raw records and compute derived indicators'
  }
};