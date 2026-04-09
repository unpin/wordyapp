CREATE EXTENSION IF NOT EXISTS unaccent;--> statement-breakpoint
CREATE OR REPLACE FUNCTION immutable_unaccent(text)
  RETURNS text
  LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT
  SET search_path = public
AS $func$
  SELECT unaccent($1)
$func$;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "words_word_unaccent_trgm_idx" ON "words" USING GIN (immutable_unaccent(word) gin_trgm_ops);
