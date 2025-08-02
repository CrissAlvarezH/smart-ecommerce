"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Percent, Package, Minus, Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getDiscountProductsAction, removeProductFromDiscountAction } from "../actions";
import { AddProductToDiscountDialog } from "./products/add-product-dialog";

interface Discount {
  id: string;
  name: string;
  percentage: string;
  endDate: Date;
  storeId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  price: string;
  sku: string | null;
  isActive: boolean;
}

interface DiscountProductsSectionProps {
  discount: Discount;
  storeId: string;
}

export function DiscountProductsSection({
  discount,
  storeId,
}: DiscountProductsSectionProps) {
  const [products, setProducts] = useState<Product[]>([]);
  
  const { result, isExecuting, execute: fetchProducts } = useAction(getDiscountProductsAction, {
    onSuccess: (result) => {
      setProducts(result.data || []);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to load discount products.",
        variant: "destructive",
      });
    },
  });

  const { execute: removeProduct, isExecuting: isRemoving } = useAction(
    removeProductFromDiscountAction,
    {
      onSuccess: () => {
        toast({
          title: "Product removed",
          description: "Product has been removed from the discount.",
        });
        refetchProducts();
      },
      onError: (error) => {
        toast({
          title: "Error removing product",
          description: error.error.serverError || "Failed to remove product from discount.",
          variant: "destructive",
        });
      },
    }
  );

  const refetchProducts = () => {
    fetchProducts({ discountId: discount.id });
  };

  useEffect(() => {
    refetchProducts();
  }, [discount.id, fetchProducts]);

  const handleRemoveProduct = (productId: string) => {
    removeProduct({
      discountId: discount.id,
      productId,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Percent className="h-5 w-5" />
              Assigned Products ({products.length})
            </CardTitle>
            <CardDescription>
              Products that have this discount applied
            </CardDescription>
          </div>
          <AddProductToDiscountDialog
            discount={discount}
            storeId={storeId}
            onProductAdded={refetchProducts}
          />
        </div>
      </CardHeader>
      <CardContent>
        {isExecuting ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-500">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No products assigned</h3>
            <p className="text-muted-foreground mb-4">
              This discount is not yet applied to any products.
            </p>
            <AddProductToDiscountDialog
              discount={discount}
              storeId={storeId}
              onProductAdded={refetchProducts}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 truncate">
                        {product.name}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        ${product.price}
                        {product.sku && ` • SKU: ${product.sku}`}
                      </p>
                    </div>
                    <Badge variant={product.isActive ? "default" : "secondary"}>
                      {product.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isRemoving}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Remove Product from Discount</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to remove &quot;{product.name}&quot; from the discount &quot;{discount.name}&quot;? 
                          This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <DialogClose asChild>
                          <Button
                            variant="destructive"
                            onClick={() => handleRemoveProduct(product.id)}
                            disabled={isRemoving}
                          >
                            Remove Product
                          </Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}