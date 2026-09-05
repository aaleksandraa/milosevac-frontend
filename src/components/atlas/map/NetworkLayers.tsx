import { useEffect, useState, type RefObject } from "react";
import type { Map as MapLibreMap, GeoJSONSource } from "maplibre-gl";
import { apiUrl } from "@/lib/backend";

export function NetworkLayers({ mapRef, ready, municipalitySlug }: { mapRef: RefObject<MapLibreMap>; ready: boolean; municipalitySlug?: string }) {
  const [scope, setScope] = useState(municipalitySlug ?? "modrica");
  const [roads, setRoads] = useState(false);
  const [water, setWater] = useState(false);
  const [error, setError] = useState("");
  const municipality = municipalitySlug ?? scope;
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const controller = new AbortController();
    for (const [layer, visible] of [["roads", roads], ["hydrography", water]] as const) {
      const id = `atlas-network-${layer}`;
      for (const suffix of ["line", "fill"]) if (map.getLayer(`${id}-${suffix}`)) map.setLayoutProperty(`${id}-${suffix}`, "visibility", "none");
      if (!visible) continue;
      fetch(apiUrl(`/geo/map/${layer}?municipality=${encodeURIComponent(municipality)}`), { signal: controller.signal, headers: { Accept: "application/json" } })
        .then(r => { if (!r.ok) throw new Error("Mrežni sloj trenutno nije dostupan."); return r.json(); })
        .then((data: Parameters<GeoJSONSource["setData"]>[0]) => {
          if (controller.signal.aborted) return;
          if (map.getSource(id)) (map.getSource(id) as GeoJSONSource).setData(data);
          else map.addSource(id, { type: "geojson", data, attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a> · ODbL' });
          if (!map.getLayer(`${id}-line`)) map.addLayer({ id: `${id}-line`, type: "line", source: id, paint: { "line-color": layer === "roads" ? "#b45309" : "#0284c7", "line-width": layer === "roads" ? 2.5 : ["match", ["get", "feature_type"], "river", 2.5, 1.2], "line-opacity": 0.8 } });
          if (layer === "hydrography" && !map.getLayer(`${id}-fill`)) map.addLayer({ id: `${id}-fill`, type: "fill", source: id, filter: ["==", ["geometry-type"], "Polygon"], paint: { "fill-color": "#38bdf8", "fill-opacity": 0.2 } });
          for (const suffix of ["line", "fill"]) if (map.getLayer(`${id}-${suffix}`)) map.setLayoutProperty(`${id}-${suffix}`, "visibility", "visible");
          setError("");
        }).catch(e => { if (!controller.signal.aborted) setError(e.message); });
    }
    return () => controller.abort();
  }, [mapRef, ready, municipality, roads, water]);
  return <fieldset className="mb-3 flex flex-wrap items-center gap-3 rounded-md border border-border/70 p-3 text-sm">
    <legend className="px-1 font-bold">Putevi i vode · OSM</legend>
    {!municipalitySlug ? <select aria-label="Opština za puteve i vode" value={scope} onChange={e => setScope(e.target.value)}><option value="modrica">Modriča</option><option value="samac">Šamac</option></select> : null}
    <label className="flex min-h-8 items-center gap-2"><input type="checkbox" checked={roads} onChange={e => setRoads(e.target.checked)} />Glavni putevi</label>
    <label className="flex min-h-8 items-center gap-2"><input type="checkbox" checked={water} onChange={e => setWater(e.target.checked)} />Vodotoci i vodene površine</label>
    {error ? <span role="status">{error}</span> : null}
  </fieldset>;
}
