import { ilike } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { words } from "@/db/schema";

export async function GET(
  _req: NextRequest,
  { params }: RouteContext<"/api/search/[query]">,
) {
  const { query: rawQuery } = await params;
  const decodedQuery = decodeURIComponent(rawQuery);

  const wordRows = await db.query.words.findMany({
    where: ilike(words.word, `${decodedQuery}%`),
    limit: 10,
  });

  return new NextResponse(JSON.stringify(wordRows));
}
