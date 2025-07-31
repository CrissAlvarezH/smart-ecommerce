import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Package } from "lucide-react";
import Link from "next/link";
import { getProductsPageDataAction } from "./actions";
import { Paginator } from "@/components/pagination";
import { ProductSearch } from "@/components/admin/product-search";
import { ProductFilters } from "@/components/admin/product-filters";
import { ProductsClient } from "@/components/admin/products-client";
import { deleteProductAction } from "./actions";

interface ProductsPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    page?: string;
    search?: string;
    categoryId?: string;
    collectionId?: string;
  }>;
}

export default async function ProductsPage({ params, searchParams }: ProductsPageProps) {
  const { slug } = await params;
  const searchParamsData = await searchParams;
  
  // Fetch all page data through server action
  const { data: pageData, serverError } = await getProductsPageDataAction({
    page: searchParamsData.page || "1",
    search: searchParamsData.search,
    categoryId: searchParamsData.categoryId,
    collectionId: searchParamsData.collectionId,
  });
  
  if (serverError) {
    return <div>Error loading products: {serverError}</div>;
  }
  
  if (!pageData) {
    return <div>No data available</div>;
  }
  
  const { products, totalCount, totalPages, categories, collections, currentPage } = pageData;
  const { search, categoryId, collectionId } = searchParamsData;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Products</h2>
          <p className="text-gray-600 mt-2">
            Manage your product catalog
          </p>
        </div>
        <Link href={`/stores/${slug}/admin/products/new`}>
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
              <ProductFilters categories={categories as any} collections={collections as any} />
            </div>
            {(search || categoryId || collectionId) && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/stores/${slug}/admin/products`}>
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
                • Page {currentPage} of {totalPages}
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
                    <Link href={`/stores/${slug}/admin/products`}>
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
                  <Link href={`/stores/${slug}/admin/products/new`}>
                    <Button className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Product
                    </Button>
                  </Link>
                </>
              )}
            </div>
          ) : (
            <ProductsClient products={products} searchTerm={search} slug={slug} deleteAction={deleteProductAction} />
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