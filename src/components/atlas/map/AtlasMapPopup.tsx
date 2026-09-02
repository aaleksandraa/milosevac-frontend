import { Link } from "react-router-dom";
import { formatAreaKm2, formatBsNumber, formatElevationM, formatPrecipitationMm, formatSlopeDeg, formatTemperatureC } from "@/lib/atlas-format";
import { settlementPath } from "@/lib/atlas-map-style";
import type { AtlasMapFeatureProperties } from "@/lib/atlas-map-types";

export function AtlasMapPopup({
  properties,
  onClose,
}: {
  properties: AtlasMapFeatureProperties;
  onClose: () => void;
}) {
  const href = settlementPath(properties);
  const facts = [
    properties.population_2013 !== undefined
      ? ["Stanovništvo 2013.", `${formatBsNumber(properties.population_2013)} stanovnika`]
      : null,
    properties.area_km2 !== undefined ? ["Površina", formatAreaKm2(properties.area_km2)] : null,
    properties.elevation_mean_m !== undefined
      ? ["Prosječna visina prema DEM-u", formatElevationM(properties.elevation_mean_m)]
      : null,
    properties.elevation_min_m !== undefined && properties.elevation_max_m !== undefined
      ? ["Raspon visine", `${formatElevationM(properties.elevation_min_m)} – ${formatElevationM(properties.elevation_max_m)}`]
      : null,
    properties.slope_mean_deg !== undefined ? ["Prosječan nagib", formatSlopeDeg(properties.slope_mean_deg)] : null,
    properties.temperature_mean_annual_c !== undefined
      ? ["Prosječna godišnja temperatura", formatTemperatureC(properties.temperature_mean_annual_c)]
      : null,
    properties.precipitation_annual_mm !== undefined
      ? ["Godišnje padavine", formatPrecipitationMm(properties.precipitation_annual_mm)]
      : null,
  ].filter((item): item is [string, string] => item !== null);

  return (
    <div className="atlas-map-popup" role="dialog" aria-labelledby="atlas-map-popup-title">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p id="atlas-map-popup-title" className="text-base font-extrabold leading-tight">
            {properties.settlement_name}
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">Opština {properties.municipality_name}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md px-2 py-1 text-sm font-bold text-muted-foreground hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Zatvori karticu naselja"
        >
          Zatvori
        </button>
      </div>
      <dl className="mt-3 grid gap-1.5 text-sm">
        {facts.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-3">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="font-bold text-right">{value}</dd>
          </div>
        ))}
      </dl>
      <Link to={href} className="action-link mt-4">
        Detalji o naselju
      </Link>
    </div>
  );
}
