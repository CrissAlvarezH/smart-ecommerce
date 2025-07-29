const { drizzle } = require("drizzle-orm/postgres-js");
const postgres = require("postgres");
const { eq } = require("drizzle-orm");

// Load environment variables
require('dotenv').config();

async function testAddToCart() {
  const connectionString = `postgres://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
  
  const client = postgres(connectionString);

  try {
    console.log("Testing add to cart functionality...");
    
    // Get a product ID to test with
    const products = await client`SELECT id, name FROM products LIMIT 1`;
    if (products.length === 0) {
      console.log("❌ No products found in database");
      return;
    }
    
    const testProduct = products[0];
    console.log(`Testing with product: ${testProduct.name} (${testProduct.id})`);
    
    // Test creating a cart for guest user
    const sessionId = 'test-session-' + Date.now();
    console.log(`Creating cart with session ID: ${sessionId}`);
    
    const newCart = await client`
      INSERT INTO carts (session_id, created_at, updated_at)
      VALUES (${sessionId}, now(), now())
      RETURNING *
    `;
    
    console.log("✅ Cart created:", newCart[0]);
    
    // Test adding item to cart
    const cartItem = await client`
      INSERT INTO cart_items (cart_id, product_id, quantity, created_at, updated_at)
      VALUES (${newCart[0].id}, ${testProduct.id}, 1, now(), now())
      RETURNING *
    `;
    
    console.log("✅ Cart item added:", cartItem[0]);
    
    // Test retrieving cart with items
    const cartWithItems = await client`
      SELECT 
        ci.id as cart_item_id,
        ci.quantity,
        p.id as product_id,
        p.name as product_name,
        p.price
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = ${newCart[0].id}
    `;
    
    console.log("✅ Cart retrieved with items:", cartWithItems);
    
    // Clean up test data
    await client`DELETE FROM cart_items WHERE cart_id = ${newCart[0].id}`;
    await client`DELETE FROM carts WHERE id = ${newCart[0].id}`;
    console.log("✅ Test data cleaned up");
    
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    await client.end();
  }
}

testAddToCart();