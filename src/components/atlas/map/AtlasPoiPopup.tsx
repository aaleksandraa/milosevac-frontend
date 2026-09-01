import { poiDisplayLabel, type AtlasPoiProperties } from "@/lib/atlas-poi-types";

export function AtlasPoiPopup({
  properties,
  onClose,
}: {
  properties: AtlasPoiProperties;
  onClose: () => void;
}) {
  const facts: Array<[string, string]> = [];
  if (properties.type_label) facts.push(["Tip", properties.type_label]);
  if (properties.settlement_name) facts.push(["Naselje", properties.settlement_name]);
  if (properties.municipality_name) facts.push(["Opština", properties.municipality_name]);
  if (properties.address) facts.push(["Adresa", properties.address]);
  if (properties.operator) facts.push(["Operator", properties.operator]);
  if (properties.phone) facts.push(["Telefon", properties.phone]);

  return (
    <div className="atlas-map-popup" role="dialog" aria-labelledby="atlas-poi-popup-title">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p id="atlas-poi-popup-title" className="text-base font-extrabold leading-tight">
            {poiDisplayLabel(properties)}
          </p>
          {properties.name_is_generic ? (
            <p className="mt-0.5 text-xs text-muted-foreground">Generički naziv po tipu; OSM objekat je bez vlastitog imena.</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md px-2 py-1 text-sm font-bold text-muted-foreground hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Zatvori karticu objekta"
        >
          Zatvori
        </button>
      </div>
      {facts.length > 0 ? (
        <dl className="mt-3 grid gap-1.5 text-sm">
          {facts.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-3">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="font-bold text-right">{value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {properties.website ? (
        <a
          href={properties.website.startsWith("http") ? properties.website : `https://${properties.website}`}
          className="action-link mt-3"
          rel="noopener noreferrer"
          target="_blank"
        >
          Veb stranica
        </a>
      ) : null}
    </div>
  );
}
