import axios from 'axios';

// CKAN base URL for datastore search
const CKAN_DATASTORE_URL = 'https://data.gov.il/api/3/action/datastore_search';

/**
 * Registers real estate specific tools
 * @param {McpServer} mcp - MCP server instance
 */
export function registerRealEstateTools(mcp) {
  // Tool to calculate price per square meter for real estate transactions
  mcp.registerTool(
    'price_per_meter',
    {
      description: 'Calculate price per square meter for real estate transactions using data.gov.il resources',
      parameters: [
        { name: 'resource_id', type: 'string', description: 'CKAN resource ID containing real estate records', required: true },
        { name: 'gush', type: 'string', description: 'Block number (גוש) to filter by', required: false },
        { name: 'helka', type: 'string', description: 'Parcel number (חלקה) to filter by', required: false },
        { name: 'address', type: 'string', description: 'Street address to filter by', required: false },
        { name: 'gush_field', type: 'string', description: 'Field name for gush in the dataset', required: false, default: 'GUSH' },
        { name: 'helka_field', type: 'string', description: 'Field name for helka in the dataset', required: false, default: 'HELEKA' },
        { name: 'price_field', type: 'string', description: 'Field name containing the transaction price', required: false, default: 'PRICE' },
        { name: 'area_field', type: 'string', description: 'Field name containing the property area (sqm)', required: false, default: 'AREA' }
      ]
    },
    async ({ resource_id, gush, helka, address, gush_field = 'GUSH', helka_field = 'HELEKA', price_field = 'PRICE', area_field = 'AREA' }) => {
      const filters = {};
      if (gush) filters[gush_field] = gush;
      if (helka) filters[helka_field] = helka;
      if (address) filters['ADDRESS'] = address;

      const params = { resource_id, limit: 100 };
      if (Object.keys(filters).length) params.filters = JSON.stringify(filters);

      const { data } = await axios.get(CKAN_DATASTORE_URL, { params });
      if (!data.success) {
        throw new Error('Failed to fetch data from data.gov.il');
      }

      const results = data.result.records.map(record => {
        const price = parseFloat(record[price_field]);
        const area = parseFloat(record[area_field]);
        const pricePerMeter = price && area ? price / area : null;
        return {
          gush: record[gush_field],
          helka: record[helka_field],
          address: record['ADDRESS'] || record['address'] || null,
          price,
          area,
          price_per_meter: pricePerMeter
        };
      });

      return {
        text: JSON.stringify(results, null, 2)
      };
    }
  );
}

export default registerRealEstateTools;
