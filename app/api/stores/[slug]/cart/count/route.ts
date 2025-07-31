import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { cartService } from "@/services/cart";
import { storeService } from "@/services/stores";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(`cart_session_${slug}`)?.value;
    
    if (!sessionId) {
      return NextResponse.json({ count: 0 });
    }

    // Verify store exists
    const store = await storeService.getStoreBySlug(slug);
    if (!store) {
      return NextResponse.json({ count: 0 });
    }

    // TODO: Update cart service to be store-aware
    const cart = await cartService.getOrCreateCart(undefined, sessionId);
    const items = await cartService.getCartWithItems(cart.id);
    
    // Calculate total count
    const count = items.reduce((total, item) => total + item.quantity, 0);
    
    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error fetching store cart count:', error);
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}