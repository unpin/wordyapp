ALTER TABLE "translations" ALTER COLUMN "grammar" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "translations" ALTER COLUMN "examples" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "translations" ALTER COLUMN "usages" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "translations" ALTER COLUMN "notes" DROP NOT NULL;