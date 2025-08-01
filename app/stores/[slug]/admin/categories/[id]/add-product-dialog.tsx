"use client";

import { useEffect, useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { getAvailableProductsForCategoryAction, assignProductToCategoryAction } from "../actions";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Package, Search, Plus, Loader2, ShoppingBag } from "lucide-react";
import { ClientPagination } from "@/components/client-pagination";
import { SearchHighlight } from "@/components/admin/search-highlight";
import { Badge } from "@/components/ui/badge";

const PRODUCTS_PER_PAGE = 10;

interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  price: string;
  compareAtPrice: string | null;
  sku: string | null;
  inventory: number;
  categoryId: string | null;
  categoryName: string | null;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
  firstImageUrl: string | null;
}

interface Category {
  id: string;
  name: string;
  storeId: string;
}

export function AddProductDialog({ category, onProductAdded }: { category: Category, onProductAdded: () => void }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false);

  // Action to fetch available products
  const { result, isExecuting: isLoading, execute: fetchAvailableProducts } = useAction(getAvailableProductsForCategoryAction, {
    onError: (error) => {
      console.error("Error fetching available products:", error);
      toast({
        title: "Error",
        description: error.error?.serverError || "Failed to load available products",
        variant: "destructive",
      });
    },
  });

  // Reset to page 1 when search term changes
  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  // Fetch products when dialog opens and when category, search, or page changes
  useEffect(() => {
    if (isOpen) {
      fetchAvailableProducts({
        categoryId: category.id,
        storeId: category.storeId,
        search: searchTerm,
        limit: PRODUCTS_PER_PAGE,
        offset: (page - 1) * PRODUCTS_PER_PAGE
      });
    }
  }, [category.id, searchTerm, page, isOpen, fetchAvailableProducts]);

  const products = result?.data?.data || [];
  const totalCount = result?.data?.total || 0;
  const totalPages = Math.ceil(totalCount / PRODUCTS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleDialogClose = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSearchTerm("");
      setPage(1);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Products
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Products to &quot;{category.name}&quot;</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Products List */}
          <div className="min-h-96">
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">
                <Loader2 className="mx-auto h-12 w-12 text-gray-300 mb-4 animate-spin" />
                <p>Loading available products...</p>
              </div>
            ) : products.length === 0 && !isLoading ? (
              <div className="text-center py-8 text-gray-500">
                <ShoppingBag className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                {searchTerm ? (
                  <p>No products found matching &quot;{searchTerm}&quot;.</p>
                ) : (
                  <p>All products are already in this category.</p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {products.map((product) => (
                  <AvailableProductDialogItem
                    key={product.id}
                    product={product}
                    category={category}
                    searchTerm={searchTerm}
                    onProductAdded={() => {
                      fetchAvailableProducts({
                        categoryId: category.id,
                        search: searchTerm,
                        limit: PRODUCTS_PER_PAGE,
                        offset: (page - 1) * PRODUCTS_PER_PAGE
                      });
                      onProductAdded();
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {products.length > 0 && (
            <>
              <ClientPagination
                currentPage={page}
                totalItems={totalCount}
                itemsPerPage={PRODUCTS_PER_PAGE}
                onPageChange={handlePageChange}
                isLoading={isLoading}
              />
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AvailableProductDialogItem({
  product, category, searchTerm, onProductAdded
}: {
  product: Product, category: Category, searchTerm: string, onProductAdded: () => void
}) {
  const { execute: assignProduct, isExecuting: isAssigning } = useAction(assignProductToCategoryAction, {
    onSuccess: () => {
      toast({
        title: "Product assigned",
        description: "The product has been successfully assigned to the category.",
      });
      onProductAdded();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.error?.serverError || "Failed to assign product to category",
        variant: "destructive",
      });
    },
  });

  const handleAssignProduct = (productId: string) => {
    assignProduct({ categoryId: category.id, productId });
  };

  return (
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
          Stock: {product.inventory} | Current Category: {product.categoryName || "No category"}
        </p>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => handleAssignProduct(product.id)}
        disabled={isAssigning}
        className="text-green-600 hover:text-green-700"
      >
        {isAssigning ? <Loader2 className="h-4 w-4 animate-spin" /> : (
          <Plus className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}