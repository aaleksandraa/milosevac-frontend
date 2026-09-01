# M1 — Core data model

**Status: implemented and tested** on `milosevac-backend` branch `feature/bih-settlement-atlas`.

Production MySQL/MariaDB `SELECT VERSION()` was **not** available. Native `POINT` / `MULTIPOLYGON` / `SPATIAL INDEX` were **not** created. `settlement_boundaries` was **not** created. No PostGIS.

## Geometry (actual)

On `geo_settlements`, `DECIMAL(10,7)` nullable columns:

| Column | Meaning |
|---|---|
| `geographic_centroid_lat` / `geographic_centroid_lng` | Derived polygon centroid (fill later; class E) |
| `label_point_lat` / `label_point_lng` | Inhabited / map-label centre |
| `label_point_source_id` | FK `data_sources`, `nullOnDelete` |
| `label_point_verification_status` | `VerificationStatus` enum cast, nullable |

## Tables created

| # | Migration | Table |
|---|---|---|
| 1 | `2026_09_01_100000_create_data_sources_table` | `data_sources` |
| 2 | `2026_09_01_100100_create_geo_countries_table` | `geo_countries` |
| 3 | `2026_09_01_100200_create_geo_entities_table` | `geo_entities` |
| 4 | `2026_09_01_100300_create_geo_cantons_table` | `geo_cantons` |
| 5 | `2026_09_01_100400_create_geo_municipalities_table` | `geo_municipalities` |
| 6 | `2026_09_01_100500_create_geo_settlements_table` | `geo_settlements` |
| 7 | `2026_09_01_100600_create_data_imports_table` | `data_imports` |
| 8 | `2026_09_01_100700_create_settlement_population_table` | `settlement_population` |

`settlement_population` uses an explicit table name (not `settlement_populations`).

## Indexes and foreign keys

- Unique: `geo_countries.slug`, `iso2`, `iso3`
- Unique: `(geo_entities.country_id, slug)`
- Unique: `(geo_cantons.entity_id, slug)`
- Unique: `geo_municipalities.slug` (public `/mjesta/{slug}`)
- Unique: `(geo_settlements.municipality_id, slug)` — slug is **not** globally unique
- Unique nullable: `osm_relation_id`, `wikidata_id`, `geonames_id`
- Unique: `(settlement_id, census_year, source_id)` as `settlement_population_unique`
- Administrative FKs: `restrictOnDelete`
- `outage_place_id` → `places.id` `nullOnDelete`
- `label_point_source_id` → `data_sources.id` `nullOnDelete`
- `data_imports.data_source_id` and `settlement_population.source_id` / `settlement_id`: `restrictOnDelete`

Existing `places` table was not renamed. Outage matching is unchanged.

## Models

`GeoCountry`, `GeoEntity`, `GeoCanton`, `GeoMunicipality`, `GeoSettlement`, `DataSource`, `DataImport`, `SettlementPopulation`

`Place::atlasSettlement()` is an optional `hasOne` for the nullable `outage_place_id` link.

## Enums and services

- `App\Enums\GeoEntityKind` — federation, republic, district
- `App\Enums\GeoMunicipalityAdminType` — municipality, city, district
- `App\Enums\DataSourceClass` — A, B, C, D, E
- `App\Enums\VerificationStatus` — with `strength()`
- `App\Enums\DataImportStatus` — pending, running, completed, failed, cancelled
- `App\Support\Atlas\SourceAuthority` — seed rank constants only
- `App\Support\Atlas\SourcePriorityComparator` — rank → verification → optional dataset version; never import time

String columns store enum values (not MySQL ENUM).

## Seed data (`GeoAtlasSeeder`)

Called from `DatabaseSeeder` after `PlaceSeeder`. No settlement rows.

- Country: Bosna i Hercegovina / BA / BIH
- Entities: Federacija Bosne i Hercegovine (`federation`), Republika Srpska (`republic`), Brčko distrikt Bosne i Hercegovine (`district`)
- 10 FBiH cantons (FZS *Federacija u brojkama 2026*): Unsko-sanski kanton, Kanton Posavski, Tuzlanski kanton, Zeničko-dobojski kanton, Bosansko-podrinjski kanton, Srednjobosanski kanton, Hercegovačko-neretvanski kanton, Zapadnohercegovački kanton, Kanton Sarajevo, Kanton 10
- LGUs: Modriča (municipality, RS, canton null), Šamac (municipality, RS, canton null), Brčko (district, BD, canton null)
- `data_sources`: FZS 2026 (A/100), OpenStreetMap (C/50), internal derived (E/20; class E does not imply rank 80)

## Tests

- `tests/Feature/GeoAtlasHierarchyTest.php` — hierarchy, admin_type, slug uniqueness, population series, outage_place_id, rollback
- `tests/Unit/SourcePriorityComparatorTest.php` — rank, verification, dataset version, no timestamp winner

Default suite is SQLite. No `ST_*` assertions.

## SQLite / spatial

PHPUnit uses SQLite `:memory:`. Spatial integration tests are not in this milestone.

## Rollback

Each migration `down()` drops its table. Feature test rolls back 8 steps and re-migrates; `places` remains.

## Deferred (not M1)

Public pages, maps, OSM/DEM/ERA5, `geo_places`, terrain/climate, rankings, compare, SEO sitemaps, national settlement import, native geometry columns.
