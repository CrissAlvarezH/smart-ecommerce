"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Package } from "lucide-react";
import Link from "next/link";
import { useAction } from "next-safe-action/hooks";
import { deleteProductAction } from "@/app/admin/products/actions";
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
import { SearchHighlight } from "@/components/admin/search-highlight";

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

interface ProductsClientProps {
  products: Product[];
  searchTerm?: string;
}

export function ProductsClient({ products, searchTerm }: ProductsClientProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { execute: deleteProduct, isExecuting: isDeleting } = useAction(deleteProductAction, {
    onSuccess: () => {
      toast({
        title: "Product deleted",
        description: "The product has been successfully deleted.",
      });
      setDeletingId(null);
    },
    onError: ({ error }) => {
      toast({
        title: "Error",
        description: error.serverError || "Failed to delete product",
        variant: "destructive",
      });
      setDeletingId(null);
    },
  });

  const handleDelete = (productId: string) => {
    setDeletingId(productId);
    deleteProduct({ id: productId });
  };

  return (
    <div className="space-y-4">
      {products.map((product) => (
        <div
          key={product.id}
          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
        >
          <div className="flex items-center gap-4">
            {/* Product Image */}
            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
              {product.firstImageUrl ? (
                <img
                  src={product.firstImageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Package className="h-6 w-6" />
                </div>
              )}
            </div>
            
            {/* Product Details */}
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold">
                  <Link 
                    href={`/admin/products/${product.id}`}
                    className="hover:text-blue-600 transition-colors"
                  >
                    <SearchHighlight text={product.name} searchTerm={searchTerm} />
                  </Link>
                </h3>
                <Badge variant={product.isActive ? "default" : "secondary"}>
                  {product.isActive ? "Active" : "Inactive"}
                </Badge>
                {product.isFeatured && (
                  <Badge variant="outline">Featured</Badge>
                )}
              </div>
              <p className="text-sm text-gray-600">
                ${parseFloat(product.price).toFixed(2)} • Stock: {product.inventory}
              </p>
              {product.categoryName && (
                <p className="text-sm text-gray-500">
                  Category: {product.categoryName}
                </p>
              )}
              {product.sku && (
                <p className="text-xs text-gray-400">
                  SKU: {product.sku}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Link href={`/admin/products/${product.id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={isDeleting && deletingId === product.id}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Product</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete &ldquo;{product.name}&rdquo;? This action cannot be undone.
                    This will also remove the product from all carts and collections.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button
                    onClick={() => handleDelete(product.id)}
                    className="bg-red-600 hover:bg-red-700"
                    disabled={isDeleting && deletingId === product.id}
                  >
                    {isDeleting && deletingId === product.id ? "Deleting..." : "Delete"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      ))}
    </div>
  );
}