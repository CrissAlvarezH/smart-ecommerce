-- Seed Categories
INSERT INTO "categories" ("id", "name", "slug", "description", "image_url", "parent_id", "is_active", "created_at", "updated_at") VALUES
('cat-electronics', 'Electronics', 'electronics', 'Latest electronic gadgets and devices', '/categories/electronics.jpg', null, true, now(), now()),
('cat-clothing', 'Clothing', 'clothing', 'Fashion and apparel for all occasions', '/categories/clothing.jpg', null, true, now(), now()),
('cat-books', 'Books', 'books', 'Books for learning and entertainment', '/categories/books.jpg', null, true, now(), now()),
('cat-home-garden', 'Home & Garden', 'home-garden', 'Everything for your home and garden', '/categories/home-garden.jpg', null, true, now(), now())
ON CONFLICT ("slug") DO NOTHING;

-- Seed Collections
INSERT INTO "collections" ("id", "name", "slug", "description", "image_url", "is_active", "created_at", "updated_at") VALUES
('coll-summer-sale', 'Summer Sale', 'summer-sale', 'Hot deals for the summer season', '/collections/summer-sale.jpg', true, now(), now()),
('coll-new-arrivals', 'New Arrivals', 'new-arrivals', 'Latest products in our store', '/collections/new-arrivals.jpg', true, now(), now()),
('coll-best-sellers', 'Best Sellers', 'best-sellers', 'Our most popular products', '/collections/best-sellers.jpg', true, now(), now())
ON CONFLICT ("slug") DO NOTHING;

-- Seed Products
INSERT INTO "products" ("id", "name", "slug", "description", "short_description", "price", "compare_at_price", "sku", "inventory", "weight", "category_id", "is_active", "is_featured", "created_at", "updated_at") VALUES
('prod-headphones', 'Wireless Bluetooth Headphones', 'wireless-bluetooth-headphones', 'High-quality wireless headphones with noise cancellation technology. Perfect for music lovers and professionals who need clear audio quality.', 'Premium wireless headphones with noise cancellation', 99.99, 129.99, 'WBH-001', 50, null, 'cat-electronics', true, true, now(), now()),
('prod-tshirt', 'Cotton T-Shirt', 'cotton-t-shirt', 'Comfortable 100% cotton t-shirt available in multiple colors. Made from organic cotton for a soft feel and sustainable choice.', '100% organic cotton t-shirt', 24.99, 34.99, 'CTS-001', 100, null, 'cat-clothing', true, true, now(), now()),
('prod-js-book', 'JavaScript: The Definitive Guide', 'javascript-definitive-guide', 'The comprehensive guide to JavaScript programming. Perfect for beginners and experienced developers alike.', 'Complete JavaScript programming guide', 39.99, 49.99, 'JSG-001', 25, null, 'cat-books', true, false, now(), now()),
('prod-camera', 'Smart Home Security Camera', 'smart-home-security-camera', 'WiFi-enabled security camera with night vision, motion detection, and mobile app control. Keep your home safe 24/7.', 'WiFi security camera with mobile app', 149.99, 199.99, 'HSC-001', 30, null, 'cat-electronics', true, true, now(), now()),
('prod-plant-pots', 'Ceramic Plant Pot Set', 'ceramic-plant-pot-set', 'Beautiful set of 3 ceramic plant pots in different sizes. Perfect for indoor plants and herbs. Includes drainage holes and saucers.', 'Set of 3 ceramic plant pots', 34.99, 44.99, 'CPP-001', 40, null, 'cat-home-garden', true, false, now(), now()),
('prod-denim-jacket', 'Denim Jacket', 'denim-jacket', 'Classic denim jacket made from premium denim fabric. A timeless piece that goes with any outfit. Available in blue and black.', 'Classic premium denim jacket', 79.99, 99.99, 'DJ-001', 35, null, 'cat-clothing', true, true, now(), now())
ON CONFLICT ("slug") DO NOTHING;

-- Seed Product Images
INSERT INTO "product_images" ("id", "product_id", "url", "alt_text", "position", "created_at") VALUES
(gen_random_uuid(), 'prod-headphones', '/products/headphones-1.jpg', 'Wireless Bluetooth Headphones - Front View', 0, now()),
(gen_random_uuid(), 'prod-headphones', '/products/headphones-2.jpg', 'Wireless Bluetooth Headphones - Side View', 1, now()),
(gen_random_uuid(), 'prod-tshirt', '/products/tshirt-1.jpg', 'Cotton T-Shirt - White', 0, now()),
(gen_random_uuid(), 'prod-tshirt', '/products/tshirt-2.jpg', 'Cotton T-Shirt - Black', 1, now()),
(gen_random_uuid(), 'prod-js-book', '/products/js-book-1.jpg', 'JavaScript: The Definitive Guide - Cover', 0, now()),
(gen_random_uuid(), 'prod-camera', '/products/camera-1.jpg', 'Smart Home Security Camera', 0, now()),
(gen_random_uuid(), 'prod-plant-pots', '/products/pots-1.jpg', 'Ceramic Plant Pot Set', 0, now()),
(gen_random_uuid(), 'prod-denim-jacket', '/products/jacket-1.jpg', 'Denim Jacket - Blue', 0, now()),
(gen_random_uuid(), 'prod-denim-jacket', '/products/jacket-2.jpg', 'Denim Jacket - Worn', 1, now())
ON CONFLICT DO NOTHING;

-- Seed Product Collections
INSERT INTO "product_collections" ("id", "product_id", "collection_id", "created_at") VALUES
-- Summer Sale collection
(gen_random_uuid(), 'prod-tshirt', 'coll-summer-sale', now()),
(gen_random_uuid(), 'prod-denim-jacket', 'coll-summer-sale', now()),
-- New Arrivals collection
(gen_random_uuid(), 'prod-camera', 'coll-new-arrivals', now()),
(gen_random_uuid(), 'prod-plant-pots', 'coll-new-arrivals', now()),
-- Best Sellers collection
(gen_random_uuid(), 'prod-headphones', 'coll-best-sellers', now()),
(gen_random_uuid(), 'prod-tshirt', 'coll-best-sellers', now()),
(gen_random_uuid(), 'prod-denim-jacket', 'coll-best-sellers', now())
ON CONFLICT DO NOTHING;