const trimTrailingSlash = (url: string) => url.replace(/\/$/, "");

export function getBackendPublicUrl(): string {
  return trimTrailingSlash(import.meta.env.VITE_BACKEND_PUBLIC_URL || "http://127.0.0.1:8002");
}

export function backendLoginUrl(): string {
  return `${getBackendPublicUrl()}/login`;
}

/** In dev, use Vite proxy (`/api/...`). In production, call the API subdomain directly. */
export function apiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const apiPath = normalized.startsWith("/api/") ? normalized : `/api${normalized}`;

  if (import.meta.env.DEV) {
    return apiPath;
  }

  return `${getBackendPublicUrl()}${apiPath}`;
}

/** Turn `/storage/...` from the API into an absolute URL on the API host in production. */
export function resolveMediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;

  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (import.meta.env.DEV) return normalized;

  return `${getBackendPublicUrl()}${normalized}`;
}

export function resolveSrcSet(srcSet: string | null | undefined): string | null | undefined {
  if (!srcSet) return srcSet;

  return srcSet
    .split(",")
    .map((entry) => {
      const trimmed = entry.trim();
      const space = trimmed.lastIndexOf(" ");
      if (space === -1) return resolveMediaUrl(trimmed) ?? trimmed;

      const url = trimmed.slice(0, space);
      const descriptor = trimmed.slice(space + 1);
      const resolved = resolveMediaUrl(url);
      return resolved ? `${resolved} ${descriptor}` : trimmed;
    })
    .join(", ");
}

export function rewriteContentHtml(html: string | null | undefined): string | undefined {
  if (!html || import.meta.env.DEV) return html ?? undefined;

  return html.replace(
    /(\s(?:src|href)=["'])\/(storage\/[^"']+)/gi,
    `$1${getBackendPublicUrl()}/$2`,
  );
}
