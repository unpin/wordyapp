import { relations } from 'drizzle-orm';
import {
    bigint,
    jsonb,
    pgTable,
    text,
    varchar,
    uuid,
    timestamp,
} from 'drizzle-orm/pg-core';

export const subscriptions = pgTable('subscriptions', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
        .references(() => users.id)
        .notNull(),
    stripeId: text('stripe_id').notNull(),
    status: text('status').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull(),
    name: text('name').notNull(),
    plan: text('plan').notNull(),
    stripeId: text('stripe_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
        .defaultNow()
        .notNull(),
});

export const words = pgTable('words', {
    id: uuid('id').primaryKey().defaultRandom(),
    word: text('word').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
        .defaultNow()
        .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
        .defaultNow()
        .notNull(),
    lang: text('lang').notNull(),
});

export const senses = pgTable('senses', {
    id: uuid('id').primaryKey().defaultRandom(),
    wordId: uuid('word_id')
        .notNull()
        .references(() => words.id, { onDelete: 'cascade' }),
    refId: text('ref_id').notNull(),
    abbr: text('abbr'),
    grammar: jsonb('grammar').notNull(),
    examples: jsonb('examples').notNull(),
    synonyms: jsonb('synonyms').notNull(),
    see: jsonb('see').notNull(),
    usages: jsonb('usages').notNull(),
    notes: jsonb('notes').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
        .defaultNow()
        .notNull(),
});

export const bookmarks = pgTable('bookmarks', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
        .notNull()
        .references(() => users.id),
    translationId: uuid('translation_id')
        .notNull()
        .references(() => translations.id),
    createdAt: timestamp('created_at', { withTimezone: true })
        .notNull()
        .defaultNow(),
});

export const translations = pgTable('translations', {
    id: uuid('id').notNull().primaryKey().defaultRandom(),
    wordId: uuid('word_id')
        .notNull()
        .references(() => words.id, { onDelete: 'cascade' }),
    senseId: uuid('sense_id')
        .notNull()
        .references(() => senses.id, { onDelete: 'cascade' }),
    lang: text('lang').notNull(),
    text: text('text').notNull(),
    abbr: text('abbr'),
    grammar: jsonb('grammar'),
    examples: jsonb('examples'),
    usages: jsonb('usages'),
    notes: jsonb('notes'),
    createdAt: timestamp('created_at', { withTimezone: true })
        .defaultNow()
        .notNull(),
});

export const wordRelations = relations(words, ({ many }) => ({
    senses: many(senses),
}));

export const senseRelations = relations(senses, ({ one, many }) => ({
    translations: many(translations),
    word: one(words, {
        fields: [senses.wordId],
        references: [words.id],
    }),
}));

export const translationRelations = relations(translations, ({ one }) => ({
    sense: one(senses, {
        fields: [translations.senseId],
        references: [senses.id],
    }),
}));
