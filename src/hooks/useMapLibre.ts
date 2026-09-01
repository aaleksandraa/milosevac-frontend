import { useEffect, useRef, useState } from "react";
import type { Map as MapLibreMap } from "maplibre-gl";
import { atlasMapStyleUrl, BLANK_MAP_STYLE } from "@/lib/atlas-map-style";

type MapLibreModule = typeof import("maplibre-gl");

export function useMapLibre(enabled: boolean) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const [ready, setReady] = useState(false);
  const [webglFailed, setWebglFailed] = useState(false);
  const [basemapFailed, setBasemapFailed] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    let map: MapLibreMap | null = null;
    let maplibre: MapLibreModule | null = null;

    const start = async () => {
      const node = containerRef.current;
      if (!node) return;

      try {
        maplibre = await import("maplibre-gl");
        await import("maplibre-gl/dist/maplibre-gl.css");
        if (cancelled || !containerRef.current) return;

        map = new maplibre.Map({
          container: containerRef.current,
          style: atlasMapStyleUrl(),
          attributionControl: {
            compact: false,
            customAttribution: [
              'Granice naselja © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors (ODbL)',
              'Objekti © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors (ODbL)',
              "Visine: Copernicus DEM GLO-30",
            ],
          },
          cooperativeGestures: true,
          fadeDuration: 0,
          locale: {
            "CooperativeGesturesHandler.WindowsHelpText": "Koristite Ctrl + kotačić za zumiranje karte",
            "CooperativeGesturesHandler.MacHelpText": "Koristite ⌘ + kotačić za zumiranje karte",
            "CooperativeGesturesHandler.MobileHelpText": "Koristite dva prsta za pomicanje karte",
          },
        });

        map.addControl(new maplibre.NavigationControl({ showCompass: false, visualizePitch: false }), "top-right");
        mapRef.current = map;

        const markReady = () => {
          if (!cancelled) setReady(true);
        };

        map.once("load", markReady);
        map.on("error", (event) => {
          const message = String(event.error?.message ?? event.error ?? "");
          if (/webgl|failed to initialize|context/i.test(message)) {
            setWebglFailed(true);
            return;
          }
          if (!map || cancelled) return;
          if (map.isStyleLoaded()) return;
          setBasemapFailed(true);
          try {
            map.setStyle(BLANK_MAP_STYLE);
          } catch {
            setWebglFailed(true);
          }
        });
      } catch {
        if (!cancelled) setWebglFailed(true);
      }
    };

    void start();

    return () => {
      cancelled = true;
      setReady(false);
      mapRef.current = null;
      map?.remove();
    };
  }, [enabled]);

  return { containerRef, mapRef, ready, webglFailed, basemapFailed };
}
