import { describe, expect, it } from "vitest";
import { type Article } from "@/data/content";
import { sortOutageArticles } from "@/hooks/useOutages";

function outage(partial: Partial<Article> & Pick<Article, "slug">): Article {
  return {
    slug: partial.slug,
    title: partial.title ?? partial.slug,
    excerpt: "",
    category: "vijesti",
    date: partial.date ?? "2026-09-01",
    readingTime: 1,
    cover: { hue: 0, pattern: "grid" },
    ...partial,
  };
}

describe("sortOutageArticles", () => {
  it("sorts upcoming outages chronologically by outage date", () => {
    const sorted = sortOutageArticles([
      outage({
        slug: "later",
        noticeStartsAt: "2026-09-03T09:00:00+02:00",
        outageStatus: "upcoming",
      }),
      outage({
        slug: "earlier",
        noticeStartsAt: "2026-09-01T12:00:00+02:00",
        outageStatus: "upcoming",
      }),
      outage({
        slug: "middle",
        noticeStartsAt: "2026-09-02T09:00:00+02:00",
        outageStatus: "upcoming",
      }),
    ]);

    expect(sorted.map((item) => item.slug)).toEqual(["earlier", "middle", "later"]);
  });

  it("shows active and upcoming before past outages", () => {
    const sorted = sortOutageArticles([
      outage({
        slug: "past",
        noticeStartsAt: "2026-08-30T09:00:00+02:00",
        outageStatus: "past",
      }),
      outage({
        slug: "upcoming",
        noticeStartsAt: "2026-09-02T09:00:00+02:00",
        outageStatus: "upcoming",
      }),
      outage({
        slug: "active",
        noticeStartsAt: "2026-09-01T09:00:00+02:00",
        outageStatus: "active",
      }),
    ]);

    expect(sorted.map((item) => item.slug)).toEqual(["active", "upcoming", "past"]);
  });

  it("sorts past outages from newest to oldest", () => {
    const sorted = sortOutageArticles([
      outage({
        slug: "older-past",
        noticeStartsAt: "2026-08-28T09:00:00+02:00",
        outageStatus: "past",
      }),
      outage({
        slug: "recent-past",
        noticeStartsAt: "2026-08-31T09:00:00+02:00",
        outageStatus: "past",
      }),
    ]);

    expect(sorted.map((item) => item.slug)).toEqual(["recent-past", "older-past"]);
  });
});
