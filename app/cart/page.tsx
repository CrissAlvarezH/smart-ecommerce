import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { cookies } from "next/headers";
import { cartService } from "@/services/cart";
import { CartPageClient } from "./cart-client";

export default async function CartPage() {
  // Get cart data from database
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("cart_session_id")?.value;
  
  let cartItems: any[] = [];
  
  if (sessionId) {
    try {
      const cart = await cartService.getOrCreateCart(undefined, sessionId);
      cartItems = await cartService.getCartWithItems(cart.id);
    } catch (error) {
      console.error("Error fetching cart:", error);
      cartItems = [];
    }
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <ShoppingBag className="mx-auto h-24 w-24 text-gray-300 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
          <p className="text-gray-600 mb-8">Looks like you haven&apos;t added anything to your cart yet.</p>
          <Link href="/products">
            <Button size="lg">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return <CartPageClient initialCartItems={cartItems} />;
}