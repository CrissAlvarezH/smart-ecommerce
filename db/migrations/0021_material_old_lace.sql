ALTER TABLE "carts" ADD COLUMN "shipping_rate_id" uuid;--> statement-breakpoint
ALTER TABLE "carts" ADD COLUMN "shipping_cost" numeric(10, 2) DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE "carts" ADD COLUMN "shipping_address" text;--> statement-breakpoint
ALTER TABLE "carts" ADD COLUMN "shipping_city" text;--> statement-breakpoint
ALTER TABLE "carts" ADD COLUMN "shipping_state" text;--> statement-breakpoint
ALTER TABLE "carts" ADD COLUMN "shipping_country" text;--> statement-breakpoint
ALTER TABLE "carts" ADD COLUMN "shipping_postal_code" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "carts" ADD CONSTRAINT "carts_shipping_rate_id_shipping_rates_id_fk" FOREIGN KEY ("shipping_rate_id") REFERENCES "public"."shipping_rates"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
