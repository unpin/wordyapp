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
  // WHERE uses only index-compatible operators (ILIKE and % trigram op)
  // similarity() is kept only in ORDER BY — applied to already-filtered rows
  const rows = await db.execute<WordRow>(sql`
    SELECT id, word, lang
    FROM words
    WHERE
      word ILIKE ${"%" + query + "%"}
      OR word % ${query}
    ORDER BY
      CASE
        WHEN word ILIKE ${query}             THEN 0
        WHEN word ILIKE ${query + "%"}       THEN 1
        WHEN word ILIKE ${"%" + query + "%"} THEN 2
        ELSE 3
      END,
      similarity(word, ${query}) DESC
    LIMIT 10
  `);

  return new NextResponse(JSON.stringify(rows.rows));
}
