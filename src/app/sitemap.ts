import type { MetadataRoute } from "next";
import { db } from "@/db";
import { words } from "@/db/schema";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const dynamic = "force-dynamic";
export const revalidate = 86400; // 24 hours

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const allWords = await db
    .select({ word: words.word, updatedAt: words.updatedAt })
    .from(words);

  const wordEntries: MetadataRoute.Sitemap = allWords.map(({ word, updatedAt }) => ({
    url: `${siteUrl}/dictionary/${encodeURIComponent(word)}`,
    lastModified: updatedAt ?? new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/dictionary`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
  ];

  return [...staticPages, ...wordEntries];
}
