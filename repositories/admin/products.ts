import { db } from "@/db";
import { products, productImages, categories, productCollections } from "@/db/schemas";
import { eq, desc, ilike, and } from "drizzle-orm";

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

export async function getProducts(limit = 50, offset = 0, search?: string, categoryId?: string) {
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
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .orderBy(desc(products.createdAt))
    .limit(limit)
    .offset(offset);

  const conditions = [];

  if (search) {
    conditions.push(ilike(products.name, `%${search}%`));
  }

  if (categoryId) {
    conditions.push(eq(products.categoryId, categoryId));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  return query;
}

export async function getProductById(id: string) {
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
    .where(eq(products.id, id))
    .limit(1);

  return product[0] || null;
}

export async function getProductBySlug(slug: string) {
  const product = await db
    .select()
    .from(products)
    .where(eq(products.slug, slug))
    .limit(1);

  return product[0] || null;
}

export async function addProductImage(productId: string, imageData: ProductImageData) {
  const image = await db
    .insert(productImages)
    .values({
      productId,
      ...imageData,
    })
    .returning();

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
  return db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, productId))
    .orderBy(productImages.position);
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