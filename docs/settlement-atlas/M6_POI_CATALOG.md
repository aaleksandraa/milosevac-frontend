# M6 — Settlement POI catalog (frontend)

**Status: implemented** on `feature/bih-settlement-atlas`. M7 was **not** started.

Companion: backend `docs/settlement-atlas/M6_POI_CATALOG.md`.

## Map

M5 settlement polygons stay on source `atlas-settlements`. POIs are a second GeoJSON source `atlas-places` (circle layers, no clustering, no vector tiles).

Pilot measurement: **761** points, **~345 KB** GeoJSON. Combined with M5 boundaries this is still GeoJSON-sized. PMTiles are not warranted.

Family control (compact chips, mobile wrap):

Sve · Zdravstvo · Obrazovanje · Sport · Vjerski objekti · Kultura i istorija · Turizam · Javne službe

Religion uses the same landmark/circle treatment as other families (neutral grey). Icons for lists/popups come from the existing Lucide set; no random web images.

Popup shows name or generated type label, type, settlement, municipality, address, website, phone, operator — only fields that exist. Unnamed objects keep `name = null` and display e.g. “Fudbalski teren” as a generic type label, not an official name. No standalone SEO POI pages.

If the POI API fails, the boundary map still works.

## Settlement page

`/mjesta/{municipality}/{settlement}` adds **Objekti i sadržaji** only when groups exist. Empty families are omitted. Copy uses “u trenutno dostupnim podacima evidentirano…”, never “tačno N objekata”.

## Search

Index search still matches settlements first. POI name/type matches appear in a separate **Objekti** list and can focus a map marker. Settlement and POI results are labelled differently.

## Attribution

MapLibre attribution keeps M5 OSM boundary + Copernicus DEM lines and adds OSM POI / ODbL. Methodology text states OSM coverage is incomplete and assignment uses atlas polygons, not cadastral membership.

## Completeness language

Imported counts are currently mapped/imported OSM objects. They are not an authoritative inventory of schools, pharmacies, sports facilities, or religious buildings.
