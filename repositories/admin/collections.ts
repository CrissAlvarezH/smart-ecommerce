import { db } from "@/db";
import { collections, productCollections, products } from "@/db/schemas";
import { eq, desc, ilike, and } from "drizzle-orm";

export interface CreateCollectionData {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  storeId: string;
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

export async function getCollections(limit = 50, offset = 0, search?: string, storeId?: string) {
  const conditions = [];
  
  // Always filter by store if provided
  if (storeId) {
    conditions.push(eq(collections.storeId, storeId));
  }
  
  if (search) {
    conditions.push(ilike(collections.name, `%${search}%`));
  }

  let query = db
    .select()
    .from(collections);

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  return query
    .orderBy(desc(collections.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getCollectionById(id: string, storeId?: string) {
  const collection = await db
    .select()
    .from(collections)
    .where(storeId ? and(eq(collections.id, id), eq(collections.storeId, storeId)) : eq(collections.id, id))
    .limit(1);

  return collection[0] || null;
}

export async function getCollectionBySlug(slug: string, storeId?: string) {
  const collection = await db
    .select()
    .from(collections)
    .where(storeId ? and(eq(collections.slug, slug), eq(collections.storeId, storeId)) : eq(collections.slug, slug))
    .limit(1);

  return collection[0] || null;
}

export async function getActiveCollections(storeId?: string) {
  const conditions = [eq(collections.isActive, true)];
  
  // Always filter by store if provided
  if (storeId) {
    conditions.push(eq(collections.storeId, storeId));
  }

  return db
    .select()
    .from(collections)
    .where(and(...conditions))
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

export async function getProductCollections(productId: string) {
  return db
    .select({
      id: collections.id,
      name: collections.name,
      slug: collections.slug,
      description: collections.description,
      isActive: collections.isActive,
      createdAt: collections.createdAt,
    })
    .from(collections)
    .innerJoin(productCollections, eq(collections.id, productCollections.collectionId))
    .where(eq(productCollections.productId, productId))
    .orderBy(collections.name);
}