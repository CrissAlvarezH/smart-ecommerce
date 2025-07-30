"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, ShoppingBag } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "@/hooks/use-toast";
import { addProductToCollectionAction } from "@/app/admin/actions";
import { SearchHighlight } from "@/components/admin/search-highlight";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: string;
  inventory: number;
  isActive: boolean;
  categoryId: string | null;
  categoryName: string | null;
}

interface Collection {
  id: string;
  name: string;
}

interface AvailableProductsListProps {
  collection: Collection;
  products: Product[];
  searchTerm: string;
  onSearchChange: (search: string) => void;
}

export function AvailableProductsList({
  collection,
  products,
  searchTerm,
  onSearchChange,
}: AvailableProductsListProps) {
  const { execute: addProduct, isExecuting: isAdding } = useAction(addProductToCollectionAction, {
    onSuccess: () => {
      toast({
        title: "Product added",
        description: "The product has been successfully added to the collection.",
      });
      window.location.reload();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.error?.serverError || "Failed to add product to collection",
        variant: "destructive",
      });
    },
  });

  const handleAddProduct = (productId: string) => {
    addProduct({ collectionId: collection.id, productId });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          Available Products ({products.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search available products..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {products.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <ShoppingBag className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p>
              {searchTerm 
                ? "No products found matching your search." 
                : "All products are already in this collection."}
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">
                      <SearchHighlight text={product.name} searchTerm={searchTerm} />
                    </h4>
                    <Badge variant={product.isActive ? "default" : "secondary"} className="text-xs">
                      {product.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">${parseFloat(product.price).toFixed(2)}</p>
                  <p className="text-xs text-gray-500">
                    Stock: {product.inventory} | Category: {product.categoryName || "No category"}
                  </p>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleAddProduct(product.id)}
                  disabled={isAdding}
                  className="text-green-600 hover:text-green-700"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}