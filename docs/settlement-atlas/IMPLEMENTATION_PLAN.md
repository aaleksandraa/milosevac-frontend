# Implementation plan — BiH Settlement Atlas

Branch (backend): `feature/bih-settlement-atlas`

## Milestones

| ID | Status | Scope |
|---|---|---|
| M0 | Done | Audit and policy docs |
| M1 | Complete | Core schema |
| M2 | Complete | Pilot Modriča + Šamac settlements from 2013 census fixture |
| **M3** | **Complete** | Public `/api/geo` + `/mjesta` pages, SEO/sitemap |
| M4 | Not started | Boundaries + DEM (after spatial probe) |
| M5–M12 | Not started | Map, OSM POIs, climate, rankings, compare, national import |

## M3 result

- Read-only `/api/geo/municipalities` and nested settlement routes
- `/mjesta`, `/mjesta/modrica`, `/mjesta/modrica/milosevac` (and Šamac)
- `sitemap-settlements.xml` for the 45 indexable pilot settlements
- See [M3_PUBLIC_ATLAS.md](M3_PUBLIC_ATLAS.md)

M4 was not started.
