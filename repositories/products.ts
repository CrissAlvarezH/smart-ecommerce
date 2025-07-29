import { db } from "@/db";
import { categories, collections, products, productImages, productCollections, carts, cartItems } from "@/db/schemas";
import { eq, desc, and, ilike } from "drizzle-orm";

export async function getProducts(limit = 20, offset = 0) {
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
    .where(eq(products.isActive, true))
    .orderBy(desc(products.createdAt))
    .limit(limit)
    .offset(offset);

  // Get the first image for each product
  const productsWithImages = await Promise.all(
    productsData.map(async (product) => {
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

export async function getProductBySlug(slug: string) {
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
    .where(and(eq(products.slug, slug), eq(products.isActive, true)))
    .limit(1);

  if (product.length === 0) return null;

  const productImages = await getProductImages(product[0].id);
  const productCollectionsList = await getProductCollections(product[0].id);

  return {
    ...product[0],
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

export async function getFeaturedProducts(limit = 8) {
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
    .where(and(eq(products.isActive, true), eq(products.isFeatured, true)))
    .limit(limit);

  // Get the first image for each product
  const productsWithImages = await Promise.all(
    featuredData.map(async (product) => {
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

export async function getCategories() {
  return await db
    .select()
    .from(categories)
    .where(eq(categories.isActive, true))
    .orderBy(categories.name);
}

export async function getCollections() {
  return await db
    .select()
    .from(collections)
    .where(eq(collections.isActive, true))
    .orderBy(collections.name);
}

export async function getProductsByCategory(categoryId: string, limit = 20, offset = 0) {
  return await db
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
    .where(and(eq(products.categoryId, categoryId), eq(products.isActive, true)))
    .orderBy(desc(products.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getProductsByCollection(collectionId: string, limit = 20, offset = 0) {
  return await db
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
    .where(and(eq(productCollections.collectionId, collectionId), eq(products.isActive, true)))
    .orderBy(desc(products.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function searchProducts(query: string, limit = 20, offset = 0) {
  return await db
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
    .where(
      and(
        eq(products.isActive, true),
        ilike(products.name, `%${query}%`)
      )
    )
    .orderBy(desc(products.createdAt))
    .limit(limit)
    .offset(offset);
}