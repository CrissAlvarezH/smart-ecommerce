"use server";

import { actionClient } from "@/lib/server-actions";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import * as categoriesRepo from "@/repositories/admin/categories";
import * as collectionsRepo from "@/repositories/admin/collections";
import * as productsRepo from "@/repositories/admin/products";

// Category Schemas
const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  parentId: z.string().optional(),
  isActive: z.boolean().default(true),
});

const updateCategorySchema = createCategorySchema.extend({
  id: z.string().min(1, "ID is required"),
});

const deleteCategorySchema = z.object({
  id: z.string().min(1, "ID is required"),
});

// Collection Schemas
const createCollectionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  isActive: z.boolean().default(true),
});

const updateCollectionSchema = createCollectionSchema.extend({
  id: z.string().min(1, "ID is required"),
});

const deleteCollectionSchema = z.object({
  id: z.string().min(1, "ID is required"),
});

// Product Schemas
const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional().transform((val) => val === "" ? undefined : val),
  shortDescription: z.string().optional().transform((val) => val === "" ? undefined : val),
  price: z.string().min(1, "Price is required"),
  compareAtPrice: z.string().optional().transform((val) => val === "" ? undefined : val),
  sku: z.string().optional().transform((val) => val === "" ? undefined : val),
  inventory: z.number().int().min(0, "Inventory must be non-negative"),
  weight: z.string().optional().transform((val) => val === "" ? undefined : val),
  categoryId: z.string().optional().transform((val) => val === "" ? undefined : val),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

const updateProductSchema = createProductSchema.extend({
  id: z.string().min(1, "ID is required"),
});

const deleteProductSchema = z.object({
  id: z.string().min(1, "ID is required"),
});

// Category Actions
export const createCategoryAction = actionClient
  .schema(createCategorySchema)
  .action(async ({ parsedInput }) => {
    try {
      console.log("🏷️ Creating category:", parsedInput);
      const category = await categoriesRepo.createCategory(parsedInput);
      console.log("✅ Category created:", category.id);
      
      revalidatePath("/admin/categories");
      return { success: true, data: category };
    } catch (error) {
      console.error("❌ Error creating category:", error);
      throw new Error(`Failed to create category: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

export const updateCategoryAction = actionClient
  .schema(updateCategorySchema)
  .action(async ({ parsedInput }) => {
    try {
      console.log("📝 Updating category:", parsedInput.id);
      const category = await categoriesRepo.updateCategory(parsedInput);
      console.log("✅ Category updated:", category.id);
      
      revalidatePath("/admin/categories");
      return { success: true, data: category };
    } catch (error) {
      console.error("❌ Error updating category:", error);
      throw new Error(`Failed to update category: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

export const deleteCategoryAction = actionClient
  .schema(deleteCategorySchema)
  .action(async ({ parsedInput }) => {
    try {
      console.log("🗑️ Deleting category:", parsedInput.id);
      await categoriesRepo.deleteCategory(parsedInput.id);
      console.log("✅ Category deleted");
      
      revalidatePath("/admin/categories");
      return { success: true };
    } catch (error) {
      console.error("❌ Error deleting category:", error);
      throw new Error(`Failed to delete category: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

// Collection Actions
export const createCollectionAction = actionClient
  .schema(createCollectionSchema)
  .action(async ({ parsedInput }) => {
    try {
      console.log("📂 Creating collection:", parsedInput);
      const collection = await collectionsRepo.createCollection(parsedInput);
      console.log("✅ Collection created:", collection.id);
      
      revalidatePath("/admin/collections");
      return { success: true, data: collection };
    } catch (error) {
      console.error("❌ Error creating collection:", error);
      throw new Error(`Failed to create collection: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

export const updateCollectionAction = actionClient
  .schema(updateCollectionSchema)
  .action(async ({ parsedInput }) => {
    try {
      console.log("📝 Updating collection:", parsedInput.id);
      const collection = await collectionsRepo.updateCollection(parsedInput);
      console.log("✅ Collection updated:", collection.id);
      
      revalidatePath("/admin/collections");
      return { success: true, data: collection };
    } catch (error) {
      console.error("❌ Error updating collection:", error);
      throw new Error(`Failed to update collection: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

export const deleteCollectionAction = actionClient
  .schema(deleteCollectionSchema)
  .action(async ({ parsedInput }) => {
    try {
      console.log("🗑️ Deleting collection:", parsedInput.id);
      await collectionsRepo.deleteCollection(parsedInput.id);
      console.log("✅ Collection deleted");
      
      revalidatePath("/admin/collections");
      return { success: true };
    } catch (error) {
      console.error("❌ Error deleting collection:", error);
      throw new Error(`Failed to delete collection: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

// Product Actions
export const createProductAction = actionClient
  .schema(createProductSchema)
  .action(async ({ parsedInput }) => {
    try {
      console.log("📦 Creating product:", parsedInput);
      const product = await productsRepo.createProduct(parsedInput);
      console.log("✅ Product created:", product.id);
      
      revalidatePath("/admin/products");
      return { success: true, data: product };
    } catch (error) {
      console.error("❌ Error creating product:", error);
      throw new Error(`Failed to create product: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

export const updateProductAction = actionClient
  .schema(updateProductSchema)
  .action(async ({ parsedInput }) => {
    try {
      console.log("📝 Updating product:", parsedInput.id);
      const product = await productsRepo.updateProduct(parsedInput);
      console.log("✅ Product updated:", product.id);
      
      revalidatePath("/admin/products");
      return { success: true, data: product };
    } catch (error) {
      console.error("❌ Error updating product:", error);
      throw new Error(`Failed to update product: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

export const deleteProductAction = actionClient
  .schema(deleteProductSchema)
  .action(async ({ parsedInput }) => {
    try {
      console.log("🗑️ Deleting product:", parsedInput.id);
      await productsRepo.deleteProduct(parsedInput.id);
      console.log("✅ Product deleted");
      
      revalidatePath("/admin/products");
      return { success: true };
    } catch (error) {
      console.error("❌ Error deleting product:", error);
      throw new Error(`Failed to delete product: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });