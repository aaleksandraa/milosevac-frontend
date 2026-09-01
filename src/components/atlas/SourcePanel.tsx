import type { GeoSource } from "@/lib/atlas-types";

export function SourcePanel({ source, title = "Izvor i metodologija" }: { source?: GeoSource | null; title?: string }) {
  if (!source) return null;

  const items = [
    source.name ? ["Publikacija", source.name] : null,
    source.provider ? ["Izvor", source.provider] : null,
    source.dataset_version ? ["Verzija / godina", source.dataset_version] : null,
    source.retrieval_date ? ["Preuzeto", source.retrieval_date] : null,
    source.source_class_label ? ["Klasa", `${source.source_class_label} (${source.source_class})`] : null,
    source.attribution ? ["Atribucija", source.attribution] : null,
  ].filter((item): item is [string, string] => item !== null);

  return (
    <aside className="editorial-panel p-5 sm:p-6" aria-labelledby="atlas-izvor">
      <h2 id="atlas-izvor" className="text-lg font-extrabold">{title}</h2>
      <dl className="mt-4 grid gap-3 text-sm">
        {items.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</dt>
            <dd className="mt-0.5">{value}</dd>
          </div>
        ))}
      </dl>
      {source.methodology_note ? (
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{source.methodology_note}</p>
      ) : null}
    </aside>
  );
}
