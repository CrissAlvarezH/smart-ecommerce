import { NextResponse } from "next/server";
import * as productsRepo from "@/repositories/admin/products";
import * as categoriesRepo from "@/repositories/admin/categories";

// Sample product data for generating random products
const productNames = [
  "Wireless Bluetooth Headphones",
  "Smart Fitness Tracker",
  "Portable Power Bank",
  "Wireless Charging Pad",
  "Bluetooth Speaker",
  "Smart Phone Case",
  "USB-C Cable",
  "Laptop Stand",
  "Wireless Mouse",
  "Gaming Keyboard",
  "4K Webcam",
  "Phone Screen Protector",
  "Car Phone Mount",
  "Portable SSD Drive",
  "Smart Watch Band",
  "Wireless Earbuds",
  "Phone Ring Holder",
  "Desktop Monitor",
  "Mechanical Keyboard",
  "Gaming Mouse Pad"
];

const descriptions = [
  "High-quality product with excellent build quality and modern design.",
  "Perfect for everyday use with premium materials and sleek finish.",
  "Advanced technology meets user-friendly design in this amazing product.",
  "Durable construction with attention to detail and superior performance.",
  "Innovative features combined with reliable functionality for your needs.",
  "Professional-grade quality with elegant design and outstanding durability.",
  "Cutting-edge technology designed for modern lifestyle and productivity.",
  "Premium materials and craftsmanship ensure long-lasting performance.",
  "Stylish design meets practical functionality in this versatile product.",
  "State-of-the-art features with intuitive controls and robust build quality."
];

const shortDescriptions = [
  "Premium quality with modern design",
  "Perfect for everyday use",
  "Advanced technology, user-friendly",
  "Durable and reliable performance",
  "Innovative features, great functionality",
  "Professional-grade quality",
  "Cutting-edge technology",
  "Premium materials, excellent craftsmanship",
  "Stylish and practical",
  "State-of-the-art features"
];

function generateSlug(name: string): string {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  
  // Add timestamp and random number to ensure uniqueness
  const timestamp = Date.now();
  const randomSuffix = Math.floor(Math.random() * 1000);
  
  return `${baseSlug}-${timestamp}-${randomSuffix}`;
}

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateRandomPrice(): string {
  const prices = [9.99, 19.99, 29.99, 39.99, 49.99, 59.99, 79.99, 99.99, 129.99, 149.99, 199.99, 299.99];
  return getRandomItem(prices).toString();
}

function generateRandomComparePrice(price: string): string | undefined {
  const basePrice = parseFloat(price);
  const shouldHaveComparePrice = Math.random() > 0.6; // 40% chance of having compare price
  
  if (!shouldHaveComparePrice) return undefined;
  
  const comparePrice = basePrice + (basePrice * 0.2) + Math.random() * (basePrice * 0.3); // 20-50% higher
  return (Math.round(comparePrice * 100) / 100).toString();
}

function generateRandomInventory(): number {
  return Math.floor(Math.random() * 100) + 1; // 1-100
}

function generateRandomWeight(): string | undefined {
  const shouldHaveWeight = Math.random() > 0.4; // 60% chance of having weight
  if (!shouldHaveWeight) return undefined;
  
  const weight = (Math.random() * 5 + 0.1).toFixed(2); // 0.1 - 5.1 kg
  return weight;
}

function generateRandomSKU(): string {
  const prefix = getRandomItem(['PRD', 'SKU', 'ITEM']);
  const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
}

export async function POST() {
  try {
    console.log("🌱 Starting product seeding...");
    
    // Get existing categories to assign to products
    const categories = await categoriesRepo.getActiveCategories();
    console.log(`📂 Found ${categories.length} categories`);
    
    const productsToCreate = [];
    const usedNames = new Set<string>();
    
    // Generate 10 unique random products
    for (let i = 0; i < 10; i++) {
      let productName;
      let attempts = 0;
      
      // Ensure unique product names by adding variations
      do {
        const baseName = getRandomItem(productNames);
        const variations = ['Pro', 'Plus', 'Elite', 'Max', 'Ultra', 'Mini', 'Lite', 'Premium'];
        const colors = ['Black', 'White', 'Silver', 'Blue', 'Red', 'Gray'];
        
        if (attempts === 0) {
          productName = baseName;
        } else if (attempts < 8) {
          productName = `${baseName} ${getRandomItem(variations)}`;
        } else if (attempts < 16) {
          productName = `${baseName} ${getRandomItem(colors)}`;
        } else {
          productName = `${baseName} ${getRandomItem(variations)} ${getRandomItem(colors)}`;
        }
        
        attempts++;
      } while (usedNames.has(productName) && attempts < 50);
      
      if (attempts >= 50) {
        // Fallback with timestamp to ensure uniqueness
        productName = `${getRandomItem(productNames)} ${Date.now()}`;
      }
      
      usedNames.add(productName);
      
      const price = generateRandomPrice();
      const compareAtPrice = generateRandomComparePrice(price);
      
      const productData = {
        name: productName,
        slug: generateSlug(productName),
        description: getRandomItem(descriptions),
        shortDescription: getRandomItem(shortDescriptions),
        price: price,
        compareAtPrice: compareAtPrice,
        sku: generateRandomSKU(),
        inventory: generateRandomInventory(),
        weight: generateRandomWeight(),
        categoryId: categories.length > 0 ? getRandomItem(categories).id : undefined,
        isActive: Math.random() > 0.1, // 90% chance of being active
        isFeatured: Math.random() > 0.7, // 30% chance of being featured
      };
      
      productsToCreate.push(productData);
    }
    
    // Create all products
    const createdProducts = [];
    for (const productData of productsToCreate) {
      console.log(`📦 Creating product: ${productData.name}`);
      const product = await productsRepo.createProduct(productData);
      createdProducts.push(product);
    }
    
    console.log(`✅ Successfully created ${createdProducts.length} products`);
    
    return NextResponse.json({
      success: true,
      message: `Successfully created ${createdProducts.length} random products`,
      products: createdProducts.map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        sku: p.sku,
        inventory: p.inventory,
        isActive: p.isActive,
        isFeatured: p.isFeatured
      }))
    });
    
  } catch (error) {
    console.error("❌ Error seeding products:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to seed products",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}