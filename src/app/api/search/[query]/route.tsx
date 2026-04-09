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

  if (query.length < 2) return new NextResponse(JSON.stringify([]));

  // Short queries (<3 chars): trigram index is ineffective
  // prefix match uses btree index (fast), contains match is a seq scan but limited
  if (query.length < 3) {
    const rows = await db.execute<WordRow>(sql`
      SELECT id, word, lang
      FROM words
      WHERE immutable_unaccent(word) ILIKE immutable_unaccent(${"%" + query + "%"})
      ORDER BY
        CASE
          WHEN immutable_unaccent(word) ILIKE immutable_unaccent(${query})       THEN 0
          WHEN immutable_unaccent(word) ILIKE immutable_unaccent(${query + "%"}) THEN 1
          ELSE 2
        END,
        length(word)
      LIMIT 10
    `);
    return new NextResponse(JSON.stringify(rows.rows));
  }

  // Longer queries: use GIN trigram index via % operator and ILIKE
  // similarity() only in ORDER BY — applied to already-filtered rows
  const rows = await db.execute<WordRow>(sql`
    SELECT id, word, lang
    FROM words
    WHERE
      immutable_unaccent(word) ILIKE immutable_unaccent(${"%" + query + "%"})
      OR immutable_unaccent(word) % immutable_unaccent(${query})
    ORDER BY
      CASE
        WHEN immutable_unaccent(word) ILIKE immutable_unaccent(${query})             THEN 0
        WHEN immutable_unaccent(word) ILIKE immutable_unaccent(${query + "%"})       THEN 1
        WHEN immutable_unaccent(word) ILIKE immutable_unaccent(${"%" + query + "%"}) THEN 2
        ELSE 3
      END,
      similarity(immutable_unaccent(word), immutable_unaccent(${query})) DESC
    LIMIT 10
  `);

  return new NextResponse(JSON.stringify(rows.rows));
}
