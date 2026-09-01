# M2 — Pilot settlement import (Modriča + Šamac)

**Status: implemented.** Backend branch `feature/bih-settlement-atlas`.

## Sources

Checked-in fixture: `database/imports/atlas/census-2013-pilot-settlements.json`

| Field | Value |
|---|---|
| Dataset | Popis stanovništva, domaćinstava i stanova u BiH 2013. — tabele naseljenih mjesta |
| Official origin | Agencija za statistiku BiH / Republički zavod za statistiku RS |
| Retrieval | 2026-09-01 via statistika.ba census tables (`id=20354` Modriča, `id=20656` Šamac) |
| Cross-check | Municipality totals 25 720 and 17 273 match published 2013 census municipality totals |
| RZS PDF | `Rezultati_Popisa_2013_Gradovi_Opstine_Naseljena_Mjesta_WEB.pdf` (direct download timed out in this environment) |
| License | Official statistical publication; fixture is a normalized extract, not a BHAS CMS dump |
| Transformation | JSON extract of statistical code, official name, 2013 population (`Ukupno`), households (`Domaćinstva`) |

`statistika.ba` is a **third-party presentation** of census tables, not the BHAS website. Identity codes and counts are treated as 2013 census settlement identity.

## Pilot municipalities (verified, not replaced)

| Slug | Name | Entity | admin_type | canton_id | statistical_code (filled by import) |
|---|---|---|---|---|---|
| `modrica` | Modriča | Republika Srpska | municipality | null | 20354 |
| `samac` | Šamac | Republika Srpska | municipality | null | 20656 |

2013 census uses **Šamac** (not Bosanski Šamac) for the RS municipality.

## Counts

- Modriča: **24** naselja
- Šamac: **21** naselja (including Njegoševo with official population 0)
- Population rows: **45** (`census_year=2013`)
- `geographic_centroid_*`: left null

## Architecture

`atlas:import-settlements` → `SettlementImportService` → `PilotCensusFixtureReader` (normalized records) → upsert `geo_settlements` + `settlement_population` → optional exact `outage_place_id` link.

Parser never talks to Eloquent. Persistence never parses raw JSON.

## Matching / upsert

1. `municipality_id` + `statistical_code`
2. municipality + normalized official name
3. municipality + slug (fallback)
4. Never global slug match

Identity overwrite only if incoming `authority_rank` ≥ 100 or the row has no statistical code yet. Weaker sources may add a separate `settlement_population` row; they do not rename the settlement.

Omitted source rows are **not** deleted.

## Slugs

`Illuminate\Support\Str::slug` on the sourced official name. Collision in the fixture or target municipality is an error (no silent numeric suffix).

## Outage links

Exact unique name/alias match via `PlaceNormalizer::key` only. No `PlaceMatcher` substring scan.

With a full `PlaceSeeder` dictionary, exact unique Modriča matches are: Miloševac, Dobrinja, Modriča, Koprivna, Dugo Polje, Tarevci, Garevac, Kužnjača, Vranjak.

- `Skugrić` (outage dictionary) vs `Skugrić Gornji` / `Donji Skugrić` (census): **not linked**
- Outage-only names not in the 2013 Modriča naselja list (Jakeš, Višnjik, Duga Njiva, Pećnik, Ždreban): no settlement to link
- Two `places` rows with the same normalized name: **ambiguous, unlinked**
- Local CMS dictionaries may have fewer `places` rows than `PlaceSeeder`; link counts then differ without failing import

## Population

Imported. 2013 census settlement `Ukupno` + `Domaćinstva` where the table provides them. Mapped by statistical code. Municipal totals were not stored as settlement population.

Njegoševo: official **0** inhabitants — stored with a note, not estimated.

## Cyrillic

Not populated. No unofficial transliteration.

## Commands

```bash
php artisan atlas:import-settlements --pilot
php artisan atlas:import-settlements --municipality=modrica
php artisan atlas:import-settlements --municipality=samac
php artisan atlas:import-settlements --pilot --dry-run
php artisan atlas:import-settlements --file=...
```

Second identical run: 0 inserted, 0 updated, 45 skipped.

## Fixture location

Canonical file: `database/imports/atlas/census-2013-pilot-settlements.json` (checked in; other `database/imports/*` dumps remain gitignored).

## National scaling

Same JSON shape + `--municipality` scope. Do not load the whole country in this command until M12. Prefer official BHAS/RZS extracts over scraping statistika.ba at national scale.

## Gaps

- Native geometry / boundaries / DEM: M4
- Label points: none in this source
- Cyrillic official names: not in this extract
- Direct RZS PDF parse: not completed (timeout)
- Alias table: deferred
