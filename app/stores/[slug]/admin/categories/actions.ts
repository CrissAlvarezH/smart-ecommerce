"use server";

import { authenticatedAction } from "@/lib/server-actions";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import * as productsRepo from "@/repositories/admin/products";
import * as categoriesRepo from "@/repositories/admin/categories";

const getAvailableProductsForCategorySchema = z.object({
  categoryId: z.string().min(1, "Category ID is required"),
  search: z.string().optional(),
  limit: z.number().int().positive().default(100),
  offset: z.number().int().min(0).default(0),
});

const assignProductToCategorySchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  categoryId: z.string().min(1, "Category ID is required"),
});

const deleteCategorySchema = z.object({
  id: z.string().min(1, "Category ID is required"),
});

export const getAvailableProductsForCategoryAction = authenticatedAction
  .inputSchema(getAvailableProductsForCategorySchema)
  .action(async ({ parsedInput }) => {
    console.log("🛍️ Fetching available products for category:", parsedInput);
    
    // Get all products and category products counts
    const [allProductsCount, categoryProductsCount] = await Promise.all([
      productsRepo.getProductsCount(parsedInput.search),
      productsRepo.getProductsCount(
        undefined,
        parsedInput.categoryId
      )
    ]);
    
    // Get all products
    const allProducts = await productsRepo.getProducts(
      parsedInput.limit + categoryProductsCount, // Get more to account for filtering
      parsedInput.offset,
      parsedInput.search
    );
    
    // Get products already in category
    const categoryProducts = await productsRepo.getProducts(
      1000, // Get all products in category
      0,
      undefined,
      parsedInput.categoryId
    );
    
    // Filter out products that are already in the category
    const categoryProductIds = new Set(categoryProducts.map(p => p.id));
    const availableProducts = allProducts.filter(product => !categoryProductIds.has(product.id));
    
    // Apply pagination to filtered results
    const startIndex = 0; // We already applied offset in the initial query
    const endIndex = parsedInput.limit;
    const paginatedProducts = availableProducts.slice(startIndex, endIndex);
    
    // Calculate total available products count
    const totalAvailableCount = allProductsCount - categoryProductsCount;
    
    console.log(`✅ Fetched ${paginatedProducts.length} available products for category (${totalAvailableCount} total available)`);
    
    return {
      data: paginatedProducts,
      total: totalAvailableCount,
      hasMore: parsedInput.offset + paginatedProducts.length < totalAvailableCount
    };
  });

export const assignProductToCategoryAction = authenticatedAction
  .inputSchema(assignProductToCategorySchema)
  .action(async ({ parsedInput }) => {
    console.log("🏷️ Assigning product to category:", parsedInput);
    
    const updatedProduct = await productsRepo.updateProduct({
      id: parsedInput.productId,
      categoryId: parsedInput.categoryId,
    });
    
    console.log("✅ Product assigned to category");
    
    revalidatePath("/", "layout");
    return updatedProduct;
  });

export const deleteCategoryAction = authenticatedAction
  .inputSchema(deleteCategorySchema)
  .action(async ({ parsedInput }) => {
    console.log("🗑️ Deleting category:", parsedInput);
    
    await categoriesRepo.deleteCategory(parsedInput.id);
    
    console.log("✅ Category deleted");
    
    revalidatePath("/", "layout");
    return { success: true };
  });