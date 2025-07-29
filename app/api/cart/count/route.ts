import { NextRequest, NextResponse } from "next/server";
import { cartService } from "@/services/cart";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    console.log("🔢 Cart count API called");
    
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("cart_session_id")?.value;
    
    if (!sessionId) {
      console.log("📭 No cart session found");
      return NextResponse.json({ count: 0 });
    }

    console.log("🔍 Finding cart for session:", sessionId);
    const cart = await cartService.getCartBySession(sessionId);
    
    if (!cart) {
      console.log("📭 No cart found for session");
      return NextResponse.json({ count: 0 });
    }

    console.log("🔢 Getting cart item count for cart:", cart.id);
    const count = await cartService.getCartItemCount(cart.id);
    console.log("✅ Cart count retrieved:", count);
    
    return NextResponse.json({ count });
  } catch (error) {
    console.error("❌ Error getting cart count:", error);
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}