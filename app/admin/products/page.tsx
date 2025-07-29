import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Package } from "lucide-react";
import Link from "next/link";
import * as productsRepo from "@/repositories/admin/products";
import * as categoriesRepo from "@/repositories/admin/categories";
import * as collectionsRepo from "@/repositories/admin/collections";
import { Paginator } from "@/components/pagination";
import { ProductSearch } from "@/components/admin/product-search";
import { ProductFilters } from "@/components/admin/product-filters";
import { SearchHighlight } from "@/components/admin/search-highlight";

interface ProductsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    categoryId?: string;
    collectionId?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || '1', 10);
  const search = params.search;
  const categoryId = params.categoryId;
  const collectionId = params.collectionId;
  
  const limit = 10; // Products per page
  const offset = (page - 1) * limit;
  
  // Fetch products, count, categories, and collections in parallel
  const [products, totalCount, categories, collections] = await Promise.all([
    productsRepo.getProducts(limit, offset, search, categoryId, collectionId),
    productsRepo.getProductsCount(search, categoryId, collectionId),
    categoriesRepo.getActiveCategories(),
    collectionsRepo.getActiveCollections()
  ]);
  
  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Products</h2>
          <p className="text-gray-600 mt-2">
            Manage your product catalog
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <ProductSearch />
              <ProductFilters categories={categories} collections={collections} />
            </div>
            {(search || categoryId || collectionId) && (
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/products">
                  Clear All
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {search ? `Search Results (${totalCount} found)` : `Products (${totalCount} total)`}
            {totalPages > 1 && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                • Page {page} of {totalPages}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {totalCount === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              {(search || categoryId || collectionId) ? (
                <>
                  <p>No products found</p>
                  <p className="text-sm mt-2">
                    {search && `No results for ${search}. `}
                    Try adjusting your search or filters.
                  </p>
                  <Button variant="outline" className="mt-4" asChild>
                    <Link href="/admin/products">
                      Clear Filters
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <p>No products found.</p>
                  <p className="text-sm mt-2">
                    Create your first product to get started.
                  </p>
                  <Link href="/admin/products/new">
                    <Button className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Product
                    </Button>
                  </Link>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">
                        <SearchHighlight text={product.name} searchTerm={search} />
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
                  
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/products/${product.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {totalPages > 1 && (
            <div className="mt-6">
              <Paginator totalPages={totalPages} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}