"use server";

import { authenticatedAction } from "@/lib/server-actions";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import * as categoriesRepo from "@/repositories/admin/categories";
import * as collectionsRepo from "@/repositories/admin/collections";
import { PublicError } from "@/lib/errors";

// Category Schemas
const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  bannerUrl: z.string().optional(),
  displayMode: z.enum(["banner", "image", "products"]).default("products"),
  parentId: z.string().optional(),
  storeId: z.string().min(1, "Store ID is required"),
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
  storeId: z.string().min(1, "Store ID is required"),
  isActive: z.boolean().default(true),
});

const updateCollectionSchema = createCollectionSchema.extend({
  id: z.string().min(1, "ID is required"),
});

const deleteCollectionSchema = z.object({
  id: z.string().min(1, "ID is required"),
});



// Category Actions
export const createCategoryAction = authenticatedAction
  .inputSchema(createCategorySchema)
  .action(async ({ parsedInput }) => {
    console.log("🏷️ Creating category:", parsedInput);
    const category = await categoriesRepo.createCategory(parsedInput);
    console.log("✅ Category created:", category.id);
    
    revalidatePath("/", "layout");
    return category;
  });

export const updateCategoryAction = authenticatedAction
  .inputSchema(updateCategorySchema)
  .action(async ({ parsedInput }) => {
    console.log("📝 Updating category:", parsedInput.id);
    const category = await categoriesRepo.updateCategory(parsedInput);
    console.log("✅ Category updated:", category.id);
    
    revalidatePath("/", "layout");
    return category;
  });

export const deleteCategoryAction = authenticatedAction
  .inputSchema(deleteCategorySchema)
  .action(async ({ parsedInput }) => {
    console.log("🗑️ Attempting to delete category:", parsedInput);
    
    // First get the category details
    const category = await categoriesRepo.getCategoryById(parsedInput.id);
    if (!category) {
      throw new PublicError("Category not found");
    }
    
    // Check if category has products
    const [productCount, categoryProducts] = await Promise.all([
      categoriesRepo.getCategoryProductsCount(parsedInput.id),
      categoriesRepo.getCategoryProducts(parsedInput.id, 5) // Get first 5 products for display
    ]);
    
    if (productCount > 0) {
      const productNames = categoryProducts.map(p => p.name).join(", ");
      const moreText = productCount > 5 ? ` and ${productCount - 5} more` : "";
      
      throw new PublicError(
        `Cannot delete category "${category.name}" because it contains ${productCount} product${productCount > 1 ? 's' : ''}. ` +
        `Products: ${productNames}${moreText}. Please remove or reassign these products before deleting the category.`
      );
    }
    
    await categoriesRepo.deleteCategory(parsedInput.id);
    
    console.log("✅ Category deleted");
    
    revalidatePath("/", "layout");
    return { success: true };
  });

// Collection Actions
export const createCollectionAction = authenticatedAction
  .inputSchema(createCollectionSchema)
  .action(async ({ parsedInput }) => {
    console.log("📂 Creating collection:", parsedInput);
    const collection = await collectionsRepo.createCollection(parsedInput);
    console.log("✅ Collection created:", collection.id);
    
    revalidatePath("/", "layout");
    return collection;
  });

export const updateCollectionAction = authenticatedAction
  .inputSchema(updateCollectionSchema)
  .action(async ({ parsedInput }) => {
    console.log("📝 Updating collection:", parsedInput.id);
    const collection = await collectionsRepo.updateCollection(parsedInput);
    console.log("✅ Collection updated:", collection.id);
    
    revalidatePath("/", "layout");
    return collection;
  });

export const deleteCollectionAction = authenticatedAction
  .inputSchema(deleteCollectionSchema)
  .action(async ({ parsedInput }) => {
    console.log("🗑️ Deleting collection:", parsedInput.id);
    await collectionsRepo.deleteCollection(parsedInput.id);
    console.log("✅ Collection deleted");
    
    revalidatePath("/", "layout");
    return { success: true };
  });



