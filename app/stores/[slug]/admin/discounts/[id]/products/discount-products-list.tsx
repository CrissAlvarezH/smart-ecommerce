"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Minus, Package, Percent } from "lucide-react";
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
import { removeProductFromDiscountAction, getDiscountProductsAction } from "../../actions";
import { useEffect, useState } from "react";
import { AddProductToDiscountDialog } from "./add-product-dialog";

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

export interface DiscountProductsListProps {
  discount: Discount;
  storeSlug: string;
  storeId: string;
}

export function DiscountProductsList({
  discount,
  storeSlug,
  storeId,
}: DiscountProductsListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const { result, isExecuting, execute: fetchProducts } = useAction(getDiscountProductsAction);

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

  useEffect(() => {
    if (result?.data) {
      setProducts(result.data);
    }
  }, [result]);

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
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5" />
            Products with Discount ({products.length})
          </CardTitle>
          <AddProductToDiscountDialog
            discount={discount}
            storeId={storeId}
            onProductAdded={refetchProducts}
          />
        </div>
      </CardHeader>
      <CardContent>
        {products.length === 0 && !isExecuting && (
          <div className="text-center py-8 text-gray-500">
            <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p className="text-lg font-medium mb-2">No products assigned</p>
            <p className="text-sm">This discount is not applied to any products yet.</p>
          </div>
        )}

        {isExecuting && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Loading products...</p>
          </div>
        )}

        {products.length > 0 && (
          <div className="space-y-3">
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