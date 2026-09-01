# Database proposal — Settlement Atlas

## Existing schema (relevant)

- `places` / `place_post` — outage/news dictionary. **Keep.** Do not rename.
- CMS: `posts`, `categories`, `media`, `matches`, `seo_metadata`, `jobs`, …
- Production: MySQL (`milosevac`). Local/tests: SQLite.
- No geometry columns today.

## Geometry decision (M1)

**Production `SELECT VERSION()` was not available from this environment. Do not guess.**

M1 therefore uses **named decimal fallbacks**, not native `POINT`/`MULTIPOLYGON`:

- `geographic_centroid_lat` / `geographic_centroid_lng`
- `label_point_lat` / `label_point_lng`

Semantic difference is preserved (polygon-derived centroid vs inhabited/map-label centre). A later spatial migration can add `POINT SRID 4326` columns without renaming meaning.

`settlement_boundaries` is **deferred** until the production probe passes:

```sql
SELECT VERSION();
SELECT ST_AsGeoJSON(ST_GeomFromGeoJSON('{"type":"Point","coordinates":[18.4,44.99]}'));
SELECT ST_Distance_Sphere(
  ST_GeomFromText('POINT(18.4 44.99)', 4326),
  ST_GeomFromText('POINT(18.5 45.05)', 4326)
);
```

If MySQL 8.0+ (or MariaDB 10.5+ with working `ST_*`): canonical store becomes native geometry; GeoJSON is API interchange (`ST_AsGeoJSON`).  
If the probe fails: keep JSON GeoJSON + decimals. **Do not migrate the app to PostGIS.**

PHPUnit stays SQLite. Spatial tests will be a separate group skipped unless `DB_CONNECTION=mysql`.

## M1 tables

Prefix `geo_` namespaces atlas tables next to CMS.

### geo_countries

`id`, `name`, `slug` unique, `iso2` unique, `iso3` unique, timestamps.

### geo_entities

`id`, `country_id` FK restrict, `name`, `slug`, `kind` (string: federation|republic|district), unique `(country_id, slug)`, timestamps.

### geo_cantons

`id`, `entity_id` FK restrict, `name`, `slug`, `official_code` nullable, unique `(entity_id, slug)`, timestamps.  
No RS or Brčko cantons.

### geo_municipalities

Local-government units (opština / grad / distrikt).  
`id`, `entity_id` FK restrict, `canton_id` nullable FK restrict, `name`, `slug` unique (URL `/mjesta/{slug}`), `admin_type` (municipality|city|district), `official_code` nullable, `statistical_code` nullable, timestamps.

### geo_settlements

`id`, `municipality_id` FK restrict, `name`, `slug`, `name_cyrillic` nullable,  
`official_code`, `statistical_code`, `osm_relation_id`, `wikidata_id`, `geonames_id` nullable,  
`outage_place_id` nullable FK `places.id` nullOnDelete,  
decimal centroid and label point fields, `label_point_source_id` nullable FK `data_sources`, `label_point_verification_status` nullable,  
**UNIQUE (`municipality_id`, `slug`)** — slug is **not** globally unique.  
Unique indexes on `osm_relation_id`, `wikidata_id`, `geonames_id` where the engine treats NULLs as distinct.

### data_sources

`id`, `name`, `provider` nullable, `source_class` (A–E), `authority_rank`, `source_type` nullable, `url`, `license`, `attribution`, `dataset_version`, `metadata` JSON, timestamps.

### data_imports

`id`, `data_source_id` FK restrict, `import_type`, `status`, `started_at`, `finished_at`, counters, `errors` nullable, `metadata` JSON, timestamps.

### settlement_population

Time series only. No population column on `geo_settlements`.  
`id`, `settlement_id`, `census_year`, `population`, `households` nullable, `statistical_settlement_code` nullable, `source_id`, `boundary_version` nullable, `notes` nullable,  
**UNIQUE (`settlement_id`, `census_year`, `source_id`)**.

## Hierarchy

```
BA → FBiH (federation) → 10 cantons → municipality|city
BA → RS (republic) → canton_id NULL → municipality|city
BA → Brčko District (district) → canton_id NULL → admin_type district
```

Examples: Modriča = municipality; Banja Luka = city; Brčko = district.

## Deferred tables (not M1)

`settlement_boundaries`, `settlement_terrain_stats`, `settlement_climate_stats`, `settlement_landcover_stats`, `settlement_distances`, `geo_places`, `geo_place_types`, `sports_clubs`, `sports_venues`, `weather_stations`, `weather_records`, `settlement_facts`.

## Identity

- Durable: `geo_settlements.id`
- Public URL: `/mjesta/{municipality_slug}/{settlement_slug}`
- Compare (later): `/uporedi/{muniA}/{settlementA}/{muniB}/{settlementB}`
- API (later): `/api/geo/settlements/{id}` and nested municipality slug pair  
  Never `/api/geo/settlements/{slug}` as a global unique slug.
