"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductCard } from "@/components/products/product-card";
import { useAction } from "next-safe-action/hooks";
import { getRecommendedProductsAction } from "@/app/stores/[slug]/client/cart/actions";
import { Loader2, ShoppingBag } from "lucide-react";

interface RecommendedProductsProps {
  storeId: string;
  storeSlug: string;
  title?: string;
  limit?: number;
}

export function RecommendedProducts({ 
  storeId, 
  storeSlug, 
  title = "You may be interested in", 
  limit = 4 
}: RecommendedProductsProps) {
  const [products, setProducts] = useState<any[]>([]);

  const { execute: getRecommendedProducts, isExecuting: isLoading } = useAction(getRecommendedProductsAction, {
    onSuccess: (result) => {
      setProducts(result.data?.products || []);
    },
    onError: (error) => {
      console.error("Failed to load recommended products:", error);
    }
  });

  useEffect(() => {
    getRecommendedProducts({ storeId, limit });
  }, [storeId, limit]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Loading recommendations...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              storeSlug={storeSlug}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}