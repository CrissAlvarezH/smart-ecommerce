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
  price: z.string()
    .min(1, "Price is required")
    .refine((val) => {
      const numPrice = parseFloat(val);
      return !isNaN(numPrice) && numPrice > 0;
    }, "Price must be greater than 0"),
  compareAtPrice: z.string()
    .optional()
    .transform((val) => val === "" ? undefined : val)
    .refine((val) => {
      if (!val) return true; // Optional field
      const numPrice = parseFloat(val);
      return !isNaN(numPrice) && numPrice > 0;
    }, "Compare at price must be greater than 0"),
  sku: z.string().optional().transform((val) => val === "" ? undefined : val),
  inventory: z.number().int().min(0, "Inventory must be non-negative"),
  weight: z.string().optional().transform((val) => val === "" ? undefined : val),
  categoryId: z.string().optional().transform((val) => val === "" ? undefined : val),
  storeId: z.string().min(1, "Store ID is required"),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
}).refine((data) => {
  // Additional validation: compareAtPrice must be greater than price if provided
  if (data.compareAtPrice) {
    const price = parseFloat(data.price);
    const compareAtPrice = parseFloat(data.compareAtPrice);
    return compareAtPrice > price;
  }
  return true;
}, {
  message: "Compare at price must be greater than the regular price",
  path: ["compareAtPrice"], // This will associate the error with the compareAtPrice field
});

const updateProductSchema = z.object({
  id: z.string().min(1, "ID is required"),
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional().transform((val) => val === "" ? undefined : val),
  shortDescription: z.string().optional().transform((val) => val === "" ? undefined : val),
  price: z.string()
    .min(1, "Price is required")
    .refine((val) => {
      const numPrice = parseFloat(val);
      return !isNaN(numPrice) && numPrice > 0;
    }, "Price must be greater than 0"),
  compareAtPrice: z.string()
    .optional()
    .transform((val) => val === "" ? undefined : val)
    .refine((val) => {
      if (!val) return true; // Optional field
      const numPrice = parseFloat(val);
      return !isNaN(numPrice) && numPrice > 0;
    }, "Compare at price must be greater than 0"),
  sku: z.string().optional().transform((val) => val === "" ? undefined : val),
  inventory: z.number().int().min(0, "Inventory must be non-negative"),
  weight: z.string().optional().transform((val) => val === "" ? undefined : val),
  categoryId: z.string().optional().transform((val) => val === "" ? undefined : val),
  storeId: z.string().min(1, "Store ID is required"),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
}).refine((data) => {
  // Additional validation: compareAtPrice must be greater than price if provided
  if (data.compareAtPrice) {
    const price = parseFloat(data.price);
    const compareAtPrice = parseFloat(data.compareAtPrice);
    return compareAtPrice > price;
  }
  return true;
}, {
  message: "Compare at price must be greater than the regular price",
  path: ["compareAtPrice"], // This will associate the error with the compareAtPrice field
});

const deleteProductSchema = z.object({
  id: z.string().min(1, "ID is required"),
  storeId: z.string().min(1, "Store ID is required"),
});

const getProductsPageDataSchema = z.object({
  page: z.string().default("1"),
  search: z.string().optional(),
  categoryId: z.string().optional(),
  collectionId: z.string().optional(),
  storeId: z.string().min(1, "Store ID is required"),
  limit: z.number().int().positive().default(10),
});

// Product Actions
export const createProductAction = authenticatedAction
  .inputSchema(createProductSchema)
  .action(async ({ parsedInput }) => {
    console.log("📦 Creating product:", parsedInput);
    const product = await productsRepo.createProduct(parsedInput);
    console.log("✅ Product created:", product.id);
    
    revalidatePath("/", "layout");
    return product;
  });

export const updateProductAction = authenticatedAction
  .inputSchema(updateProductSchema)
  .action(async ({ parsedInput }) => {
    console.log("📝 Updating product:", parsedInput.id);
    const product = await productsRepo.updateProduct(parsedInput);
    console.log("✅ Product updated:", product.id);
    
    revalidatePath("/", "layout");
    return product;
  });

export const deleteProductAction = authenticatedAction
  .inputSchema(deleteProductSchema)
  .action(async ({ parsedInput }) => {
    console.log("🗑️ Deleting product:", parsedInput.id);
    await productsRepo.deleteProduct(parsedInput.id);
    console.log("✅ Product deleted");
    
    revalidatePath("/", "layout");
    return { success: true };
  });

export const getProductsPageDataAction = authenticatedAction
  .inputSchema(getProductsPageDataSchema)
  .action(async ({ parsedInput }) => {
    console.log("📊 Fetching products page data:", parsedInput);
    
    const offset = (parseInt(parsedInput.page) - 1) * parsedInput.limit;
    
    // Fetch all data in parallel
    const [products, totalCount, categories, collections] = await Promise.all([
      productsRepo.getProducts(parsedInput.limit, offset, parsedInput.search, parsedInput.categoryId, parsedInput.collectionId, parsedInput.storeId),
      productsRepo.getProductsCount(parsedInput.search, parsedInput.categoryId, parsedInput.collectionId, parsedInput.storeId),
      categoriesRepo.getActiveCategories(parsedInput.storeId),
      collectionsRepo.getActiveCollections(parsedInput.storeId)
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

// Product Image Management Schemas
const addProductImageSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  url: z.string().min(1, "Image URL is required"),
  altText: z.string().optional(),
  position: z.number().int().min(0).default(0),
});

const updateProductImageSchema = z.object({
  id: z.string().min(1, "Image ID is required"),
  url: z.string().optional(),
  altText: z.string().optional(),
  position: z.number().int().min(0).optional(),
});

const deleteProductImageSchema = z.object({
  id: z.string().min(1, "Image ID is required"),
});

const getProductImagesSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
});

const reorderProductImagesSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  imageIds: z.array(z.string()).min(1, "At least one image ID is required"),
});

// Product Image Management Actions
export const addProductImageAction = authenticatedAction
  .inputSchema(addProductImageSchema)
  .action(async ({ parsedInput }) => {
    console.log("🖼️ Adding product image:", parsedInput);
    const image = await productsRepo.addProductImage(parsedInput.productId, {
      url: parsedInput.url,
      altText: parsedInput.altText,
      position: parsedInput.position,
    });
    console.log("✅ Product image added:", image.id);
    
    revalidatePath("/", "layout");
    return image;
  });

export const updateProductImageAction = authenticatedAction
  .inputSchema(updateProductImageSchema)
  .action(async ({ parsedInput }) => {
    console.log("📝 Updating product image:", parsedInput.id);
    const { id, ...updateData } = parsedInput;
    const image = await productsRepo.updateProductImage(id, updateData);
    console.log("✅ Product image updated:", image.id);
    
    revalidatePath("/", "layout");
    return image;
  });

export const deleteProductImageAction = authenticatedAction
  .inputSchema(deleteProductImageSchema)
  .action(async ({ parsedInput }) => {
    console.log("🗑️ Deleting product image:", parsedInput.id);
    await productsRepo.deleteProductImage(parsedInput.id);
    console.log("✅ Product image deleted");
    
    revalidatePath("/", "layout");
    return { success: true };
  });

export const getProductImagesAction = authenticatedAction
  .inputSchema(getProductImagesSchema)
  .action(async ({ parsedInput }) => {
    console.log("📷 Fetching product images:", parsedInput.productId);
    const images = await productsRepo.getProductImages(parsedInput.productId);
    console.log(`✅ Fetched ${images.length} images for product`);
    
    return images;
  });

export const reorderProductImagesAction = authenticatedAction
  .inputSchema(reorderProductImagesSchema)
  .action(async ({ parsedInput }) => {
    console.log("🔄 Reordering product images:", parsedInput);
    
    // Update position for each image
    const updatePromises = parsedInput.imageIds.map((imageId, index) =>
      productsRepo.updateProductImage(imageId, { position: index })
    );
    
    await Promise.all(updatePromises);
    console.log("✅ Product images reordered");
    
    revalidatePath("/", "layout");
    return { success: true };
  });