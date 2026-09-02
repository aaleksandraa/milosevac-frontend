# M10 — Land cover UI

Branch: `feature/bih-settlement-atlas`

## Settlement page

Section **Pokrov i korištenje zemljišta** (`LandCoverSection`) only when `land_cover` exists.

- Headline cards: agricultural, CLC forest, tree-cover density (HRL wording), artificial, imperviousness, CLC water
- Horizontal stacked bar + accessible group table
- Expandable non-zero CLC class breakdown
- Reference year 2018 + “u okviru trenutno dostupne atlas granice…”
- Tiny shares: `&lt;0,1%`

## Map modes

Choropleth only (no raw CLC raster):

- Poljoprivredne površine
- Šumske površine (CLC)
- Umjetne površine
- Pokrivenost krošnjama (HRL TCD)

## Rankings / compare

Category **Pokrov zemljišta**. Neutral labels (no “najzelenije” / “najurbanije”). Share differences shown as **pp** (procentnih poena).

## Files

- `src/components/atlas/LandCoverSection.tsx`
- `src/lib/atlas-landcover.ts`
- map types/styles, ranking/compare types, `AtlasSettlement`, `AtlasRankings`, `AtlasCompareTable`, `AtlasMapPopup`
