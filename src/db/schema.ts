import { relations } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export type See = { id: string; text: string };
export type Synonym = { id: string; text: string };
export type Grammar = Record<string, string[]>;
export type Usage = { text: string; type: string };
export type Note = { text: string; type: string };
export type Example = { text: string; translations: { text: string }[] };
export type BookmarkCollections = {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  isBookmarked: boolean;
};

// userId references auth.users(id) — managed by Supabase, not Drizzle
export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  stripeId: text("stripe_id").notNull(),
  status: text("status").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const words = pgTable(
  "words",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    word: text("word").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    lang: text("lang").notNull(),
  },
  (table) => [
    index("words_word_idx").on(table.word),
    uniqueIndex("words_word_lang_idx").on(table.word, table.lang),
    // GIN trigram index for fuzzy/contains search — see migration 0005_trgm_search.sql
    index("words_word_trgm_idx").using("gin").on(table.word),
  ],
);

export const wordRelations = relations(words, ({ many }) => ({
  senses: many(senses),
}));

export const senses = pgTable(
  "senses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    wordId: uuid("word_id")
      .notNull()
      .references(() => words.id, { onDelete: "cascade" }),
    refId: text("ref_id").notNull(),
    abbr: text("abbr"),
    grammar: jsonb("grammar").notNull().$type<Grammar>(),
    examples: jsonb("examples").notNull().$type<Example[]>(),
    synonyms: jsonb("synonyms").notNull().$type<Synonym[]>(),
    see: jsonb("see").notNull().$type<See[]>(),
    usages: jsonb("usages").notNull().$type<Usage[]>(),
    notes: jsonb("notes").notNull().$type<Note[]>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("senses_word_id_idx").on(table.wordId)],
);

export const bookmarks = pgTable(
  "bookmarks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    translationId: uuid("translation_id")
      .notNull()
      .references(() => translations.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    reviewCount: integer("review_count").notNull().default(0),
  },
  (table) => [
    uniqueIndex("bookmarks_user_translation_idx").on(
      table.userId,
      table.translationId,
    ),
  ],
);

export const bookmarkRelations = relations(bookmarks, ({ one, many }) => ({
  collectionBookmarks: many(collectionBookmarks),
  translation: one(translations, {
    fields: [bookmarks.translationId],
    references: [translations.id],
  }),
}));

export const senseRelations = relations(senses, ({ one, many }) => ({
  translations: many(translations),
  word: one(words, {
    fields: [senses.wordId],
    references: [words.id],
  }),
}));

export const translations = pgTable(
  "translations",
  {
    id: uuid("id").notNull().primaryKey().defaultRandom(),
    wordId: uuid("word_id")
      .notNull()
      .references(() => words.id, { onDelete: "cascade" }),
    senseId: uuid("sense_id")
      .notNull()
      .references(() => senses.id, { onDelete: "cascade" }),
    lang: text("lang").notNull(),
    text: text("text").notNull(),
    abbr: text("abbr"),
    grammar: jsonb("grammar").$type<Grammar>(),
    usages: jsonb("usages").$type<Usage[]>(),
    notes: jsonb("notes").$type<Note[]>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("translations_sense_id_idx").on(table.senseId)],
);

export const translationRelations = relations(
  translations,
  ({ one, many }) => ({
    sense: one(senses, {
      fields: [translations.senseId],
      references: [senses.id],
    }),
    bookmarks: many(bookmarks),
    word: one(words, {
      fields: [translations.wordId],
      references: [words.id],
    }),
  }),
);

export const collections = pgTable(
  "collections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    description: text("description").default("").notNull(),
    ownerId: uuid("owner_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("collections_owner_id_idx").on(table.ownerId)],
);

export const collectionRelations = relations(collections, ({ many }) => ({
  collectionBookmarks: many(collectionBookmarks),
}));

export const collectionBookmarks = pgTable(
  "collection_bookmarks",
  {
    collectionId: uuid("collection_id")
      .notNull()
      .references(() => collections.id, { onDelete: "cascade" }),

    bookmarkId: uuid("bookmark_id")
      .notNull()
      .references(() => bookmarks.id, { onDelete: "cascade" }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.collectionId, table.bookmarkId] }),
    index("collection_bookmarks_bookmark_id_idx").on(table.bookmarkId),
  ],
);

export const collecitonBookmarksRelations = relations(
  collectionBookmarks,
  ({ one }) => ({
    collection: one(collections, {
      fields: [collectionBookmarks.collectionId],
      references: [collections.id],
    }),
    bookmark: one(bookmarks, {
      fields: [collectionBookmarks.bookmarkId],
      references: [bookmarks.id],
    }),
  }),
);
