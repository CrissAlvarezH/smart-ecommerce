"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/hooks/use-cart";

interface CartButtonProps {
  itemCount?: number;
}

export function CartButton({ itemCount }: CartButtonProps) {
  const { cartCount, isLoading } = useCart();

  // Use provided itemCount if available, otherwise use fetched cartCount
  const displayCount = itemCount !== undefined ? itemCount : cartCount;

  if (isLoading && itemCount === undefined) {
    return (
      <Skeleton className="h-9 w-16" />
    );
  }

  return (
    <Link href="/cart">
      <Button
        variant="outline"
        size="sm"
        className="relative flex items-center gap-2"
      >
        <ShoppingCart className="h-4 w-4" />
        <span className="hidden sm:inline">Cart</span>
        {displayCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {displayCount > 99 ? "99+" : displayCount}
          </Badge>
        )}
      </Button>
    </Link>
  );
}