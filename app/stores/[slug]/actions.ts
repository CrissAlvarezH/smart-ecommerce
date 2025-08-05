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
    
    let dbProducts;
    
    if (search) {
      // Search products by name
      dbProducts = await productService.searchProducts(search, limit, offset, storeId);
    } else if (categoryId) {
      // Get products by category
      dbProducts = await productService.getProductsByCategory(categoryId, limit, offset, storeId);
    } else {
      // Get all products for the store
      dbProducts = await productService.getProducts(limit, offset, storeId);
    }
    
    // Products are already paginated from the database query
    const paginatedProducts = dbProducts;
    
    // TODO: We need a separate count query to get accurate total pages
    // For now, assume there might be more pages if we got a full limit of products
    const totalPages = dbProducts.length === limit ? currentPage + 1 : currentPage;
    
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
          inventory: product.inventory,
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
    
    // Get product by slug and verify it belongs to this store
    const product = await productService.getProductBySlug(parsedInput.productSlug, store.id);
    
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

export const getStoreCategoriesAction = unauthenticatedAction
  .inputSchema(z.object({
    storeId: z.string(),
  }))
  .action(async ({ parsedInput }) => {
    const { storeId } = parsedInput;
    
    // Get categories for this store from the product service
    const dbCategories = await productService.getCategories(storeId);
    
    // Transform and generate signed URLs for category images
    const categories = await Promise.all(
      dbCategories.map(async (category) => {
        let imageUrl: string | undefined;
        let bannerUrl: string | undefined;
        
        // Generate signed URLs for category images if they exist
        if (category.imageUrl) {
          try {
            imageUrl = await getFileUrl(category.imageUrl);
          } catch (error) {
            console.error(`Failed to get signed URL for category image: ${category.imageUrl}`, error);
          }
        }
        
        if (category.bannerUrl) {
          try {
            bannerUrl = await getFileUrl(category.bannerUrl);
          } catch (error) {
            console.error(`Failed to get signed URL for category banner: ${category.bannerUrl}`, error);
          }
        }
        
        return {
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          imageUrl,
          bannerUrl,
          displayMode: category.displayMode,
          isActive: category.isActive,
        };
      })
    );
    
    return { categories };
  });

export const getStoreCategoryBySlugAction = unauthenticatedAction
  .inputSchema(z.object({
    storeId: z.string(),
    categorySlug: z.string(),
  }))
  .action(async ({ parsedInput }) => {
    const { storeId, categorySlug } = parsedInput;
    
    // Get category by slug from the database
    const dbCategories = await productService.getCategories(storeId);
    const category = dbCategories.find(cat => cat.slug === categorySlug);
    
    if (!category) {
      return { category: null };
    }
    
    // Generate signed URLs for category images
    let imageUrl: string | undefined;
    let bannerUrl: string | undefined;
    
    if (category.imageUrl) {
      try {
        imageUrl = await getFileUrl(category.imageUrl);
      } catch (error) {
        console.error(`Failed to get signed URL for category image: ${category.imageUrl}`, error);
      }
    }
    
    if (category.bannerUrl) {
      try {
        bannerUrl = await getFileUrl(category.bannerUrl);
      } catch (error) {
        console.error(`Failed to get signed URL for category banner: ${category.bannerUrl}`, error);
      }
    }
    
    const categoryWithUrls = {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      imageUrl,
      bannerUrl,
      displayMode: category.displayMode,
      isActive: category.isActive,
    };
    
    return { category: categoryWithUrls };
  });

export const getStoreCategoryProductsAction = unauthenticatedAction
  .inputSchema(z.object({
    storeId: z.string(),
    categoryId: z.string(),
    page: z.string().optional(),
  }))
  .action(async ({ parsedInput }) => {
    const { storeId, categoryId, page = "1" } = parsedInput;
    
    const currentPage = parseInt(page, 10);
    const limit = 12; // Products per page
    const offset = (currentPage - 1) * limit;
    
    // Get products by category from the product service
    const dbProducts = await productService.getProductsByCategory(categoryId, limit, offset, storeId);
    const totalPages = Math.ceil(dbProducts.length / limit); // This is approximate, ideally we'd have a count method
    
    // Transform and generate signed URLs for product images
    const products = await Promise.all(
      dbProducts.map(async (product) => {
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
          inventory: product.inventory,
          image: imageUrl ? {
            url: imageUrl,
            altText: product.image?.altText || product.name,
          } : undefined,
        };
      })
    );
    
    return { products, totalPages, currentPage };
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
    
    // Generate signed URLs for product images
    const cartItemsWithSignedUrls = await Promise.all(
      cartItems.map(async (item) => {
        if (item.product.image?.url) {
          try {
            const signedUrl = await getFileUrl(item.product.image.url);
            return {
              ...item,
              product: {
                ...item.product,
                image: {
                  ...item.product.image,
                  url: signedUrl
                }
              }
            };
          } catch (error) {
            console.error(`Failed to get signed URL for cart item image: ${item.product.image.url}`, error);
            // Return item without image if URL generation fails
            return {
              ...item,
              product: {
                ...item.product,
                image: null
              }
            };
          }
        }
        return item;
      })
    );
    
    return { cartItems: cartItemsWithSignedUrls };
  });