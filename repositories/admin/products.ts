import { db } from "@/db";
import { products, productImages, categories, productCollections } from "@/db/schemas";
import { eq, desc, ilike, and, sql } from "drizzle-orm";
import { getFileUrl } from "@/lib/files";

export interface CreateProductData {
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  price: string;
  compareAtPrice?: string;
  sku?: string;
  inventory: number;
  weight?: string;
  categoryId?: string;
  storeId: string;
  isActive?: boolean;
  isFeatured?: boolean;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: string;
}

export interface ProductImageData {
  url: string;
  altText?: string;
  position: number;
}

export async function createProduct(data: CreateProductData) {
  const product = await db
    .insert(products)
    .values({
      ...data,
      updatedAt: new Date(),
    })
    .returning();

  return product[0];
}

export async function updateProduct(data: UpdateProductData) {
  const { id, ...updateData } = data;
  
  const product = await db
    .update(products)
    .set({
      ...updateData,
      updatedAt: new Date(),
    })
    .where(eq(products.id, id))
    .returning();

  return product[0];
}

export async function deleteProduct(id: string) {
  // Delete product images first (cascade should handle this, but being explicit)
  await db
    .delete(productImages)
    .where(eq(productImages.productId, id));

  // Delete product-collection relationships
  await db
    .delete(productCollections)
    .where(eq(productCollections.productId, id));

  // Delete the product
  await db
    .delete(products)
    .where(eq(products.id, id));
}

export async function getProducts(limit = 50, offset = 0, search?: string, categoryId?: string, collectionId?: string, storeId?: string) {
  // Build the base query
  let query = db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      shortDescription: products.shortDescription,
      price: products.price,
      compareAtPrice: products.compareAtPrice,
      sku: products.sku,
      inventory: products.inventory,
      categoryId: products.categoryId,
      categoryName: categories.name,
      isActive: products.isActive,
      isFeatured: products.isFeatured,
      createdAt: products.createdAt,
      updatedAt: products.updatedAt,
      firstImageUrl: productImages.url,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(
      productImages, 
      and(
        eq(products.id, productImages.productId),
        eq(productImages.position, 0) // Get the first image (main image)
      )
    );

  // Add collection join if filtering by collection
  if (collectionId) {
    query = query.leftJoin(productCollections, eq(products.id, productCollections.productId)) as any;
  }

  // Build conditions array
  const conditions = [];

  // Always filter by store if provided
  if (storeId) {
    conditions.push(eq(products.storeId, storeId));
  }

  if (search) {
    conditions.push(ilike(products.name, `%${search}%`));
  }

  if (categoryId) {
    conditions.push(eq(products.categoryId, categoryId));
  }

  if (collectionId) {
    conditions.push(eq(productCollections.collectionId, collectionId));
  }

  // Apply conditions if any
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  // Apply ordering, limit, and offset
  const productsWithImages = await query
    .orderBy(desc(products.createdAt))
    .limit(limit)
    .offset(offset);

  // Convert S3 paths to signed URLs for images that exist
  const productsWithSignedUrls = await Promise.all(
    productsWithImages.map(async (product) => ({
      ...product,
      firstImageUrl: product.firstImageUrl ? await getFileUrl(product.firstImageUrl) : null,
    }))
  );

  return productsWithSignedUrls;
}

export async function getProductsCount(search?: string, categoryId?: string, collectionId?: string, storeId?: string) {
  let query = db
    .select({ count: sql<number>`count(*)` })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id));

  // Add collection join if filtering by collection
  if (collectionId) {
    query = query.leftJoin(productCollections, eq(products.id, productCollections.productId)) as any;
  }

  const conditions = [];

  // Always filter by store if provided
  if (storeId) {
    conditions.push(eq(products.storeId, storeId));
  }

  if (search) {
    conditions.push(ilike(products.name, `%${search}%`));
  }

  if (categoryId) {
    conditions.push(eq(products.categoryId, categoryId));
  }

  if (collectionId) {
    conditions.push(eq(productCollections.collectionId, collectionId));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  const result = await query;
  return result[0]?.count || 0;
}

export async function getProductById(id: string, storeId?: string) {
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
      updatedAt: products.updatedAt,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(storeId ? and(eq(products.id, id), eq(products.storeId, storeId)) : eq(products.id, id))
    .limit(1);

  return product[0] || null;
}

export async function getProductBySlug(slug: string, storeId?: string) {
  const product = await db
    .select()
    .from(products)
    .where(storeId ? and(eq(products.slug, slug), eq(products.storeId, storeId)) : eq(products.slug, slug))
    .limit(1);

  return product[0] || null;
}

export async function addProductImage(productId: string, imageData: ProductImageData) {
  console.log("💾 Inserting image to DB:", { productId, ...imageData });
  
  const image = await db
    .insert(productImages)
    .values({
      productId,
      ...imageData,
    })
    .returning();

  console.log("✅ Image inserted with ID:", image[0].id);
  return image[0];
}

export async function updateProductImage(id: string, imageData: Partial<ProductImageData>) {
  const image = await db
    .update(productImages)
    .set(imageData)
    .where(eq(productImages.id, id))
    .returning();

  return image[0];
}

export async function deleteProductImage(id: string) {
  await db
    .delete(productImages)
    .where(eq(productImages.id, id));
}

export async function getProductImages(productId: string) {
  console.log("🔍 Fetching images for product:", productId);
  
  const images = await db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, productId))
    .orderBy(productImages.position);

  console.log("📄 Raw images from DB:", images.length, images.map(img => ({ id: img.id, url: img.url })));

  // Convert S3 paths to signed URLs
  const imagesWithUrls = await Promise.all(
    images.map(async (image) => {
      try {
        const signedUrl = await getFileUrl(image.url);
        console.log("🔗 Generated signed URL for", image.url, "->", signedUrl);
        return {
          ...image,
          url: signedUrl, // Convert S3 path to signed URL
        };
      } catch (error) {
        console.error("❌ Error generating signed URL for", image.url, error);
        return {
          ...image,
          url: image.url, // Fallback to original URL
        };
      }
    })
  );

  console.log("✅ Final images with URLs:", imagesWithUrls.length);
  return imagesWithUrls;
}

export async function getProductCollections(productId: string) {
  return db
    .select({
      id: productCollections.id,
      collectionId: productCollections.collectionId,
      collectionName: productCollections.collectionId, // We'd need to join collections table for name
    })
    .from(productCollections)
    .where(eq(productCollections.productId, productId));
}