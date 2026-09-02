# M8 — Historical census population (frontend)

**Status: implemented** on `feature/bih-settlement-atlas`. **M9 was not started.**

Public settlement pages show **Kretanje broja stanovnika** from the settlement API series. Only actual census years are plotted (1971, 1981, 1991, 2013 where available). The SVG chart uses a **numeric year axis** so 1991→2013 occupies more horizontal space than 1981→1991. Missing years are omitted; sourced **0** remains 0.

## UI

- Accessible table remains mandatory (`PopulationTable`).
- 1991→2013 cards and copy: “Broj stanovnika prema popisu smanjen/povećan je sa X 1991. na Y 2013.” No war causation.
- `comparable_with_caveat` shows: historical data are linked to today’s settlement, but administrative/statistical boundaries are not necessarily identical.
- `SourcePanel` lists historical census publications by year (without internal source IDs). 2013 methodology stays on the existing panel.
- Map mode **Promjena 1991–2013.**: diverging scale centred on 0%, unit `%`, legend “Promjena broja stanovnika, Popis 1991 → Popis 2013”. Non-comparable/missing polygons stay grey. No causal map labels.
- Municipality pages do **not** compare 1991 historical municipality totals with 2013 current municipality totals.

2013 remains the latest official settlement census in copy. No 2026 estimates.

See the backend document `docs/settlement-atlas/M8_HISTORICAL_POPULATION.md` for sources, mapping, and comparability rules.
