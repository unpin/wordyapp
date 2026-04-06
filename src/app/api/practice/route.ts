import { and, eq, notInArray, sql } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  bookmarks,
  collectionBookmarks,
  translations,
  words,
} from "@/db/schema";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const collectionId = searchParams.get("collectionId");

  try {
    const columns = {
      bookmarkId: bookmarks.id,
      translationId: translations.id,
      translationText: translations.text,
      word: words.word,
      wordLang: words.lang,
    };

    // Fetch 10 random bookmarks — filtered by collection or all
    const questionRows =
      collectionId && collectionId !== "all"
        ? await db
            .select(columns)
            .from(bookmarks)
            .innerJoin(
              collectionBookmarks,
              eq(collectionBookmarks.bookmarkId, bookmarks.id),
            )
            .innerJoin(
              translations,
              eq(translations.id, bookmarks.translationId),
            )
            .innerJoin(words, eq(words.id, translations.wordId))
            .where(
              and(
                eq(bookmarks.userId, user.id),
                eq(collectionBookmarks.collectionId, collectionId),
              ),
            )
            .orderBy(sql`RANDOM()`)
            .limit(10)
        : await db
            .select(columns)
            .from(bookmarks)
            .innerJoin(
              translations,
              eq(translations.id, bookmarks.translationId),
            )
            .innerJoin(words, eq(words.id, translations.wordId))
            .where(eq(bookmarks.userId, user.id))
            .orderBy(sql`RANDOM()`)
            .limit(10);

    if (questionRows.length === 0) {
      return NextResponse.json({ questions: [] });
    }

    // Fetch wrong answer options — random translations not used as correct answers
    const correctTranslationIds = questionRows.map((r) => r.translationId);
    const wrongOptions = await db
      .select({ text: translations.text })
      .from(translations)
      .where(notInArray(translations.id, correctTranslationIds))
      .orderBy(sql`RANDOM()`)
      .limit(questionRows.length * 2);

    const questions = questionRows.map((row, i) => {
      const wrongText = wrongOptions[i]?.text ?? "—";
      const options = [
        { text: row.translationText, isCorrect: true },
        { text: wrongText, isCorrect: false },
      ];
      if (Math.random() > 0.5) options.reverse();
      return {
        bookmarkId: row.bookmarkId,
        word: row.word,
        lang: row.wordLang,
        options,
      };
    });

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Failed to fetch practice questions", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
