-- Create stores table
CREATE TABLE IF NOT EXISTS "stores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"owner_id" integer NOT NULL,
	"logo_url" text,
	"banner_url" text,
	"domain" text,
	"email" text,
	"phone" text,
	"address" text,
	"city" text,
	"state" text,
	"country" text,
	"postal_code" text,
	"currency" text DEFAULT 'USD' NOT NULL,
	"timezone" text DEFAULT 'UTC' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "stores_slug_unique" UNIQUE("slug"),
	CONSTRAINT "stores_domain_unique" UNIQUE("domain")
);

-- Add foreign key constraint for stores
DO $$ BEGIN
 ALTER TABLE "stores" ADD CONSTRAINT "stores_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Create a default store for existing data (if any exists)
-- This assumes there's at least one user to be the owner, otherwise adjust accordingly
INSERT INTO "stores" ("name", "slug", "description", "owner_id")
SELECT 'Default Store', 'default-store', 'Default store for existing data', MIN("id")
FROM "users"
WHERE NOT EXISTS (SELECT 1 FROM "stores")
AND EXISTS (SELECT 1 FROM "users");

-- Now add store_id columns as nullable first
ALTER TABLE "carts" ADD COLUMN "store_id" uuid;
ALTER TABLE "categories" ADD COLUMN "store_id" uuid;
ALTER TABLE "collections" ADD COLUMN "store_id" uuid;
ALTER TABLE "products" ADD COLUMN "store_id" uuid;

-- Update existing records to reference the default store
UPDATE "carts" SET "store_id" = (SELECT "id" FROM "stores" LIMIT 1) WHERE "store_id" IS NULL;
UPDATE "categories" SET "store_id" = (SELECT "id" FROM "stores" LIMIT 1) WHERE "store_id" IS NULL;
UPDATE "collections" SET "store_id" = (SELECT "id" FROM "stores" LIMIT 1) WHERE "store_id" IS NULL;
UPDATE "products" SET "store_id" = (SELECT "id" FROM "stores" LIMIT 1) WHERE "store_id" IS NULL;

-- Now make the columns NOT NULL
ALTER TABLE "carts" ALTER COLUMN "store_id" SET NOT NULL;
ALTER TABLE "categories" ALTER COLUMN "store_id" SET NOT NULL;
ALTER TABLE "collections" ALTER COLUMN "store_id" SET NOT NULL;
ALTER TABLE "products" ALTER COLUMN "store_id" SET NOT NULL;

-- Add foreign key constraints
DO $$ BEGIN
 ALTER TABLE "carts" ADD CONSTRAINT "carts_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "categories" ADD CONSTRAINT "categories_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "collections" ADD CONSTRAINT "collections_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "products" ADD CONSTRAINT "products_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Drop old unique constraints
ALTER TABLE "categories" DROP CONSTRAINT IF EXISTS "categories_slug_unique";
ALTER TABLE "collections" DROP CONSTRAINT IF EXISTS "collections_slug_unique";
ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "products_slug_unique";
ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "products_sku_unique";

-- Add new composite unique constraints
ALTER TABLE "categories" ADD CONSTRAINT "categories_slug_store_id_unique" UNIQUE("slug","store_id");
ALTER TABLE "collections" ADD CONSTRAINT "collections_slug_store_id_unique" UNIQUE("slug","store_id");
ALTER TABLE "products" ADD CONSTRAINT "products_slug_store_id_unique" UNIQUE("slug","store_id");
ALTER TABLE "products" ADD CONSTRAINT "products_sku_store_id_unique" UNIQUE("sku","store_id");