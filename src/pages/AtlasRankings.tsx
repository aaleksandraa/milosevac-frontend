import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { SiteLayout } from "@/components/site/SiteLayout";
import { AtlasBreadcrumbs } from "@/components/atlas/AtlasBreadcrumbs";
import { AtlasRankingTableView } from "@/components/atlas/AtlasRankingTable";
import { useAtlasMetrics, useAtlasMunicipalities, useAtlasRankings } from "@/hooks/useAtlas";
import { rankingPath, rankingPresetOptions } from "@/lib/atlas-ranking";

const AtlasRankings = () => {
  const [params, setParams] = useSearchParams();
  const { metrics } = useAtlasMetrics();
  const { municipalities } = useAtlasMunicipalities();
  const presets = useMemo(() => rankingPresetOptions(metrics), [metrics]);
  const metric = params.get("metric") || "population_2013";
  const direction = (params.get("direction") === "asc" ? "asc" : "desc") as "asc" | "desc";
  const scope = params.get("scope") === "municipality" ? "municipality" : "pilot";
  const municipality = params.get("municipality") || municipalities[0]?.slug || "";
  const showAll = params.get("limit") === "all";
  const presetId = `${metric}:${direction}`;

  const { rankings, loading, error } = useAtlasRankings({
    metric,
    direction,
    scope,
    municipality: scope === "municipality" ? municipality : undefined,
    limit: showAll ? "all" : 10,
    enabled: Boolean(metric) && (scope !== "municipality" || Boolean(municipality)),
  });

  useEffect(() => {
    document.title = `${rankings?.metric.high_ranking_label ?? "Rang-liste naselja"} | Miloševac.com`;
    window.scrollTo({ top: 0 });
  }, [rankings]);

  const update = (patch: Record<string, string | undefined>) => {
    const next = rankingPath({
      metric: patch.metric ?? metric,
      direction: patch.direction ?? direction,
      scope: patch.scope ?? scope,
      municipality: (patch.scope ?? scope) === "municipality" ? patch.municipality ?? municipality : undefined,
      limit: patch.limit ?? (showAll ? "all" : undefined),
    });
    setParams(new URLSearchParams(next.split("?")[1] ?? ""), { replace: true });
  };

  return (
    <SiteLayout>
      <AtlasBreadcrumbs
        items={[
          { label: "Početna", href: "/" },
          { label: "Mjesta", href: "/mjesta" },
          { label: "Rang-liste" },
        ]}
      />
      <section className="container-news mt-4">
        <header className="border-b border-border/70 pb-5">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-primary">Atlas naselja</p>
          <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">Rang-liste naselja</h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Rangovi se računaju samo među trenutno obrađenim naseljima s važećim podatkom za izabrani metrik.
            Ovo nisu rang-liste Bosne i Hercegovine. Naselja bez podatka nisu rangirana kao nula.
          </p>
        </header>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-sm font-bold">
            Pokazatelj
            <select
              className="mt-1 h-11 w-full rounded-md border border-border/70 bg-card px-3 text-sm font-normal"
              value={presets.some((preset) => preset.id === presetId) ? presetId : `${metric}:desc`}
              onChange={(event) => {
                const [nextMetric, nextDirection] = event.target.value.split(":");
                update({ metric: nextMetric, direction: nextDirection });
              }}
            >
              {["Stanovništvo", "Geografija i teren", "Klima", "Objekti i sadržaji"].map((category) => (
                <optgroup key={category} label={category}>
                  {presets.filter((preset) => preset.category_label === category).map((preset) => (
                    <option key={preset.id} value={preset.id}>{preset.label}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
          <label className="text-sm font-bold">
            Obuhvat
            <select
              className="mt-1 h-11 w-full rounded-md border border-border/70 bg-card px-3 text-sm font-normal"
              value={scope}
              onChange={(event) => update({ scope: event.target.value })}
            >
              <option value="pilot">Trenutno obrađena naselja</option>
              <option value="municipality">Opština</option>
            </select>
          </label>
          {scope === "municipality" ? (
            <label className="text-sm font-bold">
              Opština
              <select
                className="mt-1 h-11 w-full rounded-md border border-border/70 bg-card px-3 text-sm font-normal"
                value={municipality}
                onChange={(event) => update({ municipality: event.target.value, scope: "municipality" })}
              >
                {municipalities.map((row) => (
                  <option key={row.slug} value={row.slug}>{row.name}</option>
                ))}
              </select>
            </label>
          ) : null}
          <label className="text-sm font-bold">
            Prikaz
            <select
              className="mt-1 h-11 w-full rounded-md border border-border/70 bg-card px-3 text-sm font-normal"
              value={showAll ? "all" : "10"}
              onChange={(event) => update({ limit: event.target.value === "all" ? "all" : undefined })}
            >
              <option value="10">Prvih 10 (ili sva ako ih je manje)</option>
              <option value="all">Sva važeća naselja</option>
            </select>
          </label>
        </div>

        {loading ? (
          <p className="mt-8 text-muted-foreground">Učitavam rang-listu...</p>
        ) : error || !rankings ? (
          <p className="mt-8 text-muted-foreground">Rang-listu trenutno nije moguće učitati.</p>
        ) : (
          <div className="mt-8">
            <h2 className="text-xl font-extrabold">{rankings.direction === "asc" ? rankings.metric.low_ranking_label : rankings.metric.high_ranking_label}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {rankings.scope_note}. {rankings.eligible} od {rankings.universe} naselja ima važeći podatak.
              Rangiranje je natjecateljsko (1, 2, 2, 4). {rankings.metric.methodology}
            </p>
            {rankings.metric.source_family === "poi" ? (
              <p className="mt-2 text-sm text-muted-foreground">{rankings.metric.eligibility}</p>
            ) : null}
            <div className="mt-4">
              <AtlasRankingTableView rankings={rankings} />
            </div>
          </div>
        )}
      </section>
    </SiteLayout>
  );
};

export default AtlasRankings;
