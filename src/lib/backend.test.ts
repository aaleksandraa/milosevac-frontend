import { afterEach, describe, expect, it, vi } from "vitest";
import { apiUrl, resolveMediaUrl, resolveSrcSet, rewriteContentHtml } from "./backend";

describe("backend urls", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses vite proxy paths in development", () => {
    vi.stubEnv("DEV", true);
    expect(apiUrl("/content?limit=1")).toBe("/api/content?limit=1");
    expect(resolveMediaUrl("/storage/wordpress/test.webp")).toBe("/storage/wordpress/test.webp");
  });

  it("uses api subdomain in production", () => {
    vi.stubEnv("DEV", false);
    vi.stubEnv("VITE_BACKEND_PUBLIC_URL", "https://api.milosevac.com");

    expect(apiUrl("content?limit=1")).toBe("https://api.milosevac.com/api/content?limit=1");
    expect(resolveMediaUrl("/storage/wordpress/test.webp")).toBe(
      "https://api.milosevac.com/storage/wordpress/test.webp",
    );
    expect(resolveSrcSet("/storage/a.webp 480w, /storage/b.webp 1200w")).toBe(
      "https://api.milosevac.com/storage/a.webp 480w, https://api.milosevac.com/storage/b.webp 1200w",
    );
    expect(rewriteContentHtml('<img src="/storage/wordpress/a.webp">')).toBe(
      '<img src="https://api.milosevac.com/storage/wordpress/a.webp">',
    );
  });
});
