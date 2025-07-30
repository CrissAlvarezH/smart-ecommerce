import { useEffect, useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { addProductToCollectionAction, getAvailableProductsAction } from "../../actions";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Package, Search } from "lucide-react";
import { Plus } from "lucide-react";
import { Loader2 } from "lucide-react";
import { ClientPagination } from "@/components/client-pagination";
import { SearchHighlight } from "@/components/admin/search-highlight";
import { Badge } from "@/components/ui/badge";
import { Collection, Product, PRODUCTS_PER_PAGE } from "../../interfaces";


export function AddProductDialog({ collection, onProductAdded }: { collection: Collection, onProductAdded: () => void }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false);

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

  // Fetch products when dialog opens and when collection, search, or page changes
  useEffect(() => {
    if (isOpen) {
      fetchAvailableProducts({
        collectionId: collection.id,
        search: searchTerm,
        limit: PRODUCTS_PER_PAGE,
        offset: (page - 1) * PRODUCTS_PER_PAGE
      });
    }
  }, [collection.id, searchTerm, page, isOpen, fetchAvailableProducts]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Reset search and page when dialog opens
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setSearchTerm("");
      setPage(1);
    }
  };

  const data = result?.data;
  const products = data?.data || [];
  const totalCount = data?.total || 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Add Products to Collection ({totalCount} products)</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col space-y-4 overflow-hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search available products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex-1 overflow-y-auto min-h-[400px] max-h-[400px]">
            {isLoading && products.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Loader2 className="mx-auto h-12 w-12 text-gray-300 mb-4 animate-spin" />
                <p>Loading available products...</p>
              </div>
            ) : products.length === 0 && !isLoading ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                {searchTerm ? (
                  <p>No products found matching "{searchTerm}".</p>
                ) : (
                  <p>All products are already in this collection.</p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {products.map((product) => (
                  <AvailableProductDialogItem
                    key={product.id}
                    product={product}
                    collection={collection}
                    searchTerm={searchTerm}
                    page={page}
                    onProductAdded={() => {
                      fetchAvailableProducts({
                        collectionId: collection.id,
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
  product, collection, searchTerm, page, onProductAdded
}: {
  product: Product, collection: Collection, searchTerm: string, page: number, onProductAdded: () => void
}) {
  const { execute: addProduct, isExecuting: isAdding } = useAction(addProductToCollectionAction, {
    onSuccess: () => {
      toast({
        title: "Product added",
        description: "The product has been successfully added to the collection.",
      });
      // Notify parent to refresh collection products
      onProductAdded();
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
        {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : (
          <Plus className="h-4 w-4" />
        )}
      </Button>
    </div>
  )
}
