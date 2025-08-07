"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CartItem } from "@/components/cart/cart-item";
import { ShippingSelector } from "@/components/cart/shipping-selector";
import { RecommendedProducts } from "@/components/cart/recommended-products";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { updateCartItemAction, removeFromCartAction, clearCartAction } from "./actions";
import { useAction } from "next-safe-action/hooks";
import { toast } from "@/hooks/use-toast";
import { useState, useOptimistic, startTransition } from "react";
import { useStoreCart } from "@/hooks/use-store-cart";
import { formatPrice } from "@/lib/format-price";

interface CartItemType {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    price: string;
    compareAtPrice?: string;
    inventory: number;
    image?: {
      url: string;
      altText?: string;
    };
  };
}

interface StoreCartPageClientProps {
  initialCartItems: CartItemType[];
  store: {
    id: string;
    name: string;
    slug: string;
  };
}

type OptimisticAction = 
  | { type: 'update'; itemId: string; quantity: number }
  | { type: 'remove'; itemId: string }
  | { type: 'clear' };

export function StoreCartPageClient({ initialCartItems, store }: StoreCartPageClientProps) {
  const { refreshCartCount, updateCartCount } = useStoreCart(store.slug);
  const [shippingCost, setShippingCost] = useState<string>("0.00");
  const [cartItems, setOptimisticCartItems] = useOptimistic(
    initialCartItems,
    (state: CartItemType[], action: OptimisticAction) => {
      switch (action.type) {
        case 'update':
          if (action.quantity === 0) {
            return state.filter(item => item.id !== action.itemId);
          }
          return state.map(item =>
            item.id === action.itemId 
              ? { ...item, quantity: action.quantity }
              : item
          );
        case 'remove':
          return state.filter(item => item.id !== action.itemId);
        case 'clear':
          return [];
        default:
          return state;
      }
    }
  );

  const { execute: updateQuantity, isExecuting: isUpdating } = useAction(updateCartItemAction, {
    onSuccess: () => {
      refreshCartCount();
      toast({
        title: "Cart updated",
        description: "Item quantity has been updated.",
      });
    },
    onError: (result) => {
      console.error("Update quantity error:", result);
      const errorMessage = result.serverError || result.validationErrors || "Failed to update quantity";
      toast({
        title: "Error",
        description: typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage),
        variant: "destructive",
      });
    },
  });

  const { execute: removeItem, isExecuting: isRemoving } = useAction(removeFromCartAction, {
    onSuccess: () => {
      refreshCartCount();
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart.",
      });
    },
    onError: (result) => {
      console.error("Remove item error:", result);
      const errorMessage = result.serverError || result.validationErrors || "Failed to remove item";
      toast({
        title: "Error",
        description: typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage),
        variant: "destructive",
      });
    },
  });

  const { execute: clearCart, isExecuting: isClearing } = useAction(clearCartAction, {
    onSuccess: () => {
      refreshCartCount();
      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart.",
      });
    },
    onError: (result) => {
      console.error("Clear cart error:", result);
      const errorMessage = result.serverError || result.validationErrors || "Failed to clear cart";
      toast({
        title: "Error",
        description: typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage),
        variant: "destructive",
      });
    },
  });

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    console.log("🔄 Updating quantity:", { itemId, quantity });
    
    const currentItem = cartItems.find(item => item.id === itemId);
    if (currentItem) {
      const quantityDiff = quantity - currentItem.quantity;
      
      if (quantityDiff !== 0) {
        const newCount = Math.max(0, cartItems.reduce((total, item) => 
          total + (item.id === itemId ? quantity : item.quantity), 0
        ));
        updateCartCount(newCount);
      }
    }
    
    startTransition(() => {
      setOptimisticCartItems({ type: 'update', itemId, quantity });
    });
    updateQuantity({ cartItemId: itemId, quantity, storeSlug: store.slug });
  };

  const handleRemoveItem = async (itemId: string) => {
    console.log("🗑️ Removing item:", itemId);
    
    const newCount = cartItems.reduce((total, item) => 
      total + (item.id === itemId ? 0 : item.quantity), 0
    );
    updateCartCount(newCount);
    
    startTransition(() => {
      setOptimisticCartItems({ type: 'remove', itemId });
    });
    removeItem({ cartItemId: itemId, storeSlug: store.slug });
  };

  const handleClearCart = async () => {
    console.log("🧹 Clearing cart");
    
    updateCartCount(0);
    
    startTransition(() => {
      setOptimisticCartItems({ type: 'clear' });
    });
    clearCart({ storeSlug: store.slug });
  };

  const subtotal = cartItems.reduce((total, item) => {
    return total + (parseFloat(item.product.price) * item.quantity);
  }, 0);

  const shipping = parseFloat(shippingCost);
  const total = subtotal + shipping; // IVA already included in Colombian prices

  const isLoading = isUpdating || isRemoving || isClearing;

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <ShoppingBag className="mx-auto h-24 w-24 text-gray-300 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
          <p className="text-gray-600 mb-8">Looks like you haven&apos;t added anything from {store.name} yet.</p>
          <Link href={`/stores/${store.slug}/client/products`}>
            <Button size="lg">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href={`/stores/${store.slug}/client/products`} className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6">
        <ArrowLeft className="h-4 w-4" />
        Continue Shopping
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{store.name} Shopping Cart</h1>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleClearCart}
              disabled={isLoading}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              {isClearing ? "Clearing..." : "Clear Cart"}
            </Button>
          </div>

          <div className="space-y-4">
            {cartItems.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemoveItem}
              />
            ))}
          </div>
          
          {/* Recommended Products */}
          <div className="mt-8">
            <RecommendedProducts
              storeId={store.id}
              storeSlug={store.slug}
              title="You may be interested in"
              limit={4}
            />
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          {/* Shipping Selector */}
          <ShippingSelector
            storeId={store.id}
            storeSlug={store.slug}
            onShippingUpdate={setShippingCost}
          />

          {/* Order Summary */}
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className={shipping > 0 ? "font-semibold" : ""}>
                  {shipping === 0 ? "To be calculated" : formatPrice(shipping)}
                </span>
              </div>
              
              <hr />
              
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
              
              <div className="text-xs text-gray-500 mt-2">
                * Prices include VAT (19%)
              </div>

              <Button size="lg" className="w-full mt-6" disabled={isLoading || shipping === 0}>
                {shipping === 0 ? "Select shipping method" : "Proceed to Checkout"}
              </Button>

              <div className="text-sm text-gray-500 text-center mt-4">
                Free shipping on orders over $150,000
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}