ALTER TABLE "categories" ADD COLUMN "banner_url" text;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "display_mode" text DEFAULT 'products' NOT NULL;