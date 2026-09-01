# Implementation plan — BiH Settlement Atlas

Branch (backend): `feature/bih-settlement-atlas`

## Milestones

| ID | Status | Scope |
|---|---|---|
| M0 | Done | Audit and policy docs |
| M1 | Complete | Core schema |
| **M2** | **Complete** | Pilot Modriča + Šamac settlements from 2013 census fixture |
| M3 | Not started | Public settlement page + `/api/geo` |
| M4 | Not started | Boundaries + DEM (after spatial probe) |
| M5–M12 | Not started | Map, OSM POIs, climate, rankings, compare, SEO, national import |

## M2 result

- 24 Modriča + 21 Šamac `geo_settlements`
- 45 `settlement_population` rows for census year 2013
- Command `atlas:import-settlements --pilot` is idempotent
- See [M2_PILOT_SETTLEMENT_IMPORT.md](M2_PILOT_SETTLEMENT_IMPORT.md)

## Recommended M3 (do not start until asked)

Public `/mjesta/{opstina}/{naselje}` page, `/api/geo` resources, SEO/OG hooks, hide empty sections. Still no DEM/map/OSM national import.
