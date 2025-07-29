import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Package } from "lucide-react";
import Link from "next/link";
import * as categoriesRepo from "@/repositories/admin/categories";
import { CategoriesList } from "@/components/admin/categories-list";
import { CategorySearch } from "@/components/admin/category-search";
import { Paginator } from "@/components/pagination";

interface CategoriesPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
  }>;
}

export default async function CategoriesPage({ searchParams }: CategoriesPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || '1', 10);
  const search = params.search;
  
  const limit = 10; // Categories per page
  const offset = (page - 1) * limit;
  
  // Fetch categories and count in parallel
  const [categories, totalCount] = await Promise.all([
    categoriesRepo.getCategories(limit, offset, search),
    categoriesRepo.getCategoriesCount(search)
  ]);
  
  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Categories</h2>
          <p className="text-gray-600 mt-2">
            Manage your product categories
          </p>
        </div>
        <Link href="/admin/categories/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-4">
            <CategorySearch />
            {search && (
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/categories">
                  Clear Search
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Categories List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {search ? `Search Results (${totalCount} found)` : `Categories (${totalCount} total)`}
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
              {search ? (
                <>
                  <p>No categories found</p>
                  <p className="text-sm mt-2">
                    No results for {search}. Try adjusting your search.
                  </p>
                  <Button variant="outline" className="mt-4" asChild>
                    <Link href="/admin/categories">
                      Clear Search
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <p>No categories found.</p>
                  <p className="text-sm mt-2">
                    Create your first category to get started.
                  </p>
                  <Link href="/admin/categories/new">
                    <Button className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Category
                    </Button>
                  </Link>
                </>
              )}
            </div>
          ) : (
            <CategoriesList categories={categories} searchTerm={search} />
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