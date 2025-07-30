"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, ShoppingBag, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "@/hooks/use-toast";
import { addProductToCollectionAction, getAvailableProductsAction } from "@/app/admin/collections/actions";
import { SearchHighlight } from "@/components/admin/search-highlight";
import { useEffect, useState, useMemo } from "react";

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
}

const PRODUCTS_PER_PAGE = 10;

// Client-side pagination component
function ClientPagination({ 
  currentPage, 
  totalItems, 
  itemsPerPage, 
  onPageChange,
  isLoading 
}: {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
}) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const showEllipsis = totalPages > 7;
    
    if (showEllipsis) {
      // Always show first page
      pages.push(1);
      
      // Show ellipsis if current page is far from start
      if (currentPage > 4) {
        pages.push('...');
      }
      
      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }
      
      // Show ellipsis if current page is far from end
      if (currentPage < totalPages - 3) {
        pages.push('...');
      }
      
      // Always show last page
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    } else {
      // Show all pages if there are 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-center space-x-2 mt-6">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1 || isLoading}
        className="flex items-center gap-1"
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </Button>
      
      <div className="flex items-center space-x-1">
        {pageNumbers.map((pageNum, index) => (
          pageNum === '...' ? (
            <span key={index} className="px-2 py-1 text-gray-500">...</span>
          ) : (
            <Button
              key={index}
              variant={currentPage === pageNum ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(pageNum as number)}
              disabled={isLoading}
              className="min-w-[40px]"
            >
              {pageNum}
            </Button>
          )
        ))}
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages || isLoading}
        className="flex items-center gap-1"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function AvailableProductsList({
  collection,
}: AvailableProductsListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  // Action to fetch available products
  const { result, isExecuting: isLoading, execute: fetchAvailableProducts } = useAction(getAvailableProductsAction, {
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

  // Fetch products on component mount and when collection, search, or page changes
  useEffect(() => {
    fetchAvailableProducts({ 
      collectionId: collection.id,
      search: searchTerm,
      limit: PRODUCTS_PER_PAGE,
      offset: (page - 1) * PRODUCTS_PER_PAGE
    });
  }, [collection.id, searchTerm, page, fetchAvailableProducts]);

  const { execute: addProduct, isExecuting: isAdding } = useAction(addProductToCollectionAction, {
    onSuccess: () => {
      toast({
        title: "Product added",
        description: "The product has been successfully added to the collection.",
      });
      // Refresh the available products list while maintaining current page
      fetchAvailableProducts({ 
        collectionId: collection.id,
        search: searchTerm,
        limit: PRODUCTS_PER_PAGE,
        offset: (page - 1) * PRODUCTS_PER_PAGE
      });
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

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const data = result?.data;
  const products = data?.data || [];
  const totalCount = data?.total || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          Available Products ({isLoading ? '...' : totalCount})
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search available products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            disabled={isLoading}
          />
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-gray-500">
            <Loader2 className="mx-auto h-12 w-12 text-gray-300 mb-4 animate-spin" />
            <p>Loading available products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <ShoppingBag className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            {searchTerm ? (
              <p>No products found matching "{searchTerm}".</p>
            ) : (
              <p>All products are already in this collection.</p>
            )}
          </div>
        ) : (
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

            <ClientPagination
              currentPage={page}
              totalItems={totalCount}
              itemsPerPage={PRODUCTS_PER_PAGE}
              onPageChange={handlePageChange}
              isLoading={isLoading}
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