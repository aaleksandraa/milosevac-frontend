# M3 — Public atlas pages

**Status: implemented.** Frontend branch `feature/bih-settlement-atlas`.

## Routes

- `/mjesta` — pilot index (Modriča + Šamac only; copy states the atlas is expanding)
- `/mjesta/:municipalitySlug`
- `/mjesta/:municipalitySlug/:settlementSlug`

`/omilosevcu` is unchanged. Settlement URLs are always municipality-qualified.

## Data layer

- Types: `src/lib/atlas-types.ts`
- Client: `src/lib/atlas-api.ts` (`apiUrl()`)
- Hooks: `src/hooks/useAtlas.ts` (TanStack Query)
- Search: `src/lib/atlas-search.ts` (diacritic-insensitive: `Milosevac` → Miloševac)

## UI

`SiteLayout`, `container-news`, `editorial-panel`. Components in `src/components/atlas/`:

`AtlasBreadcrumbs`, `AtlasStatCard`, `PopulationTable`, `SourcePanel`, `SettlementList`, `MunicipalityHeader`

Population is always year-qualified (“1.366 stanovnika prema Popisu 2013.”). Njegoševo `0` is shown as sourced data.

Absent modules (map, DEM, climate, POIs) are not rendered.

## SEO

Crawler/meta/sitemap live on the Laravel API host. The SPA sets `document.title`. Structured data is not duplicated in the React tree.

## Indexability

Backend rule: identity + municipality + at least one census (or other factual) population row. All 45 pilot settlements currently qualify.

## M4 boundary

M3 stops at public read API + pages + SEO. M4 is boundaries/DEM after the spatial probe. Not started.
