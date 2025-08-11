-- Drop existing shipping tables
DROP TABLE IF EXISTS shipping_methods CASCADE;
DROP TABLE IF EXISTS shipping_rates CASCADE;

-- Rename shipping_rate_id to shipping_zone_id in carts table
ALTER TABLE carts 
  DROP COLUMN IF EXISTS shipping_rate_id,
  ADD COLUMN IF NOT EXISTS shipping_zone_id UUID REFERENCES shipping_zones(id);

-- Modify shipping_zones table structure
ALTER TABLE shipping_zones 
  DROP COLUMN IF EXISTS countries,
  DROP COLUMN IF EXISTS states,
  DROP COLUMN IF EXISTS postal_codes,
  ADD COLUMN IF NOT EXISTS departments JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS cities JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) NOT NULL DEFAULT 0;