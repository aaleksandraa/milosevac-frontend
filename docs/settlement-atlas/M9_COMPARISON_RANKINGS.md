# M9 — Settlement comparison + rankings

**Status: implemented** on `feature/bih-settlement-atlas`. **M10 was not started.**

## Routes

- `/rang-liste` — ranking table (query: `metric`, `scope`, `municipality`, `direction`, `limit`)
- `/uporedi/{municipalityA}/{settlementA}/{municipalityB}/{settlementB}` — shareable two-settlement comparison

Settlement slugs are never used alone. Swap uses `Zamijeni` and rewrites the canonical URL.

## UI

- Rankings grouped: Stanovništvo / Geografija i teren / Klima / Objekti i sadržaji
- Default Top 10, or all eligible if fewer than 10; optional full table
- Competition ties shown with the same rank
- Denominator is eligible N (e.g. 12. od 37 naselja s terenskim profilom)
- Pilot wording on every ranking and relative-fact block
- Comparison: two municipality-qualified headers, searchable `Ime · Opština` selectors, paired bars for population/area, “Nema dostupnog podatka” (not 0), historical caveat when present
- Settlement page: **Položaj među obrađenim naseljima** (3–5 facts) + compare launcher
- Map: existing thematic scales unchanged; popup may add `{rank}. od {eligible}` for the active metric

## SEO

Compare pages are noindex. Rankings canonical is `/rang-liste`. Arbitrary compare URLs are not in the sitemap.

## Tests

Frontend tests cover compare route, headers, swap control, missing climate, caveat, rankings ties, eligible denominator, municipality filter, pilot wording, relative facts, map popup rank, and existing M3–M8 pages.
