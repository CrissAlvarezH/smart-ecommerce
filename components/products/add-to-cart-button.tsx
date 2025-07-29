"use client";

import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { addToCartAction } from "@/app/cart/actions";
import { useAction } from "next-safe-action/hooks";
import { toast } from "@/hooks/use-toast";

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
  const { execute: addToCart, isExecuting } = useAction(addToCartAction, {
    onSuccess: (result) => {
      console.log("Add to cart success:", result);
      toast({
        title: "Added to cart",
        description: `${productName} has been added to your cart.`,
      });
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

  const handleAddToCart = () => {
    console.log("Add to cart button clicked:", { productId, quantity: 1 });
    addToCart({ productId, quantity: 1 });
  };

  const buttonText = () => {
    if (isExecuting) return 'Adding...';
    if (!inStock) return 'Out of Stock';
    return size === 'sm' ? 'Add' : 'Add to Cart';
  };

  return (
    <Button 
      size={size}
      className={className}
      disabled={!inStock || isExecuting}
      onClick={handleAddToCart}
    >
      <ShoppingCart className={size === 'sm' ? "h-4 w-4 mr-2" : "h-5 w-5 mr-2"} />
      {buttonText()}
    </Button>
  );
}