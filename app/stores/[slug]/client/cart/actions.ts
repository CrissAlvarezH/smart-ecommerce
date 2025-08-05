"use server";

import { z } from "zod";
import { authenticatedAction, unauthenticatedAction } from "@/lib/server-actions";
import { cartService } from "@/services/cart";
import { cookies } from "next/headers";
import { getFileUrl } from "@/lib/files";

// Helper function to generate signed URLs for cart item images
async function generateSignedUrlsForCartItems(cartItems: any[]) {
  return Promise.all(
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
}

export const updateCartItemAction = unauthenticatedAction
  .inputSchema(z.object({
    cartItemId: z.string(),
    quantity: z.number().min(0),
    storeSlug: z.string()
  }))
  .action(async ({ parsedInput }) => {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(`cart_session_${parsedInput.storeSlug}`)?.value;
    
    if (!sessionId) {
      throw new Error("No cart session found");
    }

    const cart = await cartService.getOrCreateCart(undefined, sessionId);
    
    if (parsedInput.quantity === 0) {
      await cartService.removeFromCart(cart.id, parsedInput.cartItemId);
      const updatedItems = await cartService.getCartWithItems(cart.id);
      const itemsWithSignedUrls = await generateSignedUrlsForCartItems(updatedItems);
      return { success: true, cartItems: itemsWithSignedUrls };
    }
    
    await cartService.updateCartItemQuantity(cart.id, parsedInput.cartItemId, parsedInput.quantity);
    const updatedItems = await cartService.getCartWithItems(cart.id);
    const itemsWithSignedUrls = await generateSignedUrlsForCartItems(updatedItems);
    return { success: true, cartItems: itemsWithSignedUrls };
  });

export const removeFromCartAction = unauthenticatedAction
  .inputSchema(z.object({
    cartItemId: z.string(),
    storeSlug: z.string()
  }))
  .action(async ({ parsedInput }) => {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(`cart_session_${parsedInput.storeSlug}`)?.value;
    
    if (!sessionId) {
      throw new Error("No cart session found");
    }

    const cart = await cartService.getOrCreateCart(undefined, sessionId);
    await cartService.removeFromCart(cart.id, parsedInput.cartItemId);
    
    const updatedItems = await cartService.getCartWithItems(cart.id);
    const itemsWithSignedUrls = await generateSignedUrlsForCartItems(updatedItems);
    return { success: true, cartItems: itemsWithSignedUrls };
  });

export const clearCartAction = unauthenticatedAction
  .inputSchema(z.object({
    storeSlug: z.string()
  }))
  .action(async ({ parsedInput }) => {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(`cart_session_${parsedInput.storeSlug}`)?.value;
    
    if (!sessionId) {
      throw new Error("No cart session found");
    }

    const cart = await cartService.getOrCreateCart(undefined, sessionId);
    await cartService.clearCart(cart.id);
    
    return { success: true };
  });