import { NextResponse } from 'next/server';
import * as categoriesRepo from '@/repositories/admin/categories';

const CATEGORY_NAMES = [
  'Electronics', 'Clothing', 'Home & Garden', 'Sports & Outdoors', 'Books',
  'Beauty & Personal Care', 'Toys & Games', 'Automotive', 'Health & Wellness', 'Food & Beverages',
  'Jewelry & Accessories', 'Pet Supplies', 'Arts & Crafts', 'Baby & Kids', 'Office Supplies',
  'Musical Instruments', 'Furniture', 'Kitchen & Dining', 'Travel & Luggage', 'Fitness Equipment'
];

const CATEGORY_DESCRIPTIONS = [
  'High-quality electronic devices and gadgets for modern living',
  'Trendy and comfortable clothing for all occasions',
  'Everything you need to make your house a home',
  'Gear and equipment for outdoor adventures and sports',
  'Educational and entertaining books for all ages',
  'Premium beauty products and personal care essentials',
  'Fun and educational toys for children of all ages',
  'Car accessories and automotive maintenance products',
  'Products to support your health and wellness journey',
  'Delicious food items and refreshing beverages',
  'Elegant jewelry and stylish accessories',
  'Quality supplies for your beloved pets',
  'Creative supplies for artistic expression',
  'Safe and nurturing products for babies and children',
  'Professional office supplies for productivity',
  'Musical instruments for aspiring and professional musicians',
  'Comfortable and stylish furniture for every room',
  'Essential kitchen tools and dining accessories',
  'Durable luggage and travel accessories',
  'Professional fitness equipment for home workouts'
];

function generateSlug(name: string): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `${name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')}-${timestamp}-${random}`;
}

export async function POST() {
  try {
    const categoriesToCreate = [];
    const usedIndices = new Set<number>();
    
    // Generate 5 random categories
    for (let i = 0; i < 5; i++) {
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * CATEGORY_NAMES.length);
      } while (usedIndices.has(randomIndex));
      
      usedIndices.add(randomIndex);
      
      const name = CATEGORY_NAMES[randomIndex];
      const description = CATEGORY_DESCRIPTIONS[randomIndex];
      
      categoriesToCreate.push({
        name,
        slug: generateSlug(name),
        description,
        isActive: Math.random() > 0.2, // 80% chance of being active
      });
    }

    // Insert categories
    const createdCategories = [];
    for (const categoryData of categoriesToCreate) {
      const category = await categoriesRepo.createCategory(categoryData);
      createdCategories.push(category);
    }

    return NextResponse.json({
      message: `Successfully created ${createdCategories.length} categories`,
      categories: createdCategories,
    });
  } catch (error) {
    console.error('Error creating categories:', error);
    return NextResponse.json(
      { error: 'Failed to create categories' },
      { status: 500 }
    );
  }
}