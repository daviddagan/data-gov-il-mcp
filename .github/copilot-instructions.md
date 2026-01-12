# Copilot Instructions: data-gov-il-mcp

Concise, project-specific guidance for AI coding agents. Focus on CURRENT patterns (v2.1.0). Avoid generic abstractions—mirror what the code already does.

## 1. Purpose & Architecture
MCP server exposing Israeli government open data (data.gov.il / CKAN) via Tools + Prompts over stdio or HTTP wrapper.

Core layers:
- Transport Entrypoints: `stdio.js`, `http.js`, `http-server.js` launch server with different transports.
- Server Factory: `src/server.js` creates `McpServer`, registers tools (`registerAllTools`) and prompts (`registerPrompts`), sets graceful shutdown + env logging.
- Tools Layer: Individual tool modules under `src/tools/*.js`, aggregated in `src/tools/index.js` which controls registration order and console logging.
- Prompts Layer: `src/prompts/index.js` registers domain expert prompt templates (large structured system messages).
- Support Modules:
  - API: `src/utils/api.js` wraps CKAN endpoints with logging + error normalization.
  - Formatting: `src/utils/formatters.js` centralizes response + error shaping (multi-block textual responses only; always returns `{ content: [{type:"text", text: ...}, ...] }`).
  - Guidance: `src/lib/guidance.js` holds troubleshooting, workflows, semantic contexts, help text builders.
  - Config/Data: `src/config/constants.js`, `src/config/tags.js` (topic taxonomy), plus curated arrays (POPULAR_* etc.).

Design intent: Opinionated guided exploration workflow (topics → datasets → resources → records) with rich console diagnostics.

## 2. Execution & Scripts
From `package.json`:
- `npm start` → stdio MCP (primary for Claude Desktop)
- `npm run dev` → watch mode stdio
- `npm run http` → Express HTTP wrapper (`http-server.js`), exposes tool endpoints like `/tool/<tool_name>` (used by Cursor)
No tests yet; `test` script is placeholder. Prefer adding lightweight integration tests hitting tool functions directly (see Conventions below) if introducing complexity.

## 3. Tool Conventions
Each tool module exports a `registerXTool(mcp)` (or plural) that calls `mcp.tool(name, schemaObject, handlerFn)`.
Patterns:
- Validation: Uses `zod` (`import { z } from 'zod';`) for argument schema.
- Handler returns `{ content: [{ type: 'text', text: block }, ...] }` — never raw strings.
- Multi-block responses: Use helper formatters OR manual arrays similar to `find_datasets`.
- Errors: Use `createErrorResponse(opName, error, suggestionsArray)`.
- Logging: Rich `console.error` with emojis before/after API calls and registrations. Maintain this style for observability.
- Sorting/Mapping logic is explicit constants inside file (`SORT_OPTIONS` in `find.js`). Keep new enumerations similarly localized.

When adding a new tool:
1. Create `src/tools/<name>.js` exporting a `register<Name>Tool(mcp)`.
2. Import & register it in `src/tools/index.js` (preserve logging order: discovery → dataset → resource → records → domain specials).
3. If output needs structured guidance, add helper(s) to `formatters.js`.
4. Provide usage tips + next-step guidance blocks.

## 4. API Layer Patterns (`utils/api.js`)
- `ckanRequest(endpoint, params, timeout)` central wrapper. Always use it—do not call axios directly elsewhere.
- Adds full URL log + param echo. Preserve these logs for debuggability.
- Error taxonomy handled: timeout (ECONNABORTED), response error (status), request missing (connectivity), else rethrow.
- Specialized helpers: `getDatasetsList`, `getDatasetInfo(id, includeTracking?)`, `searchRecords(resourceId, searchParams)` which normalizes `filters` (JSON), `fields` (comma list), `sort` (comma list), `include_total` (string true).

## 5. Guidance & Workflow
Canonical workflow (reinforced across modules):
`list_available_tags` → `find_datasets` → `get_dataset_info` → `list_resources` → `search_records` (basic) → `search_records` (advanced) → optional analytics.
Do NOT introduce new workflow text in individual tools—reuse arrays/constants from `lib/guidance.js` where feasible.

## 6. Prompts System
`registerPrompts` defines named prompt templates with large system messages (domain experts). Each `mcp.registerPrompt(name, meta, async fn)` returns a single message array. Follow existing pattern if adding new domain expert: mirror structure (SYSTEM role sections, analytical framework, response format, examples). Keep heavy content isolated in this file only (avoid fragmentation).

## 7. Constants & Tag Data
- `constants.js`: Base URLs, timeouts, curated lists (POPULAR_DATASETS, POPULAR_ORGANIZATIONS, EXAMPLE_RESOURCE_IDS). Update these instead of scattering literals.
- `tags.js`: (Not shown here) holds `TAGS_DATA.categories[category].tags[]`. Use it for validation / suggestions (see `find.js`). Avoid duplicating tag strings in new code.

## 8. Error & Response Style
- Always return helpful next steps ("💡 NEXT STEPS" / "💡 Try:").
- Multi-block array pattern improves rendering in clients; keep each conceptual section one block.
- Prefer including: counts, example IDs, performance cautions (⚠️), or optimization hints for heavy operations.

## 9. Logging Style
All runtime diagnostics use `console.error` (intentional) with emoji prefixes. Keep consistent:
- Startup: rockets / checkmarks
- Registration: `✅` per tool
- API calls: `🌐`, `🔗 Full URL` lines
- Errors: `❌`
Add new logs matching tone; avoid noisy debug dumps unless behind a future flag.

## 10. Adding HTTP Endpoints
If introducing new tool accessible over HTTP wrapper, ensure name maps cleanly to `/tool/<tool_name>`; the tool name string becomes the REST suffix (keep lowercase, underscores). No custom routing per tool; rely on existing generic router (see `http-server.js`).

## 11. Internationalization / Hebrew Support
Inputs often accept Hebrew or English. When providing tips or examples, pair both when practical (see `constants.COMMON_KEYWORDS`). Reuse arrays; don’t hardcode bilingual examples repeatedly.

## 12. Performance Considerations
- Flag expensive operations explicitly (see `formatDatasetsList`).
- Encourage small `limit` first in `search_records` usage guidance.
- Use tag/topic narrowing before full dataset listing.

## 13. Versioning Notes
Displayed server version in `server.js` may lag `package.json` version—confirm before surfacing version-sensitive logic. Do not hardcode version strings inside multiple new modules; derive from one place if you need it (consider reading from `package.json` once if implementing version endpoint).

## 14. Safe Extension Checklist (copy for PRs)
- [ ] New tool registered in `src/tools/index.js`
- [ ] Uses `zod` schema & returns MCP content blocks
- [ ] Errors via `createErrorResponse`
- [ ] No direct axios usage
- [ ] Logs follow emoji style
- [ ] Reuses constants / tag data instead of new literals
- [ ] Provides actionable guidance block

## 15. Avoid
- Adding tests that mock CKAN without documenting sample payload shape
- Returning raw JS objects directly to MCP (must wrap in content array)
- Introducing silent failures (always surface actionable suggestions)

---
Questions or unclear patterns? Ask for: specific tool addition, prompt pattern, or workflow reuse.
