import { db } from "@/db";
import { categories } from "@/db/schemas";
import { eq, desc, ilike, and } from "drizzle-orm";

export interface CreateCategoryData {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
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

export async function getCategories(limit = 50, offset = 0, search?: string) {
  let query = db
    .select()
    .from(categories)
    .orderBy(desc(categories.createdAt))
    .limit(limit)
    .offset(offset);

  if (search) {
    query = query.where(
      ilike(categories.name, `%${search}%`)
    ) as any;
  }

  return query;
}

export async function getCategoryById(id: string) {
  const category = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id))
    .limit(1);

  return category[0] || null;
}

export async function getCategoryBySlug(slug: string) {
  const category = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);

  return category[0] || null;
}

export async function getActiveCategories() {
  return db
    .select()
    .from(categories)
    .where(eq(categories.isActive, true))
    .orderBy(categories.name);
}