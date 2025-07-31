import { db } from "@/db";
import { categories } from "@/db/schemas";
import { eq, desc, ilike, and, sql } from "drizzle-orm";

export interface CreateCategoryData {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
  storeId: string;
  isActive?: boolean;
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {
  id: string;
}

export async function createCategory(data: CreateCategoryData) {
  const category = await db
    .insert(categories)
    .values({
      ...data,
      updatedAt: new Date(),
    })
    .returning();

  return category[0];
}

export async function updateCategory(data: UpdateCategoryData) {
  const { id, ...updateData } = data;
  
  const category = await db
    .update(categories)
    .set({
      ...updateData,
      updatedAt: new Date(),
    })
    .where(eq(categories.id, id))
    .returning();

  return category[0];
}

export async function deleteCategory(id: string) {
  await db
    .delete(categories)
    .where(eq(categories.id, id));
}

export async function getCategories(limit = 50, offset = 0, search?: string, storeId?: string) {
  const conditions = [];
  
  // Always filter by store if provided
  if (storeId) {
    conditions.push(eq(categories.storeId, storeId));
  }
  
  if (search) {
    conditions.push(ilike(categories.name, `%${search}%`));
  }

  let query = db
    .select()
    .from(categories);

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  return query
    .orderBy(desc(categories.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getCategoriesCount(search?: string, storeId?: string) {
  const conditions = [];
  
  // Always filter by store if provided
  if (storeId) {
    conditions.push(eq(categories.storeId, storeId));
  }
  
  if (search) {
    conditions.push(ilike(categories.name, `%${search}%`));
  }

  let query = db
    .select({ count: sql<number>`count(*)` })
    .from(categories);

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  const result = await query;
  return result[0]?.count || 0;
}

export async function getCategoryById(id: string, storeId?: string) {
  const category = await db
    .select()
    .from(categories)
    .where(storeId ? and(eq(categories.id, id), eq(categories.storeId, storeId)) : eq(categories.id, id))
    .limit(1);

  return category[0] || null;
}

export async function getCategoryBySlug(slug: string, storeId?: string) {
  const category = await db
    .select()
    .from(categories)
    .where(storeId ? and(eq(categories.slug, slug), eq(categories.storeId, storeId)) : eq(categories.slug, slug))
    .limit(1);

  return category[0] || null;
}

export async function getActiveCategories(storeId?: string) {
  const conditions = [eq(categories.isActive, true)];
  
  // Always filter by store if provided
  if (storeId) {
    conditions.push(eq(categories.storeId, storeId));
  }

  return db
    .select()
    .from(categories)
    .where(and(...conditions))
    .orderBy(categories.name);
}