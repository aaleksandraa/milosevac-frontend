# M11 — Transport, hydrography and proximity presentation

The implementation and actual pilot import are ready for review. **Acceptance QA passed on 2026-10-19:** text/layout, map layers against the basemap and desktop render timing. Only render time on a real mobile device is unmeasured (see Validation). No M12 work, merge or push.

## Presentation

`NetworkSection` adds **Putevi i povezanost**, mapped road length/major-road length/density, a compact nearest-target list and **Rijeke i vode** when hydrographic content exists. Missing blocks are hidden. Zero distance remains valid; unnamed targets use the category label. Source names are preserved rather than invented. Hydro objects use river/stream/canal/drain/ditch/water-surface semantics and distinguish `inside`, `crosses`, `touches_boundary` in text.

Every distance is explicitly **pravolinijski**, measured from the settlement reference point. Geographic-centroid fallback is explained as not necessarily the inhabited centre. Metres below 1000, kilometres thereafter, sensible localized precision. No driving-time, routed-distance, road-quality, flood-risk or emergency-service claim. Nearest means nearest in the imported M6 candidate set, which includes neighboring and cross-border objects. When the backend marks a target `target_in_country: false` (outside the OSM BiH national boundary), the distance stays and the row adds "Cilj se nalazi izvan Bosne i Hercegovine (prema OSM državnoj granici)." The school category includes schools with an unspecified level; it does not assert that every school is primary/secondary.

M10 land-cover water percentages and M11 hydrographic lengths/areas remain independent components and facts. No new SEO pages or automatic articles.

## Source and methodology

Actual OSM regional acquisition: `https://overpass.kumi.systems/api/interpreter`, retrieved **2026-09-05 15:54:58 UTC**, reported OSM data timestamp **2026-05-06 03:25:00 UTC**. Retrieval date is not data freshness. [OpenStreetMap contributors / ODbL](https://www.openstreetmap.org/copyright) attribution appears with the sections and map sources. M6 proximity targets retain their own source rather than being assigned the new network extraction date.

Backend source geometry remains in dedicated road/hydro tables, separate from POIs. Shapely clips projected EPSG:3035 geometry to M4 boundaries for length/area. Point-to-POI distances use WGS84 geodesics; point-to-network distances use EPSG:3035 nearest geometry. Origin hierarchy is verified label point, then M4 geographic centroid, then unavailable. No routing engine; route metres and travel seconds remain null. Offline snapshots and DB imports supply every API response; no runtime Overpass, geocoding or routing request.

Normalized API types are in `src/lib/atlas-network.ts`, extended through `GeoSettlementDetail`. Public blocks: `transport`, `hydrography`, `proximity`. Frontend performs formatting only, not GIS arithmetic or target selection.

## Map strategy

`NetworkLayers` adds opt-in **Glavni putevi** and **Vodotoci i vodene površine**. No network request on initial load. Municipality pages use their municipality; the pilot atlas offers Modriča/Šamac selection. Requests abort on toggle/scope changes. Major roads have an amber line; water has blue lines with river width differentiation and low-opacity polygon fill. No dense source labels. Network failures leave the existing boundary and POI map usable.

- `/api/geo/map/roads?municipality=modrica|samac`
- `/api/geo/map/hydrography?municipality=modrica|samac`

Measured JSON/gzip: Modriča roads **64,564 / 18,205 bytes (69 features)**; Šamac roads **46,250 / 13,254 (51)**; Modriča hydro **204,171 / 61,487 (76)**; Šamac hydro **200,269 / 61,127 (80)**. Local endpoint latency **189–291 ms**. Responses contain full source geometries intersecting municipality settlements, not entire regional road inventory.

Decision **B: municipality-scoped/lazy GeoJSON only**. PMTiles is deferred based on measured payload sizes. Desktop browser (dev server, Šamac): roads 441 ms / 46,250 B, hydro 307 ms / 200,269 B, map idle about 2.3 s after zoom; real mobile-device performance has not been measured. National scaling should normalize a single timestamped Geofabrik/regional PBF, spatially index and intersect many polygons, then reconsider tiles using actual payloads. No national import was started.

## M9 integration

Existing dynamic catalog/ranking UI consumes six backend metrics: `mapped_road_length_km`, `mapped_road_density_km_per_km2`, `major_road_length_km`, `waterway_length_km`, `distance_to_municipality_centre_km`, `distance_to_nearest_major_road_km`. Neutral labels describe mapped infrastructure and straight-line distance, not “best connected”. All six actual denominators: **37 eligible, 8 missing, 45 total**.

Existing `AtlasCompareTable` renders the new **Povezanost i vode** category, km/km² or km differences. When every row in a section carries the same caveat (as all six M11 rows do), it is shown once under the section heading instead of under each row; differing per-row caveats still appear on their rows. Backend sends a warning and disables comparison when distance origin/methodology differs. No percentage difference is shown for these metrics.

## Actual pilot values

Miloševac: **48.04 km** roads (major 5.92, local 9.63, residential 16.20, service 3.59, tracks 12.47, other 0.24); density **2.765 km/km²**. Bosna contributes **0.458 km** clipped waterway, water polygons **0.182 km²**. Own centre Modriča **8.60 km** straight-line; nearest major road **1.46 km**; Expera Pharmacy **8.30 km**; unnamed hospital **8.60 km**; Dom zdravlja Odžak **6.75 km**; unnamed school **5.46 km**. These are imported-candidate results from the geographic centroid, not travel distances or guarantees of local service completeness.

Modriča: **117.89 km** roads, **66.50 km** residential, **9.05 km** waterways, naturally **0 m** to its own reference point. Šamac: **51.98 km** roads, **7.07 km** waterways; Bosna, Sava and Žandrak source geometries are clipped before counting. Eight settlements without a reliable origin remain missing.

Backend's companion `docs/settlement-atlas/M11_NETWORK_ACCESSIBILITY.md` and `m11/` JSON reports contain complete provenance, all pilot results, commands, counts, classifications, method, performance and limitations.

## Validation

- `npm test`: 55 passing tests, including absent sections, mapped length/zero, unnamed target, straight-line wording, cross-border note, single shared compare caveat, boundary relation and lazy municipality layer requests.
- `npm run lint`: zero errors; pre-existing button fast-refresh warning.
- `npm run build`: passes and emits `assets/maplibre-gl-worker-*.js`; pre-existing large MapLibre chunk and Browserslist notices.
- Additional TypeScript check reports existing issues in `useOutages.test.ts`, `atlas-map-engine.ts`, `atlas-ranking.ts`; no remaining new network-file error.
- Existing climate, land-cover, POI, population and terrain tests pass.
- **Browser QA 2026-10-19 (local dev servers, Cursor embedded browser):** settlement pages Miloševac, Modriča, Šamac render "Putevi i povezanost" and "Rijeke i vode"; every distance carries "pravolinijski" plus the not-road-distance/not-driving-time disclaimer; unnamed targets use the generic label; Modriča/Šamac show 0 m to their own centre; duplicate same-name OSM ways (Sava ×2 in Šamac) are listed once; no-boundary settlements (Botajica, Njegoševo) omit all three blocks. Compare `/uporedi/modrica/milosevac/modrica/modrica` shows "Povezanost i vode" with km and km/km² differences, no percentages. `/rang-liste` lists the six M11 metrics with neutral labels and 37/45 eligibility. At 390 px mobile width both sections are 358 px wide with no horizontal overflow.
- **Map layers (fixed bug):** the first pass showed a blank map in every map view. This was a frontend bug, not a browser limit. MapLibre 6 resolves its worker as `./maplibre-gl-worker.mjs` next to its own module, which does not exist once Vite relocates the bundle (`.vite/deps` in dev, hashed asset in build). The worker therefore loaded the HTML page and failed with `SyntaxError: Unexpected token '<'`. `useMapLibre` now imports `maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url` and calls `setWorkerUrl` before creating the map. After the fix, `/mjesta/samac/samac` shows the Sava/Bosna water layers and the amber major roads aligned with the basemap, and on `/mjesta/modrica/milosevac` the Bosna follows the western boundary (458 m clipped). In the production build the hashed worker asset loads and starts cleanly (`vite preview` itself calls the production API at `api.milosevac.com`, so the full page cannot be checked from localhost).
- **Data-quality notes:** the only `railway_station` in M6 is Slavonski Šamac, now flagged as outside BiH (37 rows). The only other flagged target is Ordinacija Slavonski Šamac (one health row). "Ljekarna Vukić" (Šamac town's nearest pharmacy, 9.5 km) is inside BiH and is not flagged. Compare `/uporedi/modrica/milosevac/samac/samac` shows the OSM caveat once under "Povezanost i vode".

Starting frontend HEAD: `8a1c18ad6e7ad12448b79083a2950d1eebba2bcd`, branch `feature/bih-settlement-atlas`. Backend starting HEAD: `99ae77a82f090f7dbcecc580107acde1e3d43feb` on the same branch name. Implementation commits remain local.

Exact frontend file inventory: [M11_CHANGED_FILES.txt](M11_CHANGED_FILES.txt). Final hashes are included in the handoff; no merge or push.
