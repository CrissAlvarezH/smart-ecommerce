"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CartItem } from "@/components/cart/cart-item";
import { ArrowLeft } from "lucide-react";
import { updateCartItemAction, removeFromCartAction, clearCartAction } from "./actions";
import { useAction } from "next-safe-action/hooks";
import { toast } from "@/hooks/use-toast";
import { useState, useOptimistic } from "react";

interface CartItemType {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    price: string;
    inventory: number;
    image?: {
      url: string;
      altText?: string;
    };
  };
}

interface CartPageClientProps {
  initialCartItems: CartItemType[];
}

type OptimisticAction = 
  | { type: 'update'; itemId: string; quantity: number }
  | { type: 'remove'; itemId: string }
  | { type: 'clear' };

export function CartPageClient({ initialCartItems }: CartPageClientProps) {
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
      toast({
        title: "Cart updated",
        description: "Item quantity has been updated.",
      });
    },
    onError: (error) => {
      console.error("Update quantity error:", error);
      toast({
        title: "Error",
        description: error.error?.serverError || "Failed to update quantity",
        variant: "destructive",
      });
    },
  });

  const { execute: removeItem, isExecuting: isRemoving } = useAction(removeFromCartAction, {
    onSuccess: () => {
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart.",
      });
    },
    onError: (error) => {
      console.error("Remove item error:", error);
      toast({
        title: "Error",
        description: error.error?.serverError || "Failed to remove item",
        variant: "destructive",
      });
    },
  });

  const { execute: clearCart, isExecuting: isClearing } = useAction(clearCartAction, {
    onSuccess: () => {
      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart.",
      });
    },
    onError: (error) => {
      console.error("Clear cart error:", error);
      toast({
        title: "Error",
        description: error.error?.serverError || "Failed to clear cart",
        variant: "destructive",
      });
    },
  });

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    console.log("🔄 Updating quantity:", { itemId, quantity });
    setOptimisticCartItems({ type: 'update', itemId, quantity });
    updateQuantity({ cartItemId: itemId, quantity });
  };

  const handleRemoveItem = async (itemId: string) => {
    console.log("🗑️ Removing item:", itemId);
    setOptimisticCartItems({ type: 'remove', itemId });
    removeItem({ cartItemId: itemId });
  };

  const handleClearCart = async () => {
    console.log("🧹 Clearing cart");
    setOptimisticCartItems({ type: 'clear' });
    clearCart();
  };

  const subtotal = cartItems.reduce((total, item) => {
    return total + (parseFloat(item.product.price) * item.quantity);
  }, 0);

  const shipping = 10.00; // Fixed shipping cost
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  const isLoading = isUpdating || isRemoving || isClearing;

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/products" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6">
        <ArrowLeft className="h-4 w-4" />
        Continue Shopping
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
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
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal ({cartItems.length} items)</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              
              <hr />
              
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>

              <Button size="lg" className="w-full mt-6" disabled={isLoading}>
                Proceed to Checkout
              </Button>

              <div className="text-sm text-gray-500 text-center mt-4">
                Free shipping on orders over $50
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}