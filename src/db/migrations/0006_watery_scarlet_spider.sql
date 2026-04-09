CREATE EXTENSION IF NOT EXISTS pg_trgm;--> statement-breakpoint
DROP INDEX IF EXISTS "words_word_trgm_idx";--> statement-breakpoint
CREATE INDEX "words_word_trgm_idx" ON "words" USING GIN (word gin_trgm_ops);
