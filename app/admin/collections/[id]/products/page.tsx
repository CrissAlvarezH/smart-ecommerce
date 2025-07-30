import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Package } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import * as collectionsRepo from "@/repositories/admin/collections";
import * as productsRepo from "@/repositories/admin/products";
import { CollectionProductsManager } from "@/components/admin/collection-products-manager";
import { BackButton } from "@/components/ui/back-button";

interface CollectionProductsPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    page?: string;
    availablePage?: string;
    search?: string;
    availableSearch?: string;
  }>;
}

export default async function CollectionProductsPage({ params, searchParams }: CollectionProductsPageProps) {
  const { id } = await params;
  const { page, availablePage, search, availableSearch } = await searchParams;
  
  const collection = await collectionsRepo.getCollectionById(id);
  
  if (!collection) {
    notFound();
  }

  const currentPage = parseInt(page || '1', 10);
  const availableCurrentPage = parseInt(availablePage || '1', 10);
  const limit = 10; // Products per page
  const offset = (currentPage - 1) * limit;
  const availableOffset = (availableCurrentPage - 1) * limit;
  
  // Fetch products in this collection and available products with pagination
  const [productsInCollection, totalInCollection, allProducts, totalAvailableProducts] = await Promise.all([
    productsRepo.getProducts(limit, offset, search, undefined, collection.id),
    productsRepo.getProductsCount(search, undefined, collection.id),
    productsRepo.getProducts(limit, availableOffset, availableSearch),
    productsRepo.getProductsCount(availableSearch)
  ]);
  
  const totalPages = Math.ceil(totalInCollection / limit);
  const totalAvailablePages = Math.ceil(totalAvailableProducts / limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BackButton></BackButton>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Manage Collection Products</h2>
            <p className="text-gray-600 mt-2">
              Add and remove products from &ldquo;{collection.name}&rdquo;
            </p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Link href={`/admin/collections/${collection.id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit Collection
            </Button>
          </Link>
        </div>
      </div>

      {/* Collection Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Collection Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-500">Collection Name</label>
              <p className="text-lg font-semibold">{collection.name}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <div className="mt-1">
                <Badge variant={collection.isActive ? "default" : "secondary"}>
                  {collection.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Products in Collection</label>
              <p className="text-2xl font-bold text-blue-600">
                {totalInCollection} {totalInCollection === 1 ? 'product' : 'products'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Management */}
      <CollectionProductsManager 
        collection={collection}
        productsInCollection={productsInCollection}
        allProducts={allProducts}
        totalInCollection={totalInCollection}
        totalPages={totalPages}
        currentPage={currentPage}
        searchTerm={search}
        availableCurrentPage={availableCurrentPage}
        totalAvailablePages={totalAvailablePages}
        availableSearchTerm={availableSearch}
      />
    </div>
  );
}