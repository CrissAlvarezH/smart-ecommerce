"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Minus, Package, Loader2 } from "lucide-react";
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
import { removeProductFromCollectionAction, getCollectionProductsAction } from "@/app/admin/collections/actions";
import { SearchHighlight } from "@/components/admin/search-highlight";
import { useEffect, useState } from "react";
import { ClientPagination } from "@/components/client-pagination";
import { AddProductDialog } from "./add-product-dialog";
import { Collection, Product, PRODUCTS_PER_PAGE } from "../../interfaces";

export interface CollectionProductsListProps {
    collection: Collection;
}

export function CollectionProductsList({
  collection,
}: CollectionProductsListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const { result, isExecuting, execute: fetchProducts } = useAction(getCollectionProductsAction);

  useEffect(() => {
    fetchProducts({
      collectionId: collection.id,
      search: searchTerm,
      limit: PRODUCTS_PER_PAGE,
      offset: (page - 1) * PRODUCTS_PER_PAGE
    });
  }, [collection.id, searchTerm, page, fetchProducts]);

  // Reset to page 1 when search term changes
  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const data = result?.data;
  const products = data?.data || [];
  const totalCount = data?.total || 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Products in Collection
          </CardTitle>
          <AddProductDialog
            collection={collection}
            onProductAdded={() => {
              fetchProducts({
                collectionId: collection.id,
                search: searchTerm,
                limit: PRODUCTS_PER_PAGE,
                offset: (page - 1) * PRODUCTS_PER_PAGE
              });
            }}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search products in collection..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {products.length === 0 && !isExecuting && (
          <div className="text-center py-8 text-gray-500">
            <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            {searchTerm ? (
              <p>No products found matching &quot;{searchTerm}&quot;.</p>
            ) : (
              <>
                <p>No products in this collection yet.</p>
                <p className="text-sm mt-2">Use the &quot;Add Product&quot; button above to add products.</p>
              </>
            )}
          </div>
        )}

        {isExecuting && products.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Loader2 className="mx-auto h-12 w-12 text-gray-300 mb-4 animate-spin" />
            <p>Loading products...</p>
          </div>
        ) : (
          <>
            <ProductList
              collection={collection}
              searchTerm={searchTerm}
              products={products}
              onRemove={() => {
                fetchProducts({
                  collectionId: collection.id,
                  search: searchTerm,
                  limit: PRODUCTS_PER_PAGE,
                  offset: (page - 1) * PRODUCTS_PER_PAGE
                });
              }}
            />

            <ClientPagination
              currentPage={page}
              totalItems={totalCount}
              itemsPerPage={PRODUCTS_PER_PAGE}
              onPageChange={handlePageChange}
              isLoading={isExecuting}
            />

            {totalCount > 0 && (
              <div className="text-sm text-gray-500 text-center mt-2">
                Showing {((page - 1) * PRODUCTS_PER_PAGE) + 1} to {Math.min(page * PRODUCTS_PER_PAGE, totalCount)} of {totalCount} products
              </div>
            )}
          </>
        )}

      </CardContent>
    </Card>
  );
}


function ProductList({
  collection, searchTerm, onRemove, products
}: {
  collection: Collection, searchTerm: string, onRemove: () => void, products: Product[]
}) {
  const { execute: removeProduct, isExecuting: isRemoving } = useAction(removeProductFromCollectionAction, {
    onSuccess: () => {
      toast({
        title: "Product removed",
        description: "The product has been successfully removed from the collection.",
      });
      onRemove();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.error?.serverError || "Failed to remove product from collection",
        variant: "destructive",
      });
    },
  });

  const handleRemoveProduct = (productId: string) => {
    removeProduct({ collectionId: collection.id, productId });
  };

  return (
    <>
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
                  <DialogTitle>Remove Product from Collection</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to remove &ldquo;{product.name}&rdquo; from &ldquo;{collection.name}&rdquo;?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button
                    onClick={() => handleRemoveProduct(product.id)}
                    className="bg-red-600 hover:bg-red-700"
                    disabled={isRemoving}
                  >
                    {isRemoving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Remove
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        ))}
      </div>
    </>
  )
}