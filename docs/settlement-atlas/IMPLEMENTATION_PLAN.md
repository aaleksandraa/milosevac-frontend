# Implementation plan — BiH Settlement Atlas

Branch (backend): `feature/bih-settlement-atlas`

## Milestones

| ID | Status | Scope |
|---|---|---|
| M0 | Done | Audit and policy docs |
| M1 | Complete | Core schema |
| M2 | Complete | Pilot Modriča + Šamac settlements from 2013 census fixture |
| **M3** | **Complete** | Public `/api/geo` + `/mjesta` pages, SEO/sitemap |
| **M4** | **Complete** | Settlement boundaries + DEM terrain stats (37/45 pilot) |
| **M5** | **Complete** | Interactive MapLibre atlas map (GeoJSON, OpenFreeMap) |
| **M6** | **Complete** | Settlement POI catalog + OSM import (761 unique pilot objects) |
| **M7** | **Complete** | ERA5-Land / ERA5 climate normals + historical analytics (pilot) |
| **M8** | **Complete** | Historical settlement population 1971/1981/1991 + change analytics (pilot) |
| **M9** | **Complete** | Comparison + rankings engine (pilot + municipality scopes) |
| M10–M12 | Not started | Land cover, national import, … |

## M3 result

- Read-only `/api/geo/municipalities` and nested settlement routes
- `/mjesta`, `/mjesta/modrica`, `/mjesta/modrica/milosevac` (and Šamac)
- `sitemap-settlements.xml` for the 45 indexable pilot settlements
- See [M3_PUBLIC_ATLAS.md](M3_PUBLIC_ATLAS.md)

## M4 result

- OSM admin_level=9 polygons (ODbL) for 37/45 pilot settlements; 8 correctly left unmatched
- GeoJSON + bbox storage (production MySQL spatial types unverified)
- Copernicus DEM GLO-30 offline terrain stats (algorithm `m4.1`)
- Public `geography` API block + `/mjesta/...` “Geografija i teren”
- See [M4_BOUNDARIES_TERRAIN.md](M4_BOUNDARIES_TERRAIN.md)

## M5 result

- MapLibre 6.6 interactive map on `/mjesta`, municipality, and settlement routes
- `GET /api/geo/map/settlements` GeoJSON (~381 KB, 37 features, no simplification)
- OpenFreeMap Positron basemap; OSM + Copernicus attribution visible
- See [M5_INTERACTIVE_MAP.md](M5_INTERACTIVE_MAP.md)

## M6 result

- Generic `geo_places` / `geo_place_types` catalog (not the outage `places` table)
- Overpass fetch → private cache → classified import for Modriča + Šamac
- 761 unique OSM POIs; map GeoJSON ~345 KB (no vector tiles)
- See [M6_POI_CATALOG.md](M6_POI_CATALOG.md)

## M7 result

- ERA5-Land temperature + ERA5 precipitation climate normals 1991–2020 for **35/37** boundary-enabled pilot settlements (Šamac town and Pisari deferred: Open-Meteo 429)
- Offline Open-Meteo archive fetch → Python profiles → `atlas:import-climate`
- Public `climate` API block + Klima section + map temperature/precipitation modes
- See [M7_CLIMATE.md](M7_CLIMATE.md)

## M8 result

- Settlement population history 1971/1981/1991 for defensibly mapped pilot identities; 2013 remains M2
- `settlement_census_mappings` + checked-in mapping fixture; no fuzzy auto-match
- Public series, change cards, numeric-year chart, 1991–2013 map mode (comparable only)
- See [M8_HISTORICAL_POPULATION.md](M8_HISTORICAL_POPULATION.md)

## M9 result

- Municipality-qualified `/uporedi/...` and `/rang-liste`
- Settlement relative facts + map popup rank for existing thematic metrics
- See [M9_COMPARISON_RANKINGS.md](M9_COMPARISON_RANKINGS.md)

M10 was not started.
