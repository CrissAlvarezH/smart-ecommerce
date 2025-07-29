"use server";

import { actionClient } from "@/lib/server-actions";
import { cartService } from "@/services/cart";
import { cookies } from "next/headers";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const addToCartSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().int().positive("Quantity must be positive").default(1),
});

const updateCartItemSchema = z.object({
  cartItemId: z.string().min(1, "Cart item ID is required"),
  quantity: z.number().int().min(0, "Quantity must be non-negative"),
});

const removeFromCartSchema = z.object({
  cartItemId: z.string().min(1, "Cart item ID is required"),
});

const checkCartStatusSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
});

export const addToCartAction = actionClient
  .schema(addToCartSchema)
  .action(async ({ parsedInput }: { parsedInput: z.infer<typeof addToCartSchema> }) => {
    try {
      const { productId, quantity } = parsedInput;
      console.log("🛒 Add to cart action called with:", { productId, quantity });
      
      const cookieStore = await cookies();
      
      // For now, we'll use a session ID from cookies for guest users
      let sessionId = cookieStore.get("cart_session_id")?.value;
      console.log("🍪 Existing session ID:", sessionId);
      
      if (!sessionId) {
        sessionId = Math.random().toString(36).substring(2);
        console.log("🆕 Generated new session ID:", sessionId);
        
        // Set cookie properly in Next.js 15
        (await cookies()).set("cart_session_id", sessionId, {
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
      
      revalidatePath("/cart");
      return { success: true, message: "Item added to cart", cartItemId: result.id };
    } catch (error) {
      console.error("❌ Error in addToCartAction:", error);
      console.error("Stack trace:", error instanceof Error ? error.stack : 'No stack trace');
      throw new Error(`Failed to add item to cart: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

export const updateCartItemAction = actionClient
  .schema(updateCartItemSchema)
  .action(async ({ parsedInput }: { parsedInput: z.infer<typeof updateCartItemSchema> }) => {
    try {
      const { cartItemId, quantity } = parsedInput;
      console.log("🔄 Update cart item action called:", { cartItemId, quantity });

      if (quantity === 0) {
        console.log("🗑️ Quantity is 0, removing item");
        await cartService.removeFromCart(cartItemId);
      } else {
        console.log("📝 Updating item quantity");
        await cartService.updateCartItemQuantity(cartItemId, quantity);
      }
      
      console.log("✅ Cart item updated successfully");
      revalidatePath("/cart");
      return { success: true, message: "Cart updated" };
    } catch (error) {
      console.error("❌ Error updating cart item:", error);
      console.error("Stack trace:", error instanceof Error ? error.stack : 'No stack trace');
      throw new Error(`Failed to update cart item: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

export const removeFromCartAction = actionClient
  .schema(removeFromCartSchema)
  .action(async ({ parsedInput }: { parsedInput: z.infer<typeof removeFromCartSchema> }) => {
    try {
      const { cartItemId } = parsedInput;
      console.log("🗑️ Remove from cart action called:", { cartItemId });

      await cartService.removeFromCart(cartItemId);
      console.log("✅ Item removed successfully");
      
      revalidatePath("/cart");
      return { success: true, message: "Item removed from cart" };
    } catch (error) {
      console.error("❌ Error removing from cart:", error);
      console.error("Stack trace:", error instanceof Error ? error.stack : 'No stack trace');
      throw new Error(`Failed to remove item from cart: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

export const clearCartAction = actionClient.action(async () => {
  try {
    console.log("🧹 Clear cart action called");
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("cart_session_id")?.value;

    if (!sessionId) {
      console.log("❌ No cart session found");
      throw new Error("No cart session found");
    }

    console.log("🔍 Finding cart for session:", sessionId);
    const cart = await cartService.getOrCreateCart(undefined, sessionId);
    console.log("🧹 Clearing cart:", cart.id);
    await cartService.clearCart(cart.id);
    console.log("✅ Cart cleared successfully");
    
    revalidatePath("/cart");
    return { success: true, message: "Cart cleared" };
  } catch (error) {
    console.error("❌ Error clearing cart:", error);
    console.error("Stack trace:", error instanceof Error ? error.stack : 'No stack trace');
    throw new Error(`Failed to clear cart: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
});

export const checkCartStatusAction = actionClient
  .schema(checkCartStatusSchema)
  .action(async ({ parsedInput }: { parsedInput: z.infer<typeof checkCartStatusSchema> }) => {
    try {
      const { productId } = parsedInput;
      console.log("🔍 Check cart status action called:", { productId });
      
      const cookieStore = await cookies();
      const sessionId = cookieStore.get("cart_session_id")?.value;
      
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
    } catch (error) {
      console.error("❌ Error checking cart status:", error);
      console.error("Stack trace:", error instanceof Error ? error.stack : 'No stack trace');
      return { inCart: false, cartItem: null };
    }
  });