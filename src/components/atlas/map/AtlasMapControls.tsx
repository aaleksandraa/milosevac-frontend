import { THEMATIC_MODES, type AtlasThematicMode } from "@/lib/atlas-map-types";

export function AtlasMapControls({
  mode,
  onModeChange,
}: {
  mode: AtlasThematicMode;
  onModeChange: (mode: AtlasThematicMode) => void;
}) {
  return (
    <fieldset className="atlas-map-controls">
      <legend className="sr-only">Prikaz karte</legend>
      <label htmlFor="atlas-map-mode" className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        Prikaz
      </label>
      <select
        id="atlas-map-mode"
        value={mode}
        onChange={(event) => onModeChange(event.target.value as AtlasThematicMode)}
        className="h-9 w-full rounded-md border border-border/70 bg-background px-2 text-sm font-bold outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {THEMATIC_MODES.map((item) => (
          <option key={item.id} value={item.id}>
            {item.label}
          </option>
        ))}
      </select>
    </fieldset>
  );
}
