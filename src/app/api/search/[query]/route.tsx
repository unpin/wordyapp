import { sql } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";

type WordRow = { id: string; word: string; lang: string };

const PAGE_SIZE = 10;

export async function GET(
  req: NextRequest,
  { params }: RouteContext<"/api/search/[query]">,
) {
  const { query: rawQuery } = await params;
  const query = decodeURIComponent(rawQuery).trim();

  if (query.length < 2) return NextResponse.json({ results: [], hasMore: false });

  const offset = Math.max(0, Number(req.nextUrl.searchParams.get("offset")) || 0);

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
      LIMIT ${PAGE_SIZE + 1} OFFSET ${offset}
    `);
    const hasMore = rows.rows.length > PAGE_SIZE;
    return NextResponse.json({ results: rows.rows.slice(0, PAGE_SIZE), hasMore });
  }

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
    LIMIT ${PAGE_SIZE + 1} OFFSET ${offset}
  `);

  const hasMore = rows.rows.length > PAGE_SIZE;
  return NextResponse.json({ results: rows.rows.slice(0, PAGE_SIZE), hasMore });
}
