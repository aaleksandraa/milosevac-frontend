import { Link } from "react-router-dom";
import { usePortalContent } from "@/hooks/usePortalContent";
import { useDeferredMount } from "@/hooks/useDeferredMount";

export function BreakingTicker() {
  const ready = useDeferredMount(1200);
  const { articles } = usePortalContent(ready);
  const breaking = articles.filter((article) => {
    if (!article.urgent) return false;
    if (article.serviceType === "power_outage") {
      return article.places?.some((place) => place.isPrimary) ?? false;
    }
    return true;
  }).slice(0, 5);
  const source = breaking.length > 0 ? breaking : articles.slice(0, 5);
  const items = [...source, ...source];

  if (items.length === 0) return null;

  return (
    <div className="border-b border-white/10 bg-surface-dark text-white">
      <div className="container-news flex h-9 items-center overflow-hidden">
        <div className="group relative flex-1 overflow-hidden">
          <div className="marquee-track flex gap-10 whitespace-nowrap text-sm font-semibold text-white/90 group-hover:[animation-play-state:paused]">
            {items.map((it, i) => (
              <span key={`${it.slug}-${i}`} className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-highlight" aria-hidden />
                <span className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-highlight">
                  {it.urgent ? "Hitno:" : "Najnovije:"}
                </span>
                <Link to={`/clanak/${it.slug}`} className="hover:text-white hover:underline underline-offset-4">
                  {it.title}
                </Link>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
