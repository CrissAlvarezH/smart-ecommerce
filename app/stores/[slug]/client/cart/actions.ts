"use server";

import { z } from "zod";
import { authenticatedAction, unauthenticatedAction } from "@/lib/server-actions";
import { cartService } from "@/services/cart";
import { cookies } from "next/headers";
import { getFileUrl } from "@/lib/files";
import * as cartRepository from "@/repositories/cart";
import { calculateShippingForRates } from "@/services/shipping-calculator";

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

export const getAvailableShippingRatesAction = unauthenticatedAction
  .inputSchema(z.object({
    storeId: z.string(),
    storeSlug: z.string(),
    address: z.object({
      country: z.string().optional(),
      state: z.string().optional(),
      postalCode: z.string().optional(),
    }).optional(),
  }))
  .action(async ({ parsedInput }) => {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(`cart_session_${parsedInput.storeSlug}`)?.value;
    
    if (!sessionId) {
      throw new Error("No cart session found");
    }

    // Get cart items for calculation
    const cart = await cartService.getOrCreateCart(undefined, sessionId);
    const cartItems = await cartService.getCartWithItems(cart.id);

    // Get available shipping rates
    const shippingOptions = await cartRepository.getAvailableShippingRates(
      parsedInput.storeId,
      parsedInput.address
    );

    // Calculate shipping costs for each rate
    const calculatedOptions = shippingOptions.map(({ zone, rates }) => {
      const calculatedRates = calculateShippingForRates(rates, {
        cartItems: cartItems as any,
        address: parsedInput.address
      });

      return {
        zone,
        rates: calculatedRates
      };
    });

    return { shippingOptions: calculatedOptions };
  });

export const updateCartShippingAction = unauthenticatedAction
  .inputSchema(z.object({
    storeSlug: z.string(),
    shippingRateId: z.string(),
    shippingCost: z.string(),
    shippingAddress: z.string().optional(),
    shippingCity: z.string().optional(),
    shippingState: z.string().optional(),
    shippingCountry: z.string().optional(),
    shippingPostalCode: z.string().optional(),
  }))
  .action(async ({ parsedInput }) => {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(`cart_session_${parsedInput.storeSlug}`)?.value;
    
    if (!sessionId) {
      throw new Error("No cart session found");
    }

    const cart = await cartService.getOrCreateCart(undefined, sessionId);
    
    const updatedCart = await cartRepository.updateCartShipping(cart.id, {
      shippingRateId: parsedInput.shippingRateId,
      shippingCost: parsedInput.shippingCost,
      shippingAddress: parsedInput.shippingAddress || null,
      shippingCity: parsedInput.shippingCity || null,
      shippingState: parsedInput.shippingState || null,
      shippingCountry: parsedInput.shippingCountry || null,
      shippingPostalCode: parsedInput.shippingPostalCode || null,
    });

    return { success: true, cart: updatedCart };
  });

export const getCartWithShippingAction = unauthenticatedAction
  .inputSchema(z.object({
    storeSlug: z.string(),
  }))
  .action(async ({ parsedInput }) => {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(`cart_session_${parsedInput.storeSlug}`)?.value;
    
    if (!sessionId) {
      throw new Error("No cart session found");
    }

    const cart = await cartService.getOrCreateCart(undefined, sessionId);
    const cartWithShipping = await cartRepository.getCartWithShippingDetails(cart.id);
    const cartItems = await cartService.getCartWithItems(cart.id);
    const itemsWithSignedUrls = await generateSignedUrlsForCartItems(cartItems);

    return { 
      cart: cartWithShipping?.cart || cart, 
      shippingRate: cartWithShipping?.shippingRate || null,
      shippingZone: cartWithShipping?.shippingZone || null,
      cartItems: itemsWithSignedUrls 
    };
  });