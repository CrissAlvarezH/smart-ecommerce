"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, Eye } from "lucide-react";
import { addToCartAction, checkCartStatusAction } from "@/app/stores/[slug]/products/actions";
import { useAction } from "next-safe-action/hooks";
import { toast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/use-cart";
import { useStoreCart } from "@/hooks/use-store-cart";

interface AddToCartButtonProps {
  productId: string;
  productName: string;
  inStock: boolean;
  size?: "sm" | "lg";
  className?: string;
  storeSlug?: string;
}

export function AddToCartButton({ 
  productId, 
  productName, 
  inStock, 
  size = "lg",
  className = "",
  storeSlug
}: AddToCartButtonProps) {
  const router = useRouter();
  const globalCart = useCart();
  const storeCart = useStoreCart(storeSlug || "");
  const { incrementCartCount } = storeSlug ? storeCart : globalCart;
  const [isInCart, setIsInCart] = useState(false);
  const [cartItem, setCartItem] = useState<{ id: string; quantity: number } | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  const { execute: addToCart, isExecuting: isAdding } = useAction(addToCartAction, {
    onSuccess: (result) => {
      console.log("Add to cart success:", result);
      setIsInCart(true);
      // Update global cart count immediately
      incrementCartCount(1);
      toast({
        title: "Added to cart",
        description: `${productName} has been added to your cart.`,
      });
      // Refresh cart status after adding
      checkCartStatus();
    },
    onError: (error) => {
      console.error("Add to cart error:", error);
      toast({
        title: "Error",
        description: error.error?.serverError || "Failed to add item to cart",
        variant: "destructive",
      });
    },
  });

  const { execute: checkStatus } = useAction(checkCartStatusAction, {
    onSuccess: (result) => {
      console.log("Cart status check success:", result);
      setIsInCart(result?.data?.inCart || false);
      setCartItem(result?.data?.cartItem || null);
      setIsCheckingStatus(false);
    },
    onError: (error) => {
      console.error("Cart status check error:", error);
      setIsInCart(false);
      setCartItem(null);
      setIsCheckingStatus(false);
    },
  });

  const checkCartStatus = () => {
    if (storeSlug) {
      setIsCheckingStatus(true);
      checkStatus({ productId, storeSlug });
    } else {
      setIsCheckingStatus(false);
    }
  };

  useEffect(() => {
    checkCartStatus();
  }, [productId, storeSlug]);

  const handleAddToCart = () => {
    console.log("Add to cart button clicked:", { productId, quantity: 1, storeSlug });
    if (storeSlug) {
      addToCart({ productId, quantity: 1, storeSlug });
    } else {
      toast({
        title: "Error",
        description: "Store information is missing",
        variant: "destructive",
      });
    }
  };

  const handleSeeInCart = () => {
    console.log("See in cart button clicked:", { productId });
    router.push(storeSlug ? `/stores/${storeSlug}/cart` : '/cart');
  };

  const buttonText = () => {
    if (isAdding) return 'Adding...';
    if (!inStock) return 'Out of Stock';
    if (isInCart) {
      return size === 'sm' ? 'In Cart' : `In Cart (${cartItem?.quantity || 1})`;
    }
    return size === 'sm' ? 'Add' : 'Add to Cart';
  };

  const getIcon = () => {
    if (isInCart) {
      return <Eye className={size === 'sm' ? "h-4 w-4 mr-2" : "h-5 w-5 mr-2"} />;
    }
    return <ShoppingCart className={size === 'sm' ? "h-4 w-4 mr-2" : "h-5 w-5 mr-2"} />;
  };

  // Show skeleton while checking cart status
  if (isCheckingStatus) {
    return (
      <Skeleton 
        className={`${size === 'sm' ? 'h-9 w-16' : 'h-10 w-28'} ${className}`} 
      />
    );
  }

  const isLoading = isAdding;

  return (
    <Button 
      size={size}
      className={className}
      disabled={!inStock || isLoading}
      onClick={isInCart ? handleSeeInCart : handleAddToCart}
      variant={isInCart ? "secondary" : "default"}
    >
      {getIcon()}
      {buttonText()}
    </Button>
  );
}