"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { CollectionProductsList } from "@/components/admin/collection-products-list";
import { AvailableProductsList } from "@/components/admin/available-products-list";

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
  slug: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface CollectionProductsManagerProps {
  collection: Collection;
  productsInCollection: Product[];
  allProducts: Product[];
  totalInCollection: number;
  totalPages: number;
  currentPage: number;
  searchTerm?: string;
  availableCurrentPage: number;
  totalAvailablePages: number;
  availableSearchTerm?: string;
}

export function CollectionProductsManager({
  collection,
  productsInCollection,
  allProducts,
  totalInCollection,
  totalPages,
  currentPage,
  searchTerm = "",
  availableCurrentPage,
  totalAvailablePages,
  availableSearchTerm = "",
}: CollectionProductsManagerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get products in collection IDs for filtering client-side
  const productsInCollectionIds = new Set(productsInCollection.map(p => p.id));
  
  // Filter available products to exclude those already in collection
  const availableProducts = allProducts.filter(product => !productsInCollectionIds.has(product.id));

  const handleCollectionSearchChange = (search: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (search) {
      params.set("search", search);
    } else {
      params.delete("search");
    }
    // Reset to first page when searching
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const handleAvailableSearchChange = (search: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (search) {
      params.set("availableSearch", search);
    } else {
      params.delete("availableSearch");
    }
    // Reset to first page when searching
    params.set("availablePage", "1");
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <CollectionProductsList
        collection={collection}
        products={productsInCollection}
        searchTerm={searchTerm}
        onSearchChange={handleCollectionSearchChange}
      />
      
      <AvailableProductsList
        collection={collection}
        products={availableProducts}
        searchTerm={availableSearchTerm}
        onSearchChange={handleAvailableSearchChange}
      />
    </div>
  );
}