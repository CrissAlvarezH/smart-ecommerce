"use server";

import { z } from "zod";
import { authenticatedAction, unauthenticatedAction } from "@/lib/server-actions";
import { cartService } from "@/services/cart";
import { cookies } from "next/headers";

export const updateCartItemAction = unauthenticatedAction
  .inputSchema(z.object({
    cartItemId: z.string(),
    quantity: z.number().min(0)
  }))
  .action(async ({ parsedInput }) => {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("cart_session_id")?.value;
    
    if (!sessionId) {
      throw new Error("No cart session found");
    }

    const cart = await cartService.getOrCreateCart(undefined, sessionId);
    
    if (parsedInput.quantity === 0) {
      await cartService.removeFromCart(cart.id, parsedInput.cartItemId);
      const updatedItems = await cartService.getCartWithItems(cart.id);
      return { success: true, cartItems: updatedItems };
    }
    
    await cartService.updateCartItemQuantity(cart.id, parsedInput.cartItemId, parsedInput.quantity);
    const updatedItems = await cartService.getCartWithItems(cart.id);
    return { success: true, cartItems: updatedItems };
  });

export const removeFromCartAction = unauthenticatedAction
  .inputSchema(z.object({
    cartItemId: z.string()
  }))
  .action(async ({ parsedInput }) => {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("cart_session_id")?.value;
    
    if (!sessionId) {
      throw new Error("No cart session found");
    }

    const cart = await cartService.getOrCreateCart(undefined, sessionId);
    await cartService.removeFromCart(cart.id, parsedInput.cartItemId);
    
    const updatedItems = await cartService.getCartWithItems(cart.id);
    return { success: true, cartItems: updatedItems };
  });

export const clearCartAction = unauthenticatedAction
  .action(async () => {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("cart_session_id")?.value;
    
    if (!sessionId) {
      throw new Error("No cart session found");
    }

    const cart = await cartService.getOrCreateCart(undefined, sessionId);
    await cartService.clearCart(cart.id);
    
    return { success: true };
  });