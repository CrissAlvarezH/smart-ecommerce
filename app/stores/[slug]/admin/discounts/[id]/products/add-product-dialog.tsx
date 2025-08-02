"use client";

import { useEffect, useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { getAvailableProductsForDiscountAction, addProductToDiscountAction } from "../../actions";
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

export function AddProductToDiscountDialog({ 
  discount, 
  storeId,
  onProductAdded 
}: { 
  discount: Discount;
  storeId: string;
  onProductAdded: () => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false);

  // Action to fetch available products
  const { result, isExecuting: isLoading, execute: fetchAvailableProducts } = useAction(getAvailableProductsForDiscountAction, {
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

  // Fetch products when dialog opens and when discount, search, or page changes
  useEffect(() => {
    if (isOpen) {
      fetchAvailableProducts({
        discountId: discount.id,
        storeId: storeId,
        search: searchTerm,
        limit: PRODUCTS_PER_PAGE,
      });
    }
  }, [discount.id, searchTerm, page, isOpen, fetchAvailableProducts, storeId]);

  const products = result?.data || [];
  const totalCount = products.length;
  const totalPages = Math.ceil(totalCount / PRODUCTS_PER_PAGE);

  // Paginate products client-side since we're getting all available products
  const startIndex = (page - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  const paginatedProducts = products.slice(startIndex, endIndex);

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
          <DialogTitle>Add Products to &quot;{discount.name}&quot;</DialogTitle>
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
            ) : paginatedProducts.length === 0 && !isLoading ? (
              <div className="text-center py-8 text-gray-500">
                <ShoppingBag className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                {searchTerm ? (
                  <p>No products found matching &quot;{searchTerm}&quot;.</p>
                ) : (
                  <p>All products are already assigned to this discount.</p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {paginatedProducts.map((product) => (
                  <AvailableProductDialogItem
                    key={product.id}
                    product={product}
                    discount={discount}
                    searchTerm={searchTerm}
                    onProductAdded={() => {
                      fetchAvailableProducts({
                        discountId: discount.id,
                        storeId: storeId,
                        search: searchTerm,
                        limit: PRODUCTS_PER_PAGE,
                      });
                      onProductAdded();
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {paginatedProducts.length > 0 && totalPages > 1 && (
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
  product, discount, searchTerm, onProductAdded
}: {
  product: Product, discount: Discount, searchTerm: string, onProductAdded: () => void
}) {
  const { execute: addProduct, isExecuting: isAdding } = useAction(addProductToDiscountAction, {
    onSuccess: () => {
      toast({
        title: "Product added",
        description: "The product has been successfully added to the discount.",
      });
      onProductAdded();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.error?.serverError || "Failed to add product to discount",
        variant: "destructive",
      });
    },
  });

  const handleAddProduct = (productId: string) => {
    addProduct({ discountId: discount.id, productId });
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
          Stock: {product.inventory} | Category: {product.categoryName || "No category"}
          {product.sku && ` | SKU: ${product.sku}`}
        </p>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => handleAddProduct(product.id)}
        disabled={isAdding}
        className="text-green-600 hover:text-green-700"
      >
        {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : (
          <Plus className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}