import { sql } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";

type WordRow = { id: string; word: string; lang: string };

export async function GET(
  _req: NextRequest,
  { params }: RouteContext<"/api/search/[query]">,
) {
  const { query: rawQuery } = await params;
  const query = decodeURIComponent(rawQuery).trim();

  if (!query) return new NextResponse(JSON.stringify([]));

  // Ranked search using pg_trgm:
  // 0 — exact match
  // 1 — prefix match  (vorb… → vorbei…)
  // 2 — contains match (vorbeikommen → an etw. vorbeikommen)
  // 3 — trigram similarity (typos, partial tokens)
  const rows = await db.execute<WordRow>(sql`
    SELECT id, word, lang
    FROM words
    WHERE
      word ILIKE ${"%" + query + "%"}
      OR similarity(word, ${query}) > 0.15
    ORDER BY
      CASE
        WHEN word ILIKE ${query}           THEN 0
        WHEN word ILIKE ${query + "%"}     THEN 1
        WHEN word ILIKE ${"%" + query + "%"} THEN 2
        ELSE 3
      END,
      similarity(word, ${query}) DESC
    LIMIT 10
  `);

  return new NextResponse(JSON.stringify(rows.rows));
}
