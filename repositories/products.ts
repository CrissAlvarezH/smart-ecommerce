import { db } from "@/db";
import { categories, collections, products, productImages, productCollections, carts, cartItems, discounts, productDiscounts } from "@/db/schemas";
import { eq, desc, and, ilike, gte } from "drizzle-orm";

// Helper function to apply discounts to products
export async function applyDiscountsToProducts(productsData: any[]) {
  if (productsData.length === 0) return productsData;

  // Get all product IDs
  const productIds = productsData.map(p => p.id);

  // Get active discounts for these products
  const activeDiscounts = await db
    .select({
      productId: productDiscounts.productId,
      discountId: discounts.id,
      name: discounts.name,
      percentage: discounts.percentage,
      endDate: discounts.endDate,
    })
    .from(productDiscounts)
    .innerJoin(discounts, eq(productDiscounts.discountId, discounts.id))
    .where(and(
      eq(discounts.isActive, true),
      gte(discounts.endDate, new Date())
    ));

  // Group discounts by product ID and get the best discount (highest percentage)
  const discountMap = new Map();
  activeDiscounts.forEach(discount => {
    const productId = discount.productId;
    const currentBest = discountMap.get(productId);
    if (!currentBest || parseFloat(discount.percentage) > parseFloat(currentBest.percentage)) {
      discountMap.set(productId, discount);
    }
  });

  // Apply discounts to products
  return productsData.map(product => {
    const discount = discountMap.get(product.id);
    if (discount) {
      // Dynamic discount from discounts table
      const originalPrice = parseFloat(product.price);
      const discountPercentage = parseFloat(discount.percentage);
      const discountedPrice = originalPrice * (1 - discountPercentage / 100);
      
      return {
        ...product,
        originalPrice: product.price,
        price: discountedPrice.toFixed(2),
        compareAtPrice: product.price, // Original price becomes the compare at price
        discountInfo: {
          id: discount.discountId,
          name: discount.name,
          percentage: discount.percentage,
          endDate: discount.endDate,
        }
      };
    } else if (product.compareAtPrice && parseFloat(product.compareAtPrice) > parseFloat(product.price)) {
      // Direct compareAtPrice discount in products table
      return {
        ...product,
        // Keep the existing price (already discounted) and compareAtPrice (original)
        price: product.price,
        compareAtPrice: product.compareAtPrice
      };
    }
    return product;
  });
}

export async function getProducts(limit = 20, offset = 0, storeId?: string, sort?: string) {
  // Determine sort order
  let orderByClause;
  switch (sort) {
    case "price-asc":
      orderByClause = products.price;
      break;
    case "price-desc":
      orderByClause = desc(products.price);
      break;
    case "name-asc":
      orderByClause = products.name;
      break;
    case "name-desc":
      orderByClause = desc(products.name);
      break;
    case "newest":
    default:
      orderByClause = desc(products.createdAt);
      break;
  }

  const productsData = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      description: products.description,
      shortDescription: products.shortDescription,
      price: products.price,
      compareAtPrice: products.compareAtPrice,
      sku: products.sku,
      inventory: products.inventory,
      isActive: products.isActive,
      isFeatured: products.isFeatured,
      categoryId: products.categoryId,
      categoryName: categories.name,
      createdAt: products.createdAt,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(storeId 
      ? and(eq(products.isActive, true), eq(products.storeId, storeId))
      : eq(products.isActive, true)
    )
    .orderBy(orderByClause)
    .limit(limit)
    .offset(offset);

  // Apply discounts to products
  const productsWithDiscounts = await applyDiscountsToProducts(productsData);

  // Get the first image for each product
  const productsWithImages = await Promise.all(
    productsWithDiscounts.map(async (product) => {
      const images = await db
        .select()
        .from(productImages)
        .where(eq(productImages.productId, product.id))
        .orderBy(productImages.position)
        .limit(1);
      
      return {
        ...product,
        image: images[0] || null,
      };
    })
  );

  return productsWithImages;
}

export async function getProductBySlug(slug: string, storeId?: string) {
  const product = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      description: products.description,
      shortDescription: products.shortDescription,
      price: products.price,
      compareAtPrice: products.compareAtPrice,
      sku: products.sku,
      inventory: products.inventory,
      weight: products.weight,
      categoryId: products.categoryId,
      categoryName: categories.name,
      isActive: products.isActive,
      isFeatured: products.isFeatured,
      createdAt: products.createdAt,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(storeId 
      ? and(eq(products.slug, slug), eq(products.isActive, true), eq(products.storeId, storeId))
      : and(eq(products.slug, slug), eq(products.isActive, true))
    )
    .limit(1);

  if (product.length === 0) return null;

  // Apply discounts to the product
  const productWithDiscounts = await applyDiscountsToProducts(product);
  
  const productImages = await getProductImages(product[0].id);
  const productCollectionsList = await getProductCollections(product[0].id);

  return {
    ...productWithDiscounts[0],
    images: productImages,
    collections: productCollectionsList,
  };
}

export async function getProductImages(productId: string) {
  return await db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, productId))
    .orderBy(productImages.position);
}

export async function getProductCollections(productId: string) {
  return await db
    .select({
      id: collections.id,
      name: collections.name,
      slug: collections.slug,
      description: collections.description,
      imageUrl: collections.imageUrl,
    })
    .from(productCollections)
    .innerJoin(collections, eq(productCollections.collectionId, collections.id))
    .where(eq(productCollections.productId, productId));
}

export async function getFeaturedProducts(limit = 8, storeId?: string) {
  const featuredData = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      shortDescription: products.shortDescription,
      price: products.price,
      compareAtPrice: products.compareAtPrice,
      categoryName: categories.name,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(storeId 
      ? and(eq(products.isActive, true), eq(products.isFeatured, true), eq(products.storeId, storeId))
      : and(eq(products.isActive, true), eq(products.isFeatured, true))
    )
    .limit(limit);

  // Apply discounts to featured products
  const featuredWithDiscounts = await applyDiscountsToProducts(featuredData);

  // Get the first image for each product
  const productsWithImages = await Promise.all(
    featuredWithDiscounts.map(async (product) => {
      const images = await db
        .select()
        .from(productImages)
        .where(eq(productImages.productId, product.id))
        .orderBy(productImages.position)
        .limit(1);
      
      return {
        ...product,
        image: images[0] || null,
      };
    })
  );

  return productsWithImages;
}

export async function getCategories(storeId?: string) {
  return await db
    .select()
    .from(categories)
    .where(storeId 
      ? and(eq(categories.isActive, true), eq(categories.storeId, storeId))
      : eq(categories.isActive, true)
    )
    .orderBy(categories.name);
}

export async function getCollections(storeId?: string) {
  return await db
    .select()
    .from(collections)
    .where(storeId 
      ? and(eq(collections.isActive, true), eq(collections.storeId, storeId))
      : eq(collections.isActive, true)
    )
    .orderBy(collections.name);
}

export async function getProductsByCategory(categoryId: string, limit = 20, offset = 0, storeId?: string, sort?: string) {
  // Determine sort order
  let orderByClause;
  switch (sort) {
    case "price-asc":
      orderByClause = products.price;
      break;
    case "price-desc":
      orderByClause = desc(products.price);
      break;
    case "name-asc":
      orderByClause = products.name;
      break;
    case "name-desc":
      orderByClause = desc(products.name);
      break;
    case "newest":
    default:
      orderByClause = desc(products.createdAt);
      break;
  }

  const productsData = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      shortDescription: products.shortDescription,
      price: products.price,
      compareAtPrice: products.compareAtPrice,
      categoryName: categories.name,
      inventory: products.inventory,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(storeId 
      ? and(eq(products.categoryId, categoryId), eq(products.isActive, true), eq(products.storeId, storeId))
      : and(eq(products.categoryId, categoryId), eq(products.isActive, true))
    )
    .orderBy(orderByClause)
    .limit(limit)
    .offset(offset);

  const productsWithDiscounts = await applyDiscountsToProducts(productsData);

  // Get the first image for each product
  const productsWithImages = await Promise.all(
    productsWithDiscounts.map(async (product) => {
      const images = await db
        .select()
        .from(productImages)
        .where(eq(productImages.productId, product.id))
        .orderBy(productImages.position)
        .limit(1);
      
      return {
        ...product,
        image: images[0] || null,
      };
    })
  );

  return productsWithImages;
}

export async function getProductsByCollection(collectionId: string, limit = 20, offset = 0, storeId?: string) {
  const productsData = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      shortDescription: products.shortDescription,
      price: products.price,
      compareAtPrice: products.compareAtPrice,
      categoryName: categories.name,
    })
    .from(products)
    .innerJoin(productCollections, eq(products.id, productCollections.productId))
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(storeId 
      ? and(eq(productCollections.collectionId, collectionId), eq(products.isActive, true), eq(products.storeId, storeId))
      : and(eq(productCollections.collectionId, collectionId), eq(products.isActive, true))
    )
    .orderBy(desc(products.createdAt))
    .limit(limit)
    .offset(offset);

  return await applyDiscountsToProducts(productsData);
}

export async function searchProducts(query: string, limit = 20, offset = 0, storeId?: string, sort?: string) {
  // Determine sort order
  let orderByClause;
  switch (sort) {
    case "price-asc":
      orderByClause = products.price;
      break;
    case "price-desc":
      orderByClause = desc(products.price);
      break;
    case "name-asc":
      orderByClause = products.name;
      break;
    case "name-desc":
      orderByClause = desc(products.name);
      break;
    case "newest":
    default:
      orderByClause = desc(products.createdAt);
      break;
  }

  const productsData = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      shortDescription: products.shortDescription,
      price: products.price,
      compareAtPrice: products.compareAtPrice,
      categoryName: categories.name,
      inventory: products.inventory,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(storeId 
      ? and(
          eq(products.isActive, true),
          ilike(products.name, `%${query}%`),
          eq(products.storeId, storeId)
        )
      : and(
          eq(products.isActive, true),
          ilike(products.name, `%${query}%`)
        )
    )
    .orderBy(orderByClause)
    .limit(limit)
    .offset(offset);

  // Apply discounts to products
  const productsWithDiscounts = await applyDiscountsToProducts(productsData);

  // Get the first image for each product
  const productsWithImages = await Promise.all(
    productsWithDiscounts.map(async (product) => {
      const images = await db
        .select()
        .from(productImages)
        .where(eq(productImages.productId, product.id))
        .orderBy(productImages.position)
        .limit(1);
      
      return {
        ...product,
        image: images[0] || null,
      };
    })
  );

  return productsWithImages;
}