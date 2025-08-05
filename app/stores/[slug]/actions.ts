"use server";

import { z } from "zod";
import { authenticatedAction, unauthenticatedAction } from "@/lib/server-actions";
import { storeService } from "@/services/stores";
import { productService } from "@/services/products";
import { cartService } from "@/services/cart";
import { getFileUrl } from "@/lib/files";

export const getStoreBySlugAction = unauthenticatedAction
  .inputSchema(z.object({
    slug: z.string()
  }))
  .action(async ({ parsedInput }) => {
    const store = await storeService.getStoreBySlug(parsedInput.slug);
    
    if (!store) {
      return { store: null };
    }
    
    // Generate signed URLs for store images if they exist
    let storeWithSignedUrls = { ...store };
    
    if (store.logoUrl) {
      try {
        storeWithSignedUrls.logoUrl = await getFileUrl(store.logoUrl);
      } catch (error) {
        console.error(`Failed to get signed URL for store logo: ${store.logoUrl}`, error);
      }
    }
    
    if (store.bannerUrl) {
      try {
        storeWithSignedUrls.bannerUrl = await getFileUrl(store.bannerUrl);
      } catch (error) {
        console.error(`Failed to get signed URL for store banner: ${store.bannerUrl}`, error);
      }
    }
    
    return { store: storeWithSignedUrls };
  });

export const getStoreProductsAction = unauthenticatedAction
  .inputSchema(z.object({
    storeId: z.string(),
    page: z.string().optional(),
    search: z.string().optional(),
    categoryId: z.string().optional(),
    sort: z.string().optional(),
  }))
  .action(async ({ parsedInput }) => {
    const { storeId, page = "1", search, categoryId, sort } = parsedInput;
    
    const currentPage = parseInt(page, 10);
    const limit = 12; // Products per page
    const offset = (currentPage - 1) * limit;
    
    // TODO: Update productService to filter by storeId and support pagination
    const dbProducts = await productService.getProducts();
    
    // For now, just slice the products for pagination
    const paginatedProducts = dbProducts.slice(offset, offset + limit);
    const totalPages = Math.ceil(dbProducts.length / limit);
    
    // Transform database products to match the expected format
    const products = await Promise.all(
      paginatedProducts.map(async (product) => {
        let imageUrl: string | undefined;
        
        // Generate signed URL for product image if it exists
        if (product.image?.url) {
          try {
            imageUrl = await getFileUrl(product.image.url);
          } catch (error) {
            console.error(`Failed to get signed URL for product image: ${product.image.url}`, error);
          }
        }
        
        return {
          id: product.id,
          name: product.name,
          slug: product.slug,
          shortDescription: product.shortDescription || undefined,
          price: product.price,
          compareAtPrice: product.compareAtPrice || undefined,
          categoryName: product.categoryName || undefined,
          image: imageUrl ? {
            url: imageUrl,
            altText: product.image?.altText || product.name,
          } : undefined,
        };
      })
    );
    
    return { products, totalPages, currentPage };
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
    
    if (!product) {
      return { product: null };
    }
    
    // Generate signed URLs for product images
    const productWithSignedUrls = { ...product };
    
    if (product.images && product.images.length > 0) {
      productWithSignedUrls.images = await Promise.all(
        product.images.map(async (image: any) => {
          try {
            const signedUrl = await getFileUrl(image.url);
            return { ...image, url: signedUrl };
          } catch (error) {
            console.error(`Failed to get signed URL for product image: ${image.url}`, error);
            return image;
          }
        })
      );
    }
    
    return { product: productWithSignedUrls };
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