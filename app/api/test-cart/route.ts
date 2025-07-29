import { NextRequest, NextResponse } from "next/server";
import { cartService } from "@/services/cart";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { productId, quantity = 1 } = await request.json();
    
    console.log("Testing add to cart with:", { productId, quantity });
    
    // Get or create session ID
    const cookieStore = await cookies();
    let sessionId = cookieStore.get("cart_session_id")?.value;
    
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2);
      console.log("Creating new session ID:", sessionId);
      
      // Set cookie (this should work in the browser)
      const response = NextResponse.json({ 
        success: true, 
        message: "Testing cart functionality",
        sessionId 
      });
      
      response.cookies.set("cart_session_id", sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
      
      return response;
    }
    
    console.log("Using existing session ID:", sessionId);
    
    // Test cart creation
    const cart = await cartService.getOrCreateCart(undefined, sessionId);
    console.log("Cart created/retrieved:", cart);
    
    // Test adding item
    const result = await cartService.addToCart(cart.id, productId, quantity);
    console.log("Item added to cart:", result);
    
    // Test getting cart with items
    const cartWithItems = await cartService.getCartWithItems(cart.id);
    console.log("Cart with items:", cartWithItems);
    
    return NextResponse.json({
      success: true,
      message: "Item added to cart successfully",
      data: {
        cart,
        cartItem: result,
        cartWithItems
      }
    });
    
  } catch (error) {
    console.error("Cart test error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to add item to cart", 
        error: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}