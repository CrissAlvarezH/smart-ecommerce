"use server";

import { authenticatedAction } from "@/lib/server-actions";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { adminDiscountService, adminProductService, adminCollectionService } from "@/services/admin";
import { PublicError } from "@/lib/errors";

const createDiscountSchema = z.object({
  name: z.string().min(1, "Discount name is required"),
  percentage: z.string().refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0 && num <= 100;
  }, "Percentage must be between 0 and 100"),
  endDate: z.string().refine((val) => {
    const date = new Date(val);
    return date > new Date();
  }, "End date must be in the future"),
  storeId: z.string().min(1, "Store ID is required"),
  isActive: z.boolean().default(true),
});

const updateDiscountSchema = createDiscountSchema.extend({
  id: z.string().min(1, "Discount ID is required"),
}).partial().required({ id: true });

const deleteDiscountSchema = z.object({
  id: z.string().min(1, "Discount ID is required"),
});

const getDiscountsSchema = z.object({
  page: z.string().default("1"),
  search: z.string().optional(),
  storeId: z.string().min(1, "Store ID is required"),
  includeExpired: z.boolean().default(false),
});

const addProductToDiscountSchema = z.object({
  discountId: z.string().min(1, "Discount ID is required"),
  productId: z.string().min(1, "Product ID is required"),
});

const removeProductFromDiscountSchema = z.object({
  discountId: z.string().min(1, "Discount ID is required"),
  productId: z.string().min(1, "Product ID is required"),
});

const getDiscountProductsSchema = z.object({
  discountId: z.string().min(1, "Discount ID is required"),
});

export const createDiscountAction = authenticatedAction
  .inputSchema(createDiscountSchema)
  .action(async ({ parsedInput }) => {
    console.log("🏷️ Creating discount:", parsedInput);
    
    const discount = await adminDiscountService.createDiscount({
      ...parsedInput,
      endDate: new Date(parsedInput.endDate),
    });
    
    console.log("✅ Discount created");
    
    revalidatePath("/", "layout");
    return discount;
  });

export const updateDiscountAction = authenticatedAction
  .inputSchema(updateDiscountSchema)
  .action(async ({ parsedInput }) => {
    console.log("📝 Updating discount:", parsedInput);
    
    const updateData = {
      ...parsedInput,
      ...(parsedInput.endDate && { endDate: new Date(parsedInput.endDate) }),
    };
    
    const discount = await adminDiscountService.updateDiscount(updateData);
    
    console.log("✅ Discount updated");
    
    revalidatePath("/", "layout");
    return discount;
  });

export const deleteDiscountAction = authenticatedAction
  .inputSchema(deleteDiscountSchema)
  .action(async ({ parsedInput }) => {
    console.log("🗑️ Attempting to delete discount:", parsedInput);
    
    await adminDiscountService.deleteDiscount(parsedInput.id);
    
    console.log("✅ Discount deleted");
    
    revalidatePath("/", "layout");
    return { success: true };
  });

export const getDiscountsPageDataAction = authenticatedAction
  .inputSchema(getDiscountsSchema)
  .action(async ({ parsedInput }) => {
    const page = parseInt(parsedInput.page) || 1;
    const limit = 50;
    const offset = (page - 1) * limit;
    
    const [discounts, totalCount] = await Promise.all([
      adminDiscountService.getDiscounts(
        limit,
        offset,
        parsedInput.search,
        parsedInput.storeId,
        parsedInput.includeExpired
      ),
      adminDiscountService.getDiscountsCount(
        parsedInput.search,
        parsedInput.storeId,
        parsedInput.includeExpired
      ),
    ]);
    
    const totalPages = Math.ceil(totalCount / limit);
    
    return {
      discounts,
      pagination: {
        page,
        totalPages,
        totalCount,
        hasMore: page < totalPages,
      },
    };
  });

export const getDiscountByIdAction = authenticatedAction
  .inputSchema(z.object({ id: z.string(), storeId: z.string() }))
  .action(async ({ parsedInput }) => {
    const discount = await adminDiscountService.getDiscountById(
      parsedInput.id,
      parsedInput.storeId
    );
    
    if (!discount) {
      throw new PublicError("Discount not found");
    }
    
    return discount;
  });

export const addProductToDiscountAction = authenticatedAction
  .inputSchema(addProductToDiscountSchema)
  .action(async ({ parsedInput }) => {
    console.log("➕ Adding product to discount:", parsedInput);
    
    const result = await adminDiscountService.addProductToDiscount(
      parsedInput.discountId,
      parsedInput.productId
    );
    
    console.log("✅ Product added to discount");
    
    revalidatePath("/", "layout");
    return result;
  });

export const removeProductFromDiscountAction = authenticatedAction
  .inputSchema(removeProductFromDiscountSchema)
  .action(async ({ parsedInput }) => {
    console.log("➖ Removing product from discount:", parsedInput);
    
    await adminDiscountService.removeProductFromDiscount(
      parsedInput.discountId,
      parsedInput.productId
    );
    
    console.log("✅ Product removed from discount");
    
    revalidatePath("/", "layout");
    return { success: true };
  });

export const getDiscountProductsAction = authenticatedAction
  .inputSchema(getDiscountProductsSchema)
  .action(async ({ parsedInput }) => {
    const products = await adminDiscountService.getAllDiscountProducts(
      parsedInput.discountId
    );
    
    return products;
  });

const getAvailableProductsForDiscountSchema = z.object({
  discountId: z.string().min(1, "Discount ID is required"),
  storeId: z.string().min(1, "Store ID is required"),
  search: z.string().optional(),
  limit: z.number().int().positive().default(100),
});

export const getAvailableProductsForDiscountAction = authenticatedAction
  .inputSchema(getAvailableProductsForDiscountSchema)
  .action(async ({ parsedInput }) => {
    console.log("🛍️ Fetching available products for discount:", parsedInput);
    
    // Get all products (filtered by store)
    const allProducts = await adminProductService.getProducts(
      parsedInput.limit,
      0,
      parsedInput.search,
      undefined,
      undefined,
      parsedInput.storeId
    );
    
    // Get products already in discount
    const discountProducts = await adminDiscountService.getDiscountProducts(
      parsedInput.discountId
    );
    
    // Filter out products that are already in the discount
    const discountProductIds = new Set(discountProducts.map(p => p.id));
    const availableProducts = allProducts.filter(product => !discountProductIds.has(product.id));
    
    console.log(`✅ Fetched ${availableProducts.length} available products for discount`);
    
    return availableProducts;
  });

const addCollectionToDiscountSchema = z.object({
  discountId: z.string().min(1, "Discount ID is required"),
  collectionId: z.string().min(1, "Collection ID is required"),
});

const removeCollectionFromDiscountSchema = z.object({
  discountId: z.string().min(1, "Discount ID is required"),
  collectionId: z.string().min(1, "Collection ID is required"),
});

const getDiscountCollectionsSchema = z.object({
  discountId: z.string().min(1, "Discount ID is required"),
});

export const addCollectionToDiscountAction = authenticatedAction
  .inputSchema(addCollectionToDiscountSchema)
  .action(async ({ parsedInput }) => {
    console.log("➕ Adding collection to discount:", parsedInput);
    
    const result = await adminDiscountService.addCollectionToDiscount(
      parsedInput.discountId,
      parsedInput.collectionId
    );
    
    console.log("✅ Collection added to discount");
    
    revalidatePath("/", "layout");
    return result;
  });

export const removeCollectionFromDiscountAction = authenticatedAction
  .inputSchema(removeCollectionFromDiscountSchema)
  .action(async ({ parsedInput }) => {
    console.log("➖ Removing collection from discount:", parsedInput);
    
    await adminDiscountService.removeCollectionFromDiscount(
      parsedInput.discountId,
      parsedInput.collectionId
    );
    
    console.log("✅ Collection removed from discount");
    
    revalidatePath("/", "layout");
    return { success: true };
  });

export const getDiscountCollectionsAction = authenticatedAction
  .inputSchema(getDiscountCollectionsSchema)
  .action(async ({ parsedInput }) => {
    const collections = await adminDiscountService.getDiscountCollections(
      parsedInput.discountId
    );
    
    return collections;
  });

const getAvailableCollectionsForDiscountSchema = z.object({
  discountId: z.string().min(1, "Discount ID is required"),
  storeId: z.string().min(1, "Store ID is required"),
  search: z.string().optional(),
  limit: z.number().int().positive().default(100),
});

export const getAvailableCollectionsForDiscountAction = authenticatedAction
  .inputSchema(getAvailableCollectionsForDiscountSchema)
  .action(async ({ parsedInput }) => {
    console.log("📦 Fetching available collections for discount:", parsedInput);
    
    // Get all active collections for the store
    const allCollections = await adminCollectionService.getActiveCollections(
      parsedInput.storeId
    );
    
    // Get collections already in discount
    const discountCollections = await adminDiscountService.getDiscountCollections(
      parsedInput.discountId
    );
    
    // Filter out collections that are already in the discount
    const discountCollectionIds = new Set(discountCollections.map(c => c.id));
    let availableCollections = allCollections.filter(collection => !discountCollectionIds.has(collection.id));
    
    // Apply search filter if provided
    if (parsedInput.search) {
      const searchLower = parsedInput.search.toLowerCase();
      availableCollections = availableCollections.filter(collection => 
        collection.name.toLowerCase().includes(searchLower) ||
        (collection.description && collection.description.toLowerCase().includes(searchLower))
      );
    }
    
    console.log(`✅ Fetched ${availableCollections.length} available collections for discount`);
    
    return availableCollections;
  });