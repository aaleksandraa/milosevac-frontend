# Data source policy — Settlement Atlas

## Display classes (A–E)

| Class | Meaning | Public wording (ijekavian intent) |
|---|---|---|
| **A** | Official authoritative | Službeni izvor (državna/entitetska statistika, zakon, katastar gdje je potvrđen) |
| **B** | Reputable public dataset | Javni naučni ili institucionalni skup (Copernicus DEM, ERA5-Land, BHAS/FZS tabele) |
| **C** | Community / open geographic | OpenStreetMap i slični zajednički geografski izvori — **nije automatski konačni autoritet** |
| **D** | Manually researched | Ručno uneseno uz navedeni izvor; čeka verifikaciju ako izvor nije A |
| **E** | Derived / calculated | Izračunato (centroid, udaljenost, DEM statistika, klimatološki niz). Metodologija mora biti vidljiva |

Class E does **not** imply authority rank 80. Rank reflects the trustworthiness of the underlying dataset and methodology, not the fact that a value was calculated. The seed row `Interni izvedeni izračun` is rank **20**. Future derived metrics must store source dataset(s), algorithm version, and calculation timestamp.

Never hide whether a value is official, OSM-derived, DEM-derived, reanalysis-derived, manually verified, estimated, or calculated.

## Authority rank (conflict resolution)

`data_sources.authority_rank` is stored on each row. Higher wins. Suggested **seed defaults** (not magic in controllers):

| Rank | Typical sources |
|---|---|
| 100 | Official state/statistical authority (BHAS, FZS, RZSRS) |
| 90 | Official international authority |
| 80 | Scientific/public authoritative dataset (Copernicus DEM, ERA5-Land) |
| 60 | Municipality / local institution |
| 50 | OpenStreetMap |
| 40 | Reputable secondary source |
| 20 | Manually submitted / unverified |

Precedence (M1 `SourcePriorityComparator`):

1. Higher `authority_rank`
2. Stronger `VerificationStatus` (`official_source_verified` > `manually_verified` > `osm_imported` > `unverified`; `disputed` weakest)
3. Explicit dataset/census/version comparison only when both sides supply a version
4. **Never** newest `data_imports.finished_at`

Two population rows for the same `census_year` from different sources are allowed. The public page picks the winner via this comparator.

## Verification status

`unverified` | `osm_imported` | `manually_verified` | `official_source_verified` | `disputed`

OpenStreetMap import ≠ verified fact. OSM attribution must remain visible.

## Climate labelling (later milestones)

| Kind | Allowed public meaning |
|---|---|
| `observed_station_record` | Official/local station measurement (station, authority, date, value, source) |
| `gridded_reanalysis_extreme` | “Najviša vrijednost u analiziranom historijskom klimatološkom nizu za područje” — **not** “najviša ikad izmjerena temperatura u …” |
| `climate_normal` | Period mean / normal from a named dataset |

## Terrain (later)

DEM elevation is raster-derived, not an official surveyed geodetic elevation. Show `dem_source`, version, resolution, algorithm version.

## Distances (later)

Straight-line (`ST_Distance_Sphere` or haversine on decimals) must never be labelled as driving distance.

## Prohibited

- Inventing population, founding years, stadium capacities, history
- Google Maps as an import source
- LLM prose stored as a verified factual source
- Live Overpass / Copernicus / ERA5 on visitor requests
- “Newest import wins”
