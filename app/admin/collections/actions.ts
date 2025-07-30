"use server";

import { authenticatedAction } from "@/lib/server-actions";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import * as collectionsRepo from "@/repositories/admin/collections";
import * as productsRepo from "@/repositories/admin/products";

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

const addProductToCollectionSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  collectionId: z.string().min(1, "Collection ID is required"),
});

const removeProductFromCollectionSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  collectionId: z.string().min(1, "Collection ID is required"),
});

const getCollectionProductsSchema = z.object({
  collectionId: z.string().min(1, "Collection ID is required"),
  search: z.string().optional(),
  limit: z.number().int().positive().default(100),
  offset: z.number().int().min(0).default(0),
});

const getAvailableProductsSchema = z.object({
  collectionId: z.string().min(1, "Collection ID is required"),
  search: z.string().optional(),
  limit: z.number().int().positive().default(100),
  offset: z.number().int().min(0).default(0),
});

// Collection Actions
export const createCollectionAction = authenticatedAction
  .inputSchema(createCollectionSchema)
  .action(async ({ parsedInput }) => {
    console.log("📂 Creating collection:", parsedInput);
    const collection = await collectionsRepo.createCollection(parsedInput);
    console.log("✅ Collection created:", collection.id);
    
    revalidatePath("/admin/collections");
    return collection;
  });

export const updateCollectionAction = authenticatedAction
  .inputSchema(updateCollectionSchema)
  .action(async ({ parsedInput }) => {
    console.log("📝 Updating collection:", parsedInput.id);
    const collection = await collectionsRepo.updateCollection(parsedInput);
    console.log("✅ Collection updated:", collection.id);
    
    revalidatePath("/admin/collections");
    return collection;
  });

export const deleteCollectionAction = authenticatedAction
  .inputSchema(deleteCollectionSchema)
  .action(async ({ parsedInput }) => {
    console.log("🗑️ Deleting collection:", parsedInput.id);
    await collectionsRepo.deleteCollection(parsedInput.id);
    console.log("✅ Collection deleted");
    
    revalidatePath("/admin/collections");
    return { success: true };
  });

// Collection Product Management Actions
export const addProductToCollectionAction = authenticatedAction
  .inputSchema(addProductToCollectionSchema)
  .action(async ({ parsedInput }) => {
    console.log("➕ Adding product to collection:", parsedInput);
    const relationship = await collectionsRepo.addProductToCollection(
      parsedInput.productId, 
      parsedInput.collectionId
    );
    console.log("✅ Product added to collection");
    
    revalidatePath(`/admin/collections/${parsedInput.collectionId}/products`);
    return relationship;
  });

export const removeProductFromCollectionAction = authenticatedAction
  .inputSchema(removeProductFromCollectionSchema)
  .action(async ({ parsedInput }) => {
    console.log("➖ Removing product from collection:", parsedInput);
    await collectionsRepo.removeProductFromCollection(
      parsedInput.productId, 
      parsedInput.collectionId
    );
    console.log("✅ Product removed from collection");
    
    revalidatePath(`/admin/collections/${parsedInput.collectionId}/products`);
    return { success: true };
  });

export const getCollectionProductsAction = authenticatedAction
  .inputSchema(getCollectionProductsSchema)
  .action(async ({ parsedInput }) => {
    console.log("📦 Fetching collection products:", parsedInput);
    
    // Get products and total count
    const [products, totalCount] = await Promise.all([
      productsRepo.getProducts(
        parsedInput.limit,
        parsedInput.offset,
        parsedInput.search,
        undefined,
        parsedInput.collectionId
      ),
      productsRepo.getProductsCount(
        parsedInput.search,
        undefined,
        parsedInput.collectionId
      )
    ]);
    
    console.log(`✅ Fetched ${products.length} products for collection (${totalCount} total)`);
    
    return {
      data: products,
      total: totalCount,
      hasMore: parsedInput.offset + products.length < totalCount
    };
  });

export const getAvailableProductsAction = authenticatedAction
  .inputSchema(getAvailableProductsSchema)
  .action(async ({ parsedInput }) => {
    console.log("🛍️ Fetching available products for collection:", parsedInput);
    
    // Get all products and collection products counts
    const [allProductsCount, collectionProductsCount] = await Promise.all([
      productsRepo.getProductsCount(parsedInput.search),
      productsRepo.getProductsCount(
        undefined,
        undefined,
        parsedInput.collectionId
      )
    ]);
    
    // Get all products
    const allProducts = await productsRepo.getProducts(
      parsedInput.limit + collectionProductsCount, // Get more to account for filtering
      parsedInput.offset,
      parsedInput.search
    );
    
    // Get products already in collection
    const collectionProducts = await productsRepo.getProducts(
      1000, // Get all products in collection
      0,
      undefined,
      undefined,
      parsedInput.collectionId
    );
    
    // Filter out products that are already in the collection
    const collectionProductIds = new Set(collectionProducts.map(p => p.id));
    const availableProducts = allProducts.filter(product => !collectionProductIds.has(product.id));
    
    // Apply pagination to filtered results
    const startIndex = 0; // We already applied offset in the initial query
    const endIndex = parsedInput.limit;
    const paginatedProducts = availableProducts.slice(startIndex, endIndex);
    
    // Calculate total available products count
    const totalAvailableCount = allProductsCount - collectionProductsCount;
    
    console.log(`✅ Fetched ${paginatedProducts.length} available products for collection (${totalAvailableCount} total available)`);
    
    return {
      data: paginatedProducts,
      total: totalAvailableCount,
      hasMore: parsedInput.offset + paginatedProducts.length < totalAvailableCount
    };
  });