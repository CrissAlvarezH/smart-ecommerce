import { db } from "@/db";
import { collections, productCollections, products } from "@/db/schemas";
import { eq, desc, ilike, and } from "drizzle-orm";

export interface CreateCollectionData {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
}

export interface UpdateCollectionData extends Partial<CreateCollectionData> {
  id: string;
}

export async function createCollection(data: CreateCollectionData) {
  const collection = await db
    .insert(collections)
    .values({
      ...data,
      updatedAt: new Date(),
    })
    .returning();

  return collection[0];
}

export async function updateCollection(data: UpdateCollectionData) {
  const { id, ...updateData } = data;
  
  const collection = await db
    .update(collections)
    .set({
      ...updateData,
      updatedAt: new Date(),
    })
    .where(eq(collections.id, id))
    .returning();

  return collection[0];
}

export async function deleteCollection(id: string) {
  // First delete all product-collection relationships
  await db
    .delete(productCollections)
    .where(eq(productCollections.collectionId, id));

  // Then delete the collection
  await db
    .delete(collections)
    .where(eq(collections.id, id));
}

export async function getCollections(limit = 50, offset = 0, search?: string) {
  let query = db
    .select()
    .from(collections)
    .orderBy(desc(collections.createdAt))
    .limit(limit)
    .offset(offset);

  if (search) {
    query = query.where(
      ilike(collections.name, `%${search}%`)
    ) as any;
  }

  return query;
}

export async function getCollectionById(id: string) {
  const collection = await db
    .select()
    .from(collections)
    .where(eq(collections.id, id))
    .limit(1);

  return collection[0] || null;
}

export async function getCollectionBySlug(slug: string) {
  const collection = await db
    .select()
    .from(collections)
    .where(eq(collections.slug, slug))
    .limit(1);

  return collection[0] || null;
}

export async function getActiveCollections() {
  return db
    .select()
    .from(collections)
    .where(eq(collections.isActive, true))
    .orderBy(collections.name);
}

export async function addProductToCollection(productId: string, collectionId: string) {
  const relationship = await db
    .insert(productCollections)
    .values({
      productId,
      collectionId,
    })
    .returning();

  return relationship[0];
}

export async function removeProductFromCollection(productId: string, collectionId: string) {
  await db
    .delete(productCollections)
    .where(
      and(
        eq(productCollections.productId, productId),
        eq(productCollections.collectionId, collectionId)
      )
    );
}

export async function getCollectionProducts(collectionId: string) {
  return db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      price: products.price,
      isActive: products.isActive,
    })
    .from(products)
    .innerJoin(productCollections, eq(products.id, productCollections.productId))
    .where(eq(productCollections.collectionId, collectionId))
    .orderBy(products.name);
}