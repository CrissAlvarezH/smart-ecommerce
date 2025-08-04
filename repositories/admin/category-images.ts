import { db } from "@/db";
import { categoryImages } from "@/db/schemas";
import { eq, desc, asc } from "drizzle-orm";

export interface CreateCategoryImageData {
  categoryId: string;
  url: string;
  altText?: string;
  position: number;
  isMain?: boolean;
}

export interface UpdateCategoryImageData {
  id: string;
  altText?: string;
  position?: number;
  isMain?: boolean;
}

export async function createCategoryImage(data: CreateCategoryImageData) {
  const image = await db
    .insert(categoryImages)
    .values(data)
    .returning();

  return image[0];
}

export async function updateCategoryImage(data: UpdateCategoryImageData) {
  const { id, ...updateData } = data;
  
  const image = await db
    .update(categoryImages)
    .set(updateData)
    .where(eq(categoryImages.id, id))
    .returning();

  return image[0];
}

export async function deleteCategoryImage(id: string) {
  await db
    .delete(categoryImages)
    .where(eq(categoryImages.id, id));
}

export async function getCategoryImages(categoryId: string) {
  const results = await db
    .select()
    .from(categoryImages)
    .where(eq(categoryImages.categoryId, categoryId))
    .orderBy(asc(categoryImages.position), asc(categoryImages.createdAt));
  
  console.log("📸 Repository getCategoryImages result:", results);
  return results;
}

export async function getCategoryImageById(id: string) {
  const image = await db
    .select()
    .from(categoryImages)
    .where(eq(categoryImages.id, id))
    .limit(1);

  return image[0] || null;
}

export async function reorderCategoryImages(categoryId: string, imageIds: string[]) {
  // Update positions based on the order of imageIds
  const promises = imageIds.map((imageId, index) =>
    db
      .update(categoryImages)
      .set({ position: index })
      .where(eq(categoryImages.id, imageId))
  );

  await Promise.all(promises);
}

export async function setMainCategoryImage(categoryId: string, imageId: string) {
  // First, unset all images as main for this category
  await db
    .update(categoryImages)
    .set({ isMain: false })
    .where(eq(categoryImages.categoryId, categoryId));

  // Then set the specified image as main
  await db
    .update(categoryImages)
    .set({ isMain: true })
    .where(eq(categoryImages.id, imageId));
}

export async function getMainCategoryImage(categoryId: string) {
  const image = await db
    .select()  
    .from(categoryImages)
    .where(eq(categoryImages.categoryId, categoryId))
    .orderBy(categoryImages.position)
    .limit(1);

  return image[0] || null;
}