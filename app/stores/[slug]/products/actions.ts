"use server";

import { z } from "zod";
import { unauthenticatedAction } from "@/lib/server-actions";
import { cartService } from "@/services/cart";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const addToCartSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().int().positive("Quantity must be positive").default(1),
  storeSlug: z.string(),
});

const checkCartStatusSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  storeSlug: z.string(),
});

export const addToCartAction = unauthenticatedAction
  .inputSchema(addToCartSchema)
  .action(async ({ parsedInput }) => {
    const { productId, quantity, storeSlug } = parsedInput;
    console.log("🛒 Add to cart action called with:", { productId, quantity, storeSlug });
    
    const cookieStore = await cookies();
    
    // Use store-specific session ID
    let sessionId = cookieStore.get(`cart_session_${storeSlug}`)?.value;
    console.log("🍪 Existing session ID:", sessionId);
    
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2);
      console.log("🆕 Generated new session ID:", sessionId);
      
      // Set store-specific cookie
      (await cookies()).set(`cart_session_${storeSlug}`, sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    console.log("📦 Getting or creating cart for session:", sessionId);
    const cart = await cartService.getOrCreateCart(undefined, sessionId);
    console.log("✅ Cart retrieved/created:", cart.id);
    
    console.log("🔧 Adding item to cart:", { cartId: cart.id, productId, quantity });
    const result = await cartService.addToCart(cart.id, productId, quantity);
    console.log("🎉 Item added successfully:", result.id);
    
    revalidatePath(`/stores/${storeSlug}/cart`);
    return { success: true, message: "Item added to cart", cartItemId: result.id };
  });

export const checkCartStatusAction = unauthenticatedAction
  .inputSchema(checkCartStatusSchema)
  .action(async ({ parsedInput }) => {
    const { productId, storeSlug } = parsedInput;
    console.log("🔍 Check cart status action called:", { productId, storeSlug });
    
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(`cart_session_${storeSlug}`)?.value;
    
    if (!sessionId) {
      console.log("📭 No cart session found");
      return { inCart: false, cartItem: null };
    }

    console.log("🔍 Finding cart for session:", sessionId);
    const cart = await cartService.getCartBySession(sessionId);
    
    if (!cart) {
      console.log("📭 No cart found for session");
      return { inCart: false, cartItem: null };
    }

    console.log("🔍 Checking if product is in cart:", { cartId: cart.id, productId });
    const cartItem = await cartService.isProductInCart(cart.id, productId);
    
    const inCart = cartItem !== null;
    console.log("✅ Cart status checked:", { inCart, cartItemId: cartItem?.id });
    
    return { 
      inCart, 
      cartItem: cartItem ? { 
        id: cartItem.id, 
        quantity: cartItem.quantity 
      } : null 
    };
  });