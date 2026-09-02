import { Link } from "react-router-dom";
import { formatMetricValue, relativeFactSentence, relativePercentileSentence } from "@/lib/atlas-ranking";
import type { AtlasRelativeFact } from "@/lib/atlas-ranking-types";

export function AtlasRelativeFacts({ facts }: { facts: AtlasRelativeFact[] }) {
  if (facts.length === 0) return null;

  return (
    <section className="mt-8" aria-labelledby="polozaj-naselja">
      <h2 id="polozaj-naselja" className="text-lg font-extrabold">
        Položaj među obrađenim naseljima
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Rangovi se odnose samo na trenutno obrađena naselja s važećim podatkom za taj metrik. Ovo nisu rangovi Bosne i Hercegovine.
      </p>
      <ul className="mt-4 grid gap-3">
        {facts.map((fact) => (
          <li key={fact.metric} className="editorial-panel p-4">
            <p className="font-extrabold">{relativeFactSentence(fact)}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatMetricValue(fact.value, fact.unit, 1)}
              {relativePercentileSentence(fact) ? ` · ${relativePercentileSentence(fact)}` : ""}
            </p>
          </li>
        ))}
      </ul>
      <p className="mt-4">
        <Link to="/rang-liste" className="action-link">
          Otvori rang-liste
        </Link>
      </p>
    </section>
  );
}
