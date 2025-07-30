import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Package, Tag } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import * as categoriesRepo from "@/repositories/admin/categories";
import * as productsRepo from "@/repositories/admin/products";
import { ProductsClient } from "@/components/admin/products-client";
import { Paginator } from "@/components/pagination";
import { CategoryDeleteButton } from "@/components/admin/category-delete-button";
import { BackButton } from "@/components/ui/back-button";

interface CategoryDetailsPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function CategoryDetailsPage({ params, searchParams }: CategoryDetailsPageProps) {
  const { id } = await params;
  const { page } = await searchParams;

  const category = await categoriesRepo.getCategoryById(id);

  if (!category) {
    notFound();
  }

  const currentPage = parseInt(page || '1', 10);
  const limit = 10; // Products per page
  const offset = (currentPage - 1) * limit;

  // Fetch products in this category and count in parallel
  const [products, totalCount] = await Promise.all([
    productsRepo.getProducts(limit, offset, undefined, category.id),
    productsRepo.getProductsCount(undefined, category.id)
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BackButton></BackButton>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Category Details</h2>
            <p className="text-gray-600 mt-2">
              View category information and associated products
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Link href={`/admin/categories/${category.id}/edit`}>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Edit Category
            </Button>
          </Link>
          <CategoryDeleteButton category={category} />
        </div>
      </div>

      {/* Category Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Category Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Category Name</label>
                <p className="text-lg font-semibold">{category.name}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Slug</label>
                <p className="text-sm text-gray-700 font-mono bg-gray-50 px-2 py-1 rounded">
                  {category.slug}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div className="mt-1">
                  <Badge variant={category.isActive ? "default" : "secondary"}>
                    {category.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {category.description && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                    {category.description}
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-500">Products in Category</label>
                <p className="text-2xl font-bold text-blue-600">
                  {totalCount} {totalCount === 1 ? 'product' : 'products'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products in Category */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Products in &ldquo;{category.name}&rdquo;
            {totalPages > 1 && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                • Page {currentPage} of {totalPages}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {totalCount == 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p>There aren&apos;t any products yet.</p>
              <p className="text-sm mt-2">
                Products assigned to this category will appear here.
              </p>
              <Link href="/admin/products/new">
                <Button className="mt-4">
                  <Package className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <ProductsClient products={products} />

              {totalPages > 1 && (
                <div className="mt-6">
                  <Paginator totalPages={totalPages} />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Metadata</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="font-medium text-gray-500">Created</label>
              <p className="text-gray-700">
                {new Date(category.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div>
              <label className="font-medium text-gray-500">Last Updated</label>
              <p className="text-gray-700">
                {new Date(category.updatedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}