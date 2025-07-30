"use server";

import { authenticatedAction } from "@/lib/server-actions";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import * as productsRepo from "@/repositories/admin/products";
import * as categoriesRepo from "@/repositories/admin/categories";
import * as collectionsRepo from "@/repositories/admin/collections";

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

const getProductsPageDataSchema = z.object({
  page: z.string().default("1"),
  search: z.string().optional(),
  categoryId: z.string().optional(),
  collectionId: z.string().optional(),
  limit: z.number().int().positive().default(10),
});

// Product Actions
export const createProductAction = authenticatedAction
  .inputSchema(createProductSchema)
  .action(async ({ parsedInput }) => {
    console.log("📦 Creating product:", parsedInput);
    const product = await productsRepo.createProduct(parsedInput);
    console.log("✅ Product created:", product.id);
    
    revalidatePath("/admin/products");
    return product;
  });

export const updateProductAction = authenticatedAction
  .inputSchema(updateProductSchema)
  .action(async ({ parsedInput }) => {
    console.log("📝 Updating product:", parsedInput.id);
    const product = await productsRepo.updateProduct(parsedInput);
    console.log("✅ Product updated:", product.id);
    
    revalidatePath("/admin/products");
    return product;
  });

export const deleteProductAction = authenticatedAction
  .inputSchema(deleteProductSchema)
  .action(async ({ parsedInput }) => {
    console.log("🗑️ Deleting product:", parsedInput.id);
    await productsRepo.deleteProduct(parsedInput.id);
    console.log("✅ Product deleted");
    
    revalidatePath("/admin/products");
    return { success: true };
  });

export const getProductsPageDataAction = authenticatedAction
  .inputSchema(getProductsPageDataSchema)
  .action(async ({ parsedInput }) => {
    console.log("📊 Fetching products page data:", parsedInput);
    
    const offset = (parseInt(parsedInput.page) - 1) * parsedInput.limit;
    
    // Fetch all data in parallel
    const [products, totalCount, categories, collections] = await Promise.all([
      productsRepo.getProducts(parsedInput.limit, offset, parsedInput.search, parsedInput.categoryId, parsedInput.collectionId),
      productsRepo.getProductsCount(parsedInput.search, parsedInput.categoryId, parsedInput.collectionId),
      categoriesRepo.getActiveCategories(),
      collectionsRepo.getActiveCollections()
    ]);
    
    const totalPages = Math.ceil(totalCount / parsedInput.limit);
    
    console.log(`✅ Fetched ${products.length} products, ${totalCount} total, ${categories.length} categories, ${collections.length} collections`);
    
    return {
      products,
      totalCount,
      totalPages,
      categories,
      collections,
      currentPage: parseInt(parsedInput.page),
    };
  });