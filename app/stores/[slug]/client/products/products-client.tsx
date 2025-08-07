"use client";

import { useState } from "react";
import { ProductGrid } from "@/components/products/product-grid";
import { ProductSearch } from "@/components/store/product-search";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";

interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string;
  price: string;
  compareAtPrice?: string;
  categoryName?: string;
  inventory: number;
  image?: {
    url: string;
    altText?: string;
  };
}

interface ProductsClientProps {
  products: Product[];
  storeSlug: string;
  storeName: string;
}

export function ProductsClient({ products: initialProducts, storeSlug, storeName }: ProductsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState(initialProducts);
  const [isLoading, setIsLoading] = useState(false);
  
  const currentSort = searchParams.get("sort") || "newest";
  const searchTerm = searchParams.get("search") || "";

  const handleSortChange = (newSort: string) => {
    // Update URL with new sort parameter
    const params = new URLSearchParams(searchParams);
    params.set("sort", newSort);
    router.push(`?${params.toString()}`);
    
    // Sort products client-side for immediate feedback
    const sortedProducts = [...products];
    switch (newSort) {
      case "price-asc":
        sortedProducts.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case "price-desc":
        sortedProducts.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case "name-asc":
        sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "newest":
      default:
        // Keep original order (newest first from server)
        setProducts(initialProducts);
        return;
    }
    setProducts(sortedProducts);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{storeName} Products</h1>
        <p className="text-gray-600">Discover our amazing collection of products</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6 flex justify-center">
        <ProductSearch 
          storeSlug={storeSlug} 
          placeholder={`Search ${storeName} products...`}
        />
      </div>

      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-gray-600">
          {searchTerm ? (
            <>Showing {products.length} results for &quot;{searchTerm}&quot;</>
          ) : (
            <>Showing {products.length} products</>
          )}
        </p>
        
        <Select value={currentSort} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
            <SelectItem value="name-asc">Name: A to Z</SelectItem>
            <SelectItem value="name-desc">Name: Z to A</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ProductGrid products={products} storeSlug={storeSlug} />
    </div>
  );
}