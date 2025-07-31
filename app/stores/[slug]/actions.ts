"use server";

import { z } from "zod";
import { authenticatedAction, unauthenticatedAction } from "@/lib/server-actions";
import { storeService } from "@/services/stores";
import { productService } from "@/services/products";
import { cartService } from "@/services/cart";

export const getStoreBySlugAction = unauthenticatedAction
  .inputSchema(z.object({
    slug: z.string()
  }))
  .action(async ({ parsedInput }) => {
    const store = await storeService.getStoreBySlug(parsedInput.slug);
    return { store };
  });

export const getStoreProductsAction = unauthenticatedAction
  .inputSchema(z.object({
    storeSlug: z.string()
  }))
  .action(async ({ parsedInput }) => {
    const store = await storeService.getStoreBySlug(parsedInput.storeSlug);
    if (!store) {
      throw new Error("Store not found");
    }
    
    // TODO: Update productService to filter by storeId
    const dbProducts = await productService.getProducts();
    
    // Transform database products to match the expected format
    const products = dbProducts.map(product => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      shortDescription: product.shortDescription || undefined,
      price: product.price,
      compareAtPrice: product.compareAtPrice || undefined,
      categoryName: product.categoryName || undefined,
      image: product.image ? {
        url: product.image.url,
        altText: product.image.altText || product.name,
      } : undefined,
    }));
    
    return { products };
  });

export const getStoreProductBySlugAction = unauthenticatedAction
  .inputSchema(z.object({
    storeSlug: z.string(),
    productSlug: z.string()
  }))
  .action(async ({ parsedInput }) => {
    const store = await storeService.getStoreBySlug(parsedInput.storeSlug);
    if (!store) {
      throw new Error("Store not found");
    }
    
    // TODO: Verify product belongs to store when we add storeId to products
    const product = await productService.getProductBySlug(parsedInput.productSlug);
    
    return { product };
  });

export const getStoreCartItemsAction = unauthenticatedAction
  .inputSchema(z.object({
    storeSlug: z.string(),
    sessionId: z.string()
  }))
  .action(async ({ parsedInput }) => {
    const store = await storeService.getStoreBySlug(parsedInput.storeSlug);
    if (!store) {
      throw new Error("Store not found");
    }
    
    // TODO: Update cart service to be store-aware
    const cart = await cartService.getOrCreateCart(undefined, parsedInput.sessionId);
    const cartItems = await cartService.getCartWithItems(cart.id);
    
    return { cartItems };
  });