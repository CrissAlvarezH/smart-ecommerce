import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getStoreBySlugAction, getStoreCartItemsAction } from "../../actions";
import { getCartWithShippingAction } from "./actions";
import { StoreCartPageClient } from "./cart-client";

interface StoreCartPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function StoreCartPage({ params }: StoreCartPageProps) {
  const { slug } = await params;
  
  // Get store info
  const storeResult = await getStoreBySlugAction({ slug });
  if (!storeResult.data) {
    notFound();
  }
  
  const store = storeResult.data.store;
  if (!store) {
    notFound();
  }

  // Get cart data from database
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(`cart_session_${slug}`)?.value;
  
  let cartItems: any[] = [];
  let initialShippingCost = "0.00";
  
  if (sessionId) {
    try {
      // Get cart items
      const result = await getStoreCartItemsAction({ storeSlug: slug, sessionId });
      if (result.data) {
        cartItems = result.data.cartItems || [];
      }
      
      // Get existing shipping information
      const shippingResult = await getCartWithShippingAction({ storeSlug: slug });
      if (shippingResult.data?.cart?.shippingCost) {
        initialShippingCost = shippingResult.data.cart.shippingCost;
      }
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
          <p className="text-gray-600 mb-8">Looks like you haven&apos;t added anything from {store.name} yet.</p>
          <Link href={`/stores/${slug}/client/products`}>
            <Button size="lg">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return <StoreCartPageClient initialCartItems={cartItems} store={store} initialShippingCost={initialShippingCost} />;
}