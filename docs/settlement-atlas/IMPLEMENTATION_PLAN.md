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
| M5–M12 | Not started | Map, OSM POIs, climate, rankings, compare, national import |

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

M5 was not started.
