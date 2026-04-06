import { eq, sql } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import BookmarkWithMenu from "@/components/features/BookmarkWithMenu";
import GenerateExample from "@/components/features/GenerateExample";
import TextToSpeachButton from "@/components/features/TextToSpeachButton";
import { db } from "@/db";
import { type Grammar, words } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

function flattenRecord(obj: Grammar) {
  return Object.values(obj).flat().join(", ");
}

// React.cache deduplicates this across generateMetadata + the page component —
// the DB is only queried once per request even though both call getWordData.
const getWordData = cache(
  async (decodedWord: string, userId: string | null) => {
    return db.query.words.findFirst({
      where: eq(words.word, decodedWord),
      with: {
        senses: {
          with: {
            translations: {
              extras: (t) => ({
                bookmarkId: sql<
                  string | null
                >`(SELECT id FROM bookmarks WHERE bookmarks.user_id = ${userId} AND bookmarks.translation_id = ${t.id} LIMIT 1)`.as(
                  "bookmarkId",
                ),
              }),
            },
          },
        },
      },
    });
  },
);

export async function generateMetadata({
  params,
}: PageProps<"/dictionary/[word]">): Promise<Metadata> {
  const { word: rawWord } = await params;
  const decodedWord = decodeURIComponent(rawWord);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const wordRow = await getWordData(decodedWord, user?.id ?? null);

  if (!wordRow) return { title: "Word not found" };

  const translationTexts = wordRow.senses
    .flatMap((s) => s.translations.map((t) => t.text))
    .slice(0, 4)
    .join(", ");

  const title = `${wordRow.word} – Bedeutung & Übersetzung`;
  const description = translationTexts
    ? `Was bedeutet „${wordRow.word}"? ${translationTexts}. Mit Beispielsätzen, Synonymen und Grammatik auf Wordy.`
    : `Definition und Übersetzung von „${wordRow.word}" im Wordy Wörterbuch. Mit Beispielen und Grammatik.`;

  const canonicalUrl = `${siteUrl}/dictionary/${encodeURIComponent(wordRow.word)}`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: translationTexts ? `${wordRow.word} – ${translationTexts}` : title,
      description,
      url: canonicalUrl,
      type: "article",
    },
  };
}

export default async function WordPage({
  params,
}: PageProps<"/dictionary/[word]">) {
  const { word: rawWord } = await params;
  const decodedWord = decodeURIComponent(rawWord);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const wordRow = await getWordData(decodedWord, user?.id ?? null);

  if (!wordRow) return notFound();

  const { word, senses, lang } = wordRow;

  const canonicalUrl = `${siteUrl}/dictionary/${encodeURIComponent(word)}`;

  const allTranslations = senses
    .flatMap((s) => s.translations.map((t) => t.text))
    .join(", ");

  const definedTermJsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: word,
    description: allTranslations || undefined,
    url: canonicalUrl,
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: "Wordy German Dictionary",
      url: `${siteUrl}/dictionary`,
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Dictionary",
        item: `${siteUrl}/dictionary`,
      },
      { "@type": "ListItem", position: 2, name: word, item: canonicalUrl },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: controlled server-side data
        dangerouslySetInnerHTML={{ __html: JSON.stringify(definedTermJsonLd) }}
      />
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: controlled server-side data
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <article className="max-w-7xl mx-auto my-4">
        <header className="flex items-center gap-3 mb-8">
          <h1 className="text-4xl font-bold">{word}</h1>
          <TextToSpeachButton size={24} text={word} lang={lang} />
        </header>

        <div className="flex flex-col gap-10">
          {senses.map(
            (
              {
                id,
                translations,
                grammar,
                examples,
                abbr,
                synonyms,
                usages,
                see,
              },
              index,
            ) => (
              <section key={id} aria-labelledby={`sense-${id}`}>
                <h2
                  id={`sense-${id}`}
                  className="border-l-4 border-l-purple-400 pl-4 mb-6"
                >
                  <span className="text-2xl font-bold text-gray-700 dark:text-gray-200">
                    {abbr ?? `Meaning ${index + 1}`}
                  </span>
                  {grammar && (
                    <span className="block text-sm text-gray-600 dark:text-gray-400 mt-1 font-normal">
                      {flattenRecord(grammar)}
                    </span>
                  )}
                </h2>

                {usages.length > 0 && (
                  <ul className="flex gap-2 flex-wrap mb-4">
                    {usages.map(({ text, type }) => (
                      <li
                        key={text + type}
                        className="text-xs px-2 py-0.5 rounded-full border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-500"
                      >
                        {type} {text}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="lg:w-4/6 flex flex-col gap-6">
                    <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-6 flex flex-col gap-5">
                      {translations.map(({ id, text, bookmarkId, abbr }) => (
                        <div
                          key={id}
                          className="flex items-center justify-between gap-4"
                        >
                          <span className="font-medium">
                            {text}
                            {abbr && (
                              <span className="text-gray-600 dark:text-gray-500 font-normal">
                                {" "}
                                ({abbr})
                              </span>
                            )}
                          </span>
                          <BookmarkWithMenu
                            translationId={id}
                            defaultBookmarkId={bookmarkId}
                          />
                        </div>
                      ))}

                      <hr className="border-t border-gray-200 dark:border-gray-800" />
                      <GenerateExample
                        word={word}
                        translations={translations.map((t) => t.text)}
                        abbr={abbr}
                        grammar={grammar ? flattenRecord(grammar) : null}
                      />

                      {examples.length > 0 && (
                        <>
                          <hr className="border-t border-gray-200 dark:border-gray-800" />
                          <ul className="flex flex-col gap-4">
                            {examples.map(({ text, translations }) => (
                              <li key={text}>
                                <p className="text-gray-900 dark:text-white italic">
                                  „{text}"
                                </p>
                                {translations.length > 0 && (
                                  <ul className="mt-1 text-gray-600 dark:text-gray-500 flex flex-col gap-1">
                                    {translations.map(({ text }) => (
                                      <li key={text}>{text}</li>
                                    ))}
                                  </ul>
                                )}
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="lg:w-2/6 flex flex-col gap-4">
                    {synonyms.length > 0 && (
                      <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-5 flex flex-col gap-4">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                          Synonyms
                        </h3>
                        <ul className="flex flex-wrap gap-2">
                          {synonyms.map(({ text, id }) => (
                            <li key={id}>
                              <Link
                                href={`/dictionary/${encodeURIComponent(text)}`}
                                className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 transition rounded-md px-3 py-1 text-sm"
                              >
                                {text}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {see.length > 0 && (
                      <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-5 flex flex-col gap-4">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                          See also
                        </h3>
                        <ul className="flex flex-wrap gap-2">
                          {see.map(({ id, text }) => (
                            <li key={id}>
                              <Link
                                href={`/dictionary/${encodeURIComponent(text)}`}
                                className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 transition rounded-md px-3 py-1 text-sm"
                              >
                                {text}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            ),
          )}
        </div>
      </article>
    </>
  );
}
