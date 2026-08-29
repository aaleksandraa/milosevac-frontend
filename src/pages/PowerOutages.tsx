import { useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AlertTriangle, Clock, MapPin, Zap } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import {
  formatOutageWindow,
  outageLocationLabel,
  type OutageStatus,
  useOutages,
} from "@/hooks/useOutages";
import { formatDateBs } from "@/data/content";
import { cn } from "@/lib/utils";

const statusOptions: { key: OutageStatus | "all"; label: string }[] = [
  { key: "all", label: "Svi" },
  { key: "active", label: "Aktivni" },
  { key: "upcoming", label: "Najavljeni" },
  { key: "past", label: "Završeni" },
];

const statusLabel: Record<OutageStatus, string> = {
  active: "Aktivan prekid",
  upcoming: "Najavljen prekid",
  past: "Završen prekid",
};

function OutageStatusBadge({ status }: { status?: OutageStatus | null }) {
  if (!status) return null;

  const styles = {
    active: "bg-urgent text-urgent-foreground",
    upcoming: "bg-accent text-accent-foreground",
    past: "bg-secondary text-muted-foreground",
  };

  return <span className={cn("category-pill", styles[status])}>{statusLabel[status]}</span>;
}

const PowerOutages = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const place = searchParams.get("place") ?? undefined;
  const statusParam = searchParams.get("status");
  const status = statusParam === "active" || statusParam === "upcoming" || statusParam === "past" ? statusParam : undefined;

  const { places, outages, loading, error, refetch } = useOutages({ place, status });

  useEffect(() => {
    document.title = "Prekidi struje - Miloševac";
    window.scrollTo({ top: 0 });
  }, []);

  const placeChips = useMemo(
    () => [{ slug: "", name: "Sva mjesta", isPrimary: false }, ...places],
    [places],
  );

  const updateFilter = (nextPlace?: string, nextStatus?: OutageStatus | "all") => {
    const params = new URLSearchParams();
    if (nextPlace) params.set("place", nextPlace);
    if (nextStatus && nextStatus !== "all") params.set("status", nextStatus);
    setSearchParams(params);
  };

  return (
    <SiteLayout>
      <section className="container-news pt-6 sm:pt-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-border/70 pb-5">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-md bg-accent/10 px-3 py-1 text-sm font-extrabold text-accent">
              <Zap className="h-4 w-4" /> Planirani prekidi
            </div>
            <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">Prekidi struje</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Obavijesti Elektro Doboja za Modričku regiju. Miloševac je istaknut, a prekide možete filtrirati po mjestu i statusu.
            </p>
          </div>
          <Button type="button" variant="outline" onClick={() => refetch()}>
            Osvježi
          </Button>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {placeChips.map((chip) => (
            <button
              key={chip.slug || "all"}
              type="button"
              onClick={() => updateFilter(chip.slug || undefined, status ?? "all")}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm font-bold transition",
                (place ?? "") === chip.slug
                  ? chip.isPrimary
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-ink bg-ink text-white"
                  : "border-border bg-card text-muted-foreground hover:border-primary hover:text-primary",
              )}
            >
              {chip.name}
            </button>
          ))}
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {statusOptions.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => updateFilter(place, option.key)}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-extrabold transition",
                (status ?? "all") === option.key ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-primary",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        {loading && <div className="py-16 text-center text-muted-foreground">Učitavam prekide...</div>}

        {!loading && error && (
          <div className="rounded-lg border border-urgent/30 bg-urgent/5 p-6 text-center">
            <AlertTriangle className="mx-auto mb-3 h-6 w-6 text-urgent" />
            <p className="font-bold">Prekide trenutno nije moguće učitati.</p>
          </div>
        )}

        {!loading && !error && outages.length === 0 && (
          <div className="rounded-lg border border-border/70 bg-card p-8 text-center text-muted-foreground">
            Nema prekida za odabrane filtere.
          </div>
        )}

        <div className="grid gap-4">
          {outages.map((outage) => {
            const location = outageLocationLabel(outage);
            const window = formatOutageWindow(outage.noticeStartsAt, outage.noticeEndsAt);
            const isMilosevac = outage.places?.some((item) => item.isPrimary);

            return (
              <article
                key={outage.slug}
                className={cn(
                  "rounded-lg border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-card-hover",
                  isMilosevac ? "border-primary/40 bg-primary/5" : "border-border/70 bg-card",
                )}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <OutageStatusBadge status={outage.outageStatus} />
                  {isMilosevac && <span className="category-pill bg-primary text-primary-foreground">Miloševac</span>}
                  {outage.places?.filter((item) => !item.isPrimary).map((item) => (
                    <span key={item.slug} className="category-pill bg-secondary text-secondary-foreground">
                      {item.name}
                    </span>
                  ))}
                </div>

                <h2 className="mt-3 text-xl font-extrabold leading-snug">
                  <Link to={`/clanak/${outage.slug}`} className="hover:text-primary">
                    {outage.title}
                  </Link>
                </h2>

                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{outage.excerpt}</p>

                <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-primary" />
                    {formatDateBs(outage.noticeStartsAt ?? outage.date)} {window && `· ${window}`}
                  </span>
                  {location && (
                    <span className="inline-flex min-w-0 items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-primary" />
                      {location}
                    </span>
                  )}
                </div>

                <div className="mt-4">
                  <Link to={`/clanak/${outage.slug}`} className="action-link">
                    Pročitaj obavijest
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </SiteLayout>
  );
};

export default PowerOutages;
