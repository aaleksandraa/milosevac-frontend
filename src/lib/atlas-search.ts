const diacriticMap: Record<string, string> = {
  č: "c",
  ć: "c",
  đ: "d",
  š: "s",
  ž: "z",
};

export function normalizeAtlasQuery(value: string): string {
  const lowered = value.toLocaleLowerCase("bs");
  const stripped = Array.from(lowered, (character) => diacriticMap[character] ?? character).join("");

  return stripped.replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

export function atlasMatches(haystack: string, needle: string): boolean {
  const query = normalizeAtlasQuery(needle);
  if (query === "") return true;

  return normalizeAtlasQuery(haystack).includes(query);
}
