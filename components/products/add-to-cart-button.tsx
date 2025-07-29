"use client";

import { Button } from "@/components/ui/button";
import { ShoppingCart, Eye } from "lucide-react";
import { addToCartAction, checkCartStatusAction } from "@/app/cart/actions";
import { useAction } from "next-safe-action/hooks";
import { toast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AddToCartButtonProps {
  productId: string;
  productName: string;
  inStock: boolean;
  size?: "sm" | "lg";
  className?: string;
}

export function AddToCartButton({ 
  productId, 
  productName, 
  inStock, 
  size = "lg",
  className = ""
}: AddToCartButtonProps) {
  const router = useRouter();
  const [isInCart, setIsInCart] = useState(false);
  const [cartItem, setCartItem] = useState<{ id: string; quantity: number } | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  const { execute: addToCart, isExecuting: isAdding } = useAction(addToCartAction, {
    onSuccess: (result) => {
      console.log("Add to cart success:", result);
      setIsInCart(true);
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
    setIsCheckingStatus(true);
    checkStatus({ productId });
  };

  useEffect(() => {
    checkCartStatus();
  }, [productId]);

  const handleAddToCart = () => {
    console.log("Add to cart button clicked:", { productId, quantity: 1 });
    addToCart({ productId, quantity: 1 });
  };

  const handleSeeInCart = () => {
    console.log("See in cart button clicked:", { productId });
    router.push('/cart');
  };

  const buttonText = () => {
    if (isCheckingStatus) return 'Loading...';
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

  const isLoading = isCheckingStatus || isAdding;

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