# M7 — Settlement climate analytics (frontend)

**Status: implemented** on `feature/bih-settlement-atlas`. **M8 was not started.**

Companion: backend `docs/settlement-atlas/M7_CLIMATE.md`.

Climate is historical **ERA5-Land / ERA5 reanalysis**, not station observations and not the existing Miloševac weather forecast.

## Settlement page

`/mjesta/{municipality}/{settlement}` adds **Klima** only when `settlement.climate` exists.

Headline cards: mean annual temperature, annual precipitation, coldest month, warmest month. Copy uses “Prema ERA5-Land reanalizi za područje naselja…”. 0 °C and 0 mm are valid values.

A dual-axis SVG climate diagram (temperature °C line, precipitation mm bars) plus an accessible monthly table (mean / min / max / precipitation). No separate canvas framework.

Restrained indices (threshold in the card). Extremes headed **Ekstremi u analiziranom ERA5-Land nizu** with value, date, and period. Never “apsolutni rekord”.

Methodology panel discloses ~9 km / 0.1° ERA5-Land spacing. Optional 1961–1990 vs 1991–2020 mean-temperature difference is labelled as a reanalysis-period difference.

SEO description may mention ERA5-Land 1991–2020 when data exist. Canonical URL stays the settlement page. Schema.org remains Place / WebPage; no invented climate types.

## Map

Thematic modes (settlement choropleth, no climate raster):

- Prosječna godišnja temperatura (°C, sequential, 1991–2020, ERA5-Land)
- Godišnje padavine (mm, sequential, 1991–2020, ERA5)

Only features with precomputed climate participate in those scales; others stay grey. Legend states metric, unit, period, and source. Attribution adds Copernicus C3S / ECMWF.

POI / terrain / population modes are unchanged. Map GeoJSON failure still leaves list/search; climate is on the same settlement GeoJSON as terrain, not a live climate API.

## Chart

`ClimateChart` is a lightweight SVG. Mapping helper: `climateChartPoints()` in `src/lib/atlas-climate.ts`.

## Browser QA

Checked on local Vite (`:8080`) against Laravel `:8002`:

- `/mjesta/modrica/milosevac` — Klima cards, SVG chart, 12-month table, indices, extremes, methodology; map popup 12.2 °C / 780.9 mm; temperature and precipitation choropleth modes with ERA5-Land / ERA5 legend notes
- `/mjesta/modrica/modrica` — Klima present
- `/mjesta/modrica/jasenica` — Klima present (~9.3 °C, cooler than the Posavina plain)
- `/mjesta/samac/samac` — no Klima section; map popup has no temperature/precipitation (cells still missing after Open-Meteo 429)

Terrain, population, and POI sections still render. Desktop and mobile viewports used for the settlement page.
