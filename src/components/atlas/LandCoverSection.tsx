import { useId, useState } from "react";
import { AtlasStatCard } from "@/components/atlas/AtlasStatCard";
import { SourcePanel } from "@/components/atlas/SourcePanel";
import {
  dominantGroupSentence,
  formatLandCoverPct,
  landCoverChartSegments,
  landCoverHasPublicValues,
} from "@/lib/atlas-landcover";
import type { GeoLandCover } from "@/lib/atlas-types";

export function LandCoverSection({ landCover }: { landCover?: GeoLandCover }) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  if (!landCoverHasPublicValues(landCover)) return null;

  const summary = landCover.summary;
  const year = landCover.reference_year;
  const classes = (landCover.classes ?? []).filter((row) => (row.share_pct ?? 0) > 0);

  return (
    <section className="mt-8" aria-labelledby="pokrov-zemljista">
      <h2 id="pokrov-zemljista" className="text-lg font-extrabold">Pokrov i korištenje zemljišta</h2>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
        Prema Copernicus CORINE Land Cover {year} podacima, u okviru trenutno dostupne atlas granice naselja.
        Vrijednosti se odnose na referentnu {year}. godinu, ne na trenutno stanje. CLC je generalizovani inventar, ne karta
        parcela.
      </p>
      {dominantGroupSentence(landCover) ? (
        <p className="mt-2 max-w-3xl text-sm leading-relaxed">{dominantGroupSentence(landCover)}</p>
      ) : null}

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {summary?.agricultural_pct != null ? (
          <AtlasStatCard
            label="Poljoprivredne površine"
            value={formatLandCoverPct(summary.agricultural_pct)}
            hint={`CLC ${year}, udio analizirane površine`}
          />
        ) : null}
        {summary?.forest_pct != null ? (
          <AtlasStatCard
            label="Šumske površine (CLC)"
            value={formatLandCoverPct(summary.forest_pct)}
            hint={`CLC razredi 311–313, referentna ${year}.`}
          />
        ) : null}
        {landCover.forest?.tree_cover_mean_pct != null ? (
          <AtlasStatCard
            label="Pokrivenost krošnjama"
            value={formatLandCoverPct(landCover.forest.tree_cover_mean_pct)}
            hint={landCover.forest.tree_cover_wording ?? `Copernicus HRL Tree Cover Density ${year}`}
          />
        ) : null}
        {summary?.artificial_pct != null ? (
          <AtlasStatCard
            label="Umjetne površine"
            value={formatLandCoverPct(summary.artificial_pct)}
            hint={`CLC ${year}. Nisu sve umjetne površine zgrade.`}
          />
        ) : null}
        {landCover.imperviousness?.imperviousness_mean_pct != null ? (
          <AtlasStatCard
            label="Gustoća nepropusnosti"
            value={formatLandCoverPct(landCover.imperviousness.imperviousness_mean_pct)}
            hint={landCover.imperviousness.wording ?? `Copernicus HRL Imperviousness Density ${year}`}
          />
        ) : null}
        {summary?.water_pct != null ? (
          <AtlasStatCard
            label="Vode (CLC)"
            value={formatLandCoverPct(summary.water_pct)}
            hint={`CLC vodeni razredi, referentna ${year}. Nije riječna mreža.`}
          />
        ) : null}
      </div>

      <LandCoverChart landCover={landCover} />

      {classes.length > 0 ? (
        <div className="mt-4">
          <button
            type="button"
            className="text-sm font-bold text-primary hover:underline"
            aria-expanded={detailsOpen}
            onClick={() => setDetailsOpen((open) => !open)}
          >
            {detailsOpen ? "Sakrij detaljne CLC razrede" : "Prikaži detaljne CLC razrede"}
          </button>
          {detailsOpen ? (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[28rem] border-collapse text-sm">
                <caption className="sr-only">Detaljni CORINE razredi s nenučitim udjelom</caption>
                <thead>
                  <tr className="border-b border-border/70 text-left">
                    <th scope="col" className="py-2 pr-3 font-bold">Razred</th>
                    <th scope="col" className="py-2 pr-3 font-bold">Grupa</th>
                    <th scope="col" className="py-2 pr-3 font-bold">Udio</th>
                    <th scope="col" className="py-2 font-bold">Površina</th>
                  </tr>
                </thead>
                <tbody>
                  {classes.map((row) => (
                    <tr key={row.code} className="border-b border-border/50">
                      <th scope="row" className="py-2 pr-3 font-medium">{row.label}</th>
                      <td className="py-2 pr-3">{row.atlas_group_label}</td>
                      <td className="py-2 pr-3">{formatLandCoverPct(row.share_pct)}</td>
                      <td className="py-2">{row.area_km2.toLocaleString("bs-BA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} km²</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      ) : null}

      {landCover.forest?.forest_area_pct != null ? (
        <p className="mt-4 text-sm text-muted-foreground">
          {landCover.forest.forest_area_wording} {formatLandCoverPct(landCover.forest.forest_area_pct)}.
        </p>
      ) : null}
      {landCover.water_wetness?.wording ? (
        <p className="mt-2 text-sm text-muted-foreground">{landCover.water_wetness.wording}</p>
      ) : null}

      {landCover.source || landCover.methodology?.text ? (
        <div className="mt-6">
          <SourcePanel source={landCover.source} title="Metodologija pokrova zemljišta" headingId="pokrov-metodologija" />
          {landCover.methodology?.text ? (
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{landCover.methodology.text}</p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function LandCoverChart({ landCover }: { landCover: GeoLandCover }) {
  const segments = landCoverChartSegments(landCover);
  const titleId = useId();
  if (segments.length === 0) return null;
  const total = segments.reduce((sum, row) => sum + row.share_pct, 0) || 1;
  let offset = 0;

  return (
    <figure className="mt-5">
      <svg viewBox="0 0 640 56" role="img" aria-labelledby={titleId} className="h-auto w-full max-w-3xl">
        <title id={titleId}>Sastav pokrova zemljišta prema CLC {landCover.reference_year}</title>
        {segments.map((segment) => {
          const width = (segment.share_pct / total) * 640;
          const x = offset;
          offset += width;
          return (
            <rect key={segment.code} x={x} y={8} width={Math.max(width, 0)} height={40} fill={segment.color}>
              <title>{`${segment.label}: ${formatLandCoverPct(segment.share_pct)}`}</title>
            </rect>
          );
        })}
      </svg>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[24rem] border-collapse text-sm">
          <caption className="sr-only">Glavne grupe pokrova zemljišta</caption>
          <thead>
            <tr className="border-b border-border/70 text-left">
              <th scope="col" className="py-2 pr-3 font-bold">Grupa</th>
              <th scope="col" className="py-2 font-bold">Udio</th>
            </tr>
          </thead>
          <tbody>
            {segments.map((segment) => (
              <tr key={segment.code} className="border-b border-border/50">
                <th scope="row" className="py-2 pr-3 font-medium">
                  <span className="mr-2 inline-block h-2.5 w-2.5 rounded-sm align-middle" style={{ background: segment.color }} aria-hidden="true" />
                  {segment.label}
                </th>
                <td className="py-2">{formatLandCoverPct(segment.share_pct)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}
