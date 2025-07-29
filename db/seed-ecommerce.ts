import { db } from "@/db";
import { categories, collections, products, productImages, productCollections } from "@/db/schemas";

async function seedEcommerce() {
  console.log("🌱 Seeding ecommerce data...");

  // Seed categories
  const categoriesData = [
    {
      name: "Electronics",
      slug: "electronics",
      description: "Latest electronic gadgets and devices",
      imageUrl: "/categories/electronics.jpg",
    },
    {
      name: "Clothing",
      slug: "clothing",
      description: "Fashion and apparel for all occasions",
      imageUrl: "/categories/clothing.jpg",
    },
    {
      name: "Books",
      slug: "books",
      description: "Books for learning and entertainment",
      imageUrl: "/categories/books.jpg",
    },
    {
      name: "Home & Garden",
      slug: "home-garden",
      description: "Everything for your home and garden",
      imageUrl: "/categories/home-garden.jpg",
    },
  ];

  const insertedCategories = await db
    .insert(categories)
    .values(categoriesData)
    .returning();

  console.log(`✅ Inserted ${insertedCategories.length} categories`);

  // Seed collections
  const collectionsData = [
    {
      name: "Summer Sale",
      slug: "summer-sale",
      description: "Hot deals for the summer season",
      imageUrl: "/collections/summer-sale.jpg",
    },
    {
      name: "New Arrivals",
      slug: "new-arrivals",
      description: "Latest products in our store",
      imageUrl: "/collections/new-arrivals.jpg",
    },
    {
      name: "Best Sellers",
      slug: "best-sellers",
      description: "Our most popular products",
      imageUrl: "/collections/best-sellers.jpg",
    },
  ];

  const insertedCollections = await db
    .insert(collections)
    .values(collectionsData)
    .returning();

  console.log(`✅ Inserted ${insertedCollections.length} collections`);

  // Seed products
  const productsData = [
    {
      name: "Wireless Bluetooth Headphones",
      slug: "wireless-bluetooth-headphones",
      description: "High-quality wireless headphones with noise cancellation technology. Perfect for music lovers and professionals who need clear audio quality.",
      shortDescription: "Premium wireless headphones with noise cancellation",
      price: "99.99",
      compareAtPrice: "129.99",
      sku: "WBH-001",
      inventory: 50,
      categoryId: insertedCategories.find(c => c.slug === "electronics")?.id,
      isFeatured: true,
    },
    {
      name: "Cotton T-Shirt",
      slug: "cotton-t-shirt",
      description: "Comfortable 100% cotton t-shirt available in multiple colors. Made from organic cotton for a soft feel and sustainable choice.",
      shortDescription: "100% organic cotton t-shirt",
      price: "24.99",
      compareAtPrice: "34.99",
      sku: "CTS-001",
      inventory: 100,
      categoryId: insertedCategories.find(c => c.slug === "clothing")?.id,
      isFeatured: true,
    },
    {
      name: "JavaScript: The Definitive Guide",
      slug: "javascript-definitive-guide",
      description: "The comprehensive guide to JavaScript programming. Perfect for beginners and experienced developers alike.",
      shortDescription: "Complete JavaScript programming guide",
      price: "39.99",
      compareAtPrice: "49.99",
      sku: "JSG-001",
      inventory: 25,
      categoryId: insertedCategories.find(c => c.slug === "books")?.id,
      isFeatured: false,
    },
    {
      name: "Smart Home Security Camera",
      slug: "smart-home-security-camera",
      description: "WiFi-enabled security camera with night vision, motion detection, and mobile app control. Keep your home safe 24/7.",
      shortDescription: "WiFi security camera with mobile app",
      price: "149.99",
      compareAtPrice: "199.99",
      sku: "HSC-001",
      inventory: 30,
      categoryId: insertedCategories.find(c => c.slug === "electronics")?.id,
      isFeatured: true,
    },
    {
      name: "Ceramic Plant Pot Set",
      slug: "ceramic-plant-pot-set",
      description: "Beautiful set of 3 ceramic plant pots in different sizes. Perfect for indoor plants and herbs. Includes drainage holes and saucers.",
      shortDescription: "Set of 3 ceramic plant pots",
      price: "34.99",
      compareAtPrice: "44.99",
      sku: "CPP-001",
      inventory: 40,
      categoryId: insertedCategories.find(c => c.slug === "home-garden")?.id,
      isFeatured: false,
    },
    {
      name: "Denim Jacket",
      slug: "denim-jacket",
      description: "Classic denim jacket made from premium denim fabric. A timeless piece that goes with any outfit. Available in blue and black.",
      shortDescription: "Classic premium denim jacket",
      price: "79.99",
      compareAtPrice: "99.99",
      sku: "DJ-001",
      inventory: 35,
      categoryId: insertedCategories.find(c => c.slug === "clothing")?.id,
      isFeatured: true,
    },
  ];

  const insertedProducts = await db
    .insert(products)
    .values(productsData)
    .returning();

  console.log(`✅ Inserted ${insertedProducts.length} products`);

  // Add product images
  const productImagesData = [
    // Wireless Bluetooth Headphones
    {
      productId: insertedProducts.find(p => p.slug === "wireless-bluetooth-headphones")?.id!,
      url: "/products/headphones-1.jpg",
      altText: "Wireless Bluetooth Headphones - Front View",
      position: 0,
    },
    {
      productId: insertedProducts.find(p => p.slug === "wireless-bluetooth-headphones")?.id!,
      url: "/products/headphones-2.jpg",
      altText: "Wireless Bluetooth Headphones - Side View",
      position: 1,
    },
    // Cotton T-Shirt
    {
      productId: insertedProducts.find(p => p.slug === "cotton-t-shirt")?.id!,
      url: "/products/tshirt-1.jpg",
      altText: "Cotton T-Shirt - White",
      position: 0,
    },
    {
      productId: insertedProducts.find(p => p.slug === "cotton-t-shirt")?.id!,
      url: "/products/tshirt-2.jpg",
      altText: "Cotton T-Shirt - Black",
      position: 1,
    },
    // JavaScript Book
    {
      productId: insertedProducts.find(p => p.slug === "javascript-definitive-guide")?.id!,
      url: "/products/js-book-1.jpg",
      altText: "JavaScript: The Definitive Guide - Cover",
      position: 0,
    },
    // Security Camera
    {
      productId: insertedProducts.find(p => p.slug === "smart-home-security-camera")?.id!,
      url: "/products/camera-1.jpg",
      altText: "Smart Home Security Camera",
      position: 0,
    },
    // Plant Pot Set
    {
      productId: insertedProducts.find(p => p.slug === "ceramic-plant-pot-set")?.id!,
      url: "/products/pots-1.jpg",
      altText: "Ceramic Plant Pot Set",
      position: 0,
    },
    // Denim Jacket
    {
      productId: insertedProducts.find(p => p.slug === "denim-jacket")?.id!,
      url: "/products/jacket-1.jpg",
      altText: "Denim Jacket - Blue",
      position: 0,
    },
    {
      productId: insertedProducts.find(p => p.slug === "denim-jacket")?.id!,
      url: "/products/jacket-2.jpg",
      altText: "Denim Jacket - Worn",
      position: 1,
    },
  ];

  await db.insert(productImages).values(productImagesData);
  console.log(`✅ Inserted ${productImagesData.length} product images`);

  // Add products to collections
  const productCollectionsData = [
    // Summer Sale collection
    {
      productId: insertedProducts.find(p => p.slug === "cotton-t-shirt")?.id!,
      collectionId: insertedCollections.find(c => c.slug === "summer-sale")?.id!,
    },
    {
      productId: insertedProducts.find(p => p.slug === "denim-jacket")?.id!,
      collectionId: insertedCollections.find(c => c.slug === "summer-sale")?.id!,
    },
    // New Arrivals collection
    {
      productId: insertedProducts.find(p => p.slug === "smart-home-security-camera")?.id!,
      collectionId: insertedCollections.find(c => c.slug === "new-arrivals")?.id!,
    },
    {
      productId: insertedProducts.find(p => p.slug === "ceramic-plant-pot-set")?.id!,
      collectionId: insertedCollections.find(c => c.slug === "new-arrivals")?.id!,
    },
    // Best Sellers collection
    {
      productId: insertedProducts.find(p => p.slug === "wireless-bluetooth-headphones")?.id!,
      collectionId: insertedCollections.find(c => c.slug === "best-sellers")?.id!,
    },
    {
      productId: insertedProducts.find(p => p.slug === "cotton-t-shirt")?.id!,
      collectionId: insertedCollections.find(c => c.slug === "best-sellers")?.id!,
    },
    {
      productId: insertedProducts.find(p => p.slug === "denim-jacket")?.id!,
      collectionId: insertedCollections.find(c => c.slug === "best-sellers")?.id!,
    },
  ];

  await db.insert(productCollections).values(productCollectionsData);
  console.log(`✅ Inserted ${productCollectionsData.length} product-collection relationships`);

  console.log("🎉 Ecommerce seeding completed!");
}

if (require.main === module) {
  seedEcommerce()
    .then(() => {
      console.log("✅ Seeding completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Seeding failed:", error);
      process.exit(1);
    });
}

export { seedEcommerce };