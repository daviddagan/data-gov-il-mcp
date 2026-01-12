/**
 * property_insights - Aggregated contextual insight about a property / parcel / coordinate
 * Inputs (one of):
 *  - address (string, Hebrew or English, free form)
 *  - gush & helka (Israeli parcel identifiers)
 *  - lat & lng (WGS84 coordinates)
 *
 * Strategy (MVP):
 *  - Validate exactly one identification path provided.
 *  - Run targeted dataset searches (package_search) for real-estate & environment keywords.
 *  - Suggest candidate datasets & resource IDs relevant for:
 *      • Transactions / Prices (e.g. ‘mechir’, ‘נדלן’, ‘עסקאות’, ‘real estate’)
 *      • Planning / Parcels (e.g. ‘GUSH’, ‘HELKA’, ‘גוש’, ‘חלקה’)
 *      • Environment (contamination, air quality)
 *  - Provide ready next-step search_records examples filtered by the provided identifiers.
 *  - Placeholder blocks for future enrichment (news, external APIs, zoning, demographics).
 */

import { z } from 'zod';
import { ckanRequest } from '../utils/api.js';
import { createErrorResponse } from '../utils/formatters.js';

// Expanded keyword groups for richer multi-dimensional neighborhood / parcel context
const KEYWORD_GROUPS = {
  pricing: ['mechir', 'מחיר', 'נדלן', 'עסקאות', 'transaction', 'real estate', 'מחירי דירות', 'housing price'],
  parcels: ['gush', 'helka', 'גוש', 'חלקה', 'cadastre', 'parcel', 'רישום מקרקעין'],
  environment: ['סביבה', 'environment', 'זיהום', 'קרקע מזוהמת', 'אוויר', 'air', 'contamination', 'quality air'],
  population: ['אוכלוסיה', 'population', 'דמוגרפיה', 'demographics', 'גיל', 'age distribution'],
  transportation: ['תחבורה', 'transportation', 'קו אוטובוס', 'bus', 'rail', 'רכבת', 'traffic', 'תנועה'],
  religion: ['דת', 'religion', 'מוסדות דת', 'synagogue', 'בית כנסת', 'church', 'מסגד'],
  education: ['חינוך', 'education', 'schools', 'בית ספר', 'גן ילדים', 'kindergarten'],
  services: ['שירותים', 'services', 'בריאות', 'מרפאה', 'clinic', 'health center', 'community', 'קהילה'],
  socioeconomic: ['חברתי', 'socioeconomic', 'מדד חברתי', 'income', 'עוני', 'poverty', 'שכר', 'מדד'],
};

// Display metadata per group (title + short description shown in section header)
const GROUP_METADATA = {
  pricing: { title: 'Pricing / Transactions', desc: 'Real estate prices & transactions datasets' },
  parcels: { title: 'Parcel / Cadastre', desc: 'GUSH/HELKA, cadastral & planning references' },
  environment: { title: 'Environmental Context', desc: 'Air quality, contamination, environmental risks' },
  population: { title: 'Population & Demographics', desc: 'Population counts, age structure, growth' },
  transportation: { title: 'Transportation & Accessibility', desc: 'Public transit, traffic, mobility indicators' },
  religion: { title: 'Religious Institutions', desc: 'Synagogues, churches, mosques & related facilities' },
  education: { title: 'Education Facilities', desc: 'Schools, kindergartens, educational resources' },
  services: { title: 'Community & Health Services', desc: 'Clinics, community centers, public services' },
  socioeconomic: { title: 'Socioeconomic Indicators', desc: 'Income, poverty, social index and related stats' }
};

function buildSearchTerms({ address, gush, helka }) {
  const terms = new Set();
  if (address) {
    const trimmed = address.trim();
    if (trimmed) terms.add(trimmed);
  }
  if (gush) terms.add(gush);
  if (helka) terms.add(helka);
  return Array.from(terms).slice(0, 3); // limit noise
}

async function searchDatasetsForGroup(groupName, extraTerms) {
  const keywords = KEYWORD_GROUPS[groupName];
  const queries = [];
  // Combine each base keyword with optional extra terms (like gush/helka/address fragments)
  for (const kw of keywords) {
    if (extraTerms.length) {
      for (const t of extraTerms) {
        queries.push(`${kw} ${t}`);
      }
    } else {
      queries.push(kw);
    }
  }
  // Deduplicate
  const unique = Array.from(new Set(queries)).slice(0, 6); // cap per group
  const results = [];
  for (const q of unique) {
    try {
      console.error(`🌐 property_insights: searching datasets for group='${groupName}' q='${q}'`);
      const resp = await ckanRequest('package_search', { q, rows: 5 });
      if (resp?.result?.results) {
        resp.result.results.forEach(d => {
          results.push({
            name: d.name || d.id,
            title: d.title,
            group: groupName,
            scoreContext: q,
            tags: (d.tags || []).map(t => t.name),
            resources: (d.resources || []).filter(r => r.datastore_active).slice(0, 3).map(r => ({ id: r.id, name: r.name, format: r.format }))
          });
        });
      }
    } catch (e) {
      console.error(`⚠️ dataset search failed for '${q}': ${e.message}`);
    }
  }

  // Basic ranking: prioritize datasets having searchable resources & containing gush/helka fields hints
  const ranked = results
    .map(d => {
      const fieldHints = ['gush', 'helka', 'גוש', 'חלק', 'price', 'מחיר'];
      const hintScore = fieldHints.some(h => (d.title || '').toLowerCase().includes(h) || d.tags.some(t => t.toLowerCase().includes(h))) ? 5 : 0;
      const resourceScore = d.resources.length * 2;
      return { ...d, score: hintScore + resourceScore };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  return ranked;
}

function formatSummaryBlock(idInput) {
  return [
    '🏠 PROPERTY INSIGHTS (MVP)',
    '',
    'Input Provided:',
    ...Object.entries(idInput).filter(([_, v]) => v !== undefined && v !== null).map(([k, v]) => `• ${k}: ${v}`),
    '',
    'This tool aggregates relevant public datasets that may contain information about the property, pricing signals, parcel data and environmental context.',
    'External enrichments (news, zoning plans, demographic stats) are placeholders for future expansion.'
  ].join('\n');
}

function formatDatasetSection(groupKey, datasets) {
  const meta = GROUP_METADATA[groupKey] || { title: groupKey, desc: '' };
  if (!datasets.length) return `❌ No ${meta.title} datasets detected (refine input or try find_datasets with a direct keyword).`;
  const lines = [
    `📂 ${meta.title} (top ${datasets.length})`,
    meta.desc ? `ℹ️ ${meta.desc}` : '',
    '',
    ...datasets.map(d => [
      `• ${d.name} (${d.title || 'No title'})`,
      `  scoreCtx: ${d.scoreContext}`,
      d.resources.length ? `  resources: ${d.resources.map(r => r.id).join(', ')}` : '  resources: none searchable',
      d.tags.length ? `  tags: ${d.tags.join(', ')}` : ''
    ].filter(Boolean).join('\n'))
  ];
  return lines.filter(Boolean).join('\n');
}

function buildNextSteps({ gush, helka, address }, allDatasets) {
  // Prefer pricing > parcels > socioeconomic > population for candidate resource
  const priorityOrder = ['pricing', 'parcels', 'socioeconomic', 'population'];
  let candidateResource;
  for (const group of priorityOrder) {
    const ds = allDatasets.filter(d => d.group === group && d.resources.length);
    if (ds.length) { candidateResource = ds[0].resources[0]; break; }
  }
  if (!candidateResource) {
    const fallback = allDatasets.find(d => d.resources.length);
    if (fallback) candidateResource = fallback.resources[0];
  }

  const examples = [];
  if (candidateResource) {
    if (gush || helka) {
      const f = [];
      if (gush) f.push(`"GUSH": "${gush}"`);
      if (helka) f.push(`"HELKA": "${helka}"`);
      examples.push(`search_records(resource_id="${candidateResource.id}", filters={${f.join(', ')}}, limit=5)`);
    }
    if (address) {
      const firstToken = address.split(/\s+/)[0];
      examples.push(`search_records(resource_id="${candidateResource.id}", q="${firstToken}", limit=5)`);
    }
  }
  examples.push('price_per_meter(resource_id="<resource_uuid>", gush="<gush>", helka="<helka>")');
  examples.push('find_datasets(query="אוכלוסיה <city>") // demographic refinement');
  examples.push('find_datasets(query="תחבורה <city>") // transportation context');

  return [
    '💡 NEXT STEPS:',
    '',
    examples.length ? 'Try these calls:' : 'Use find_datasets / search_records to refine.',
    ...examples.map(e => `• ${e}`),
    '',
    'Tip: For socioeconomic layers, look for CBS (הלמ"ס) published indices.'
  ].join('\n');
}

export function registerPropertyInsightsTool(mcp) {
  mcp.tool(
    'property_insights',
    {
      address: z.string().optional().describe('Street address (can be partial, Hebrew or English).'),
      gush: z.string().optional().describe('Parcel block number (גוש).'),
      helka: z.string().optional().describe('Parcel lot number (חלקה).'),
      lat: z.number().optional().describe('Latitude (WGS84).'),
      lng: z.number().optional().describe('Longitude (WGS84).')
    },
    async ({ address, gush, helka, lat, lng }) => {
      try {
        // Basic validation: require at least one identification path
        if (!address && !(gush && helka) && !(lat !== undefined && lng !== undefined)) {
          throw new Error('Provide either address, gush+helka, or lat+lng.');
        }

        console.error('🏠 property_insights: aggregating context...');

        const idInput = { address, gush, helka, lat, lng };
        const extraTerms = buildSearchTerms(idInput);

        // Dynamic search across all defined groups
        const groupKeys = Object.keys(KEYWORD_GROUPS);
        const groupResults = await Promise.all(groupKeys.map(k => searchDatasetsForGroup(k, extraTerms)));
        const datasetsByGroup = Object.fromEntries(groupKeys.map((k, i) => [k, groupResults[i]]));

        // Flatten for next steps logic
        const all = groupResults.flat();

        const summary = formatSummaryBlock(idInput) + '\n\nCategories scanned: ' + groupKeys.join(', ');
        const sectionBlocks = groupKeys.map(k => formatDatasetSection(k, datasetsByGroup[k]));
        const nextSteps = buildNextSteps(idInput, all);
        const roadmap = [
          '🚧 FUTURE ENRICHMENTS (roadmap):',
          '• Reverse geocoding & official parcel resolution (maps API)',
          '• Historical price index normalization',
          '• Automated news & planning announcements aggregation',
          '• Deep CBS socioeconomic index linkage (מדרג חברתי כלכלי)',
          '• Zoning / תוכניות בניין עיר (TABA) integration',
          '• Spatial buffering (e.g. 500m radius facility counts)'
        ].join('\n');

        return {
          content: [summary, ...sectionBlocks, nextSteps, roadmap].map(text => ({ type: 'text', text }))
        };
      } catch (error) {
        return createErrorResponse('property_insights', error, [
          'Ensure you passed at least one of: address | gush+helka | lat+lng',
          'Try a simpler address (street + city)',
          'Verify gush & helka are numeric strings as in land registry',
          'You can still manually use find_datasets("נדלן") then search_records'
        ]);
      }
    }
  );
  console.error('  ✅ property_insights registered');
}

export default registerPropertyInsightsTool;
