import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Package, Tag } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import * as categoriesRepo from "@/repositories/admin/categories";
import * as productsRepo from "@/repositories/admin/products";
import { CategoryDeleteButton } from "@/components/admin/category-delete-button";
import { deleteCategoryAction } from "../actions";
import { BackButton } from "@/components/ui/back-button";
import { CategoryProductsSection } from "./category-products-section";

interface CategoryDetailsPageProps {
  params: Promise<{ slug: string; id: string }>;
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function CategoryDetailsPage({ params, searchParams }: CategoryDetailsPageProps) {
  const { slug, id } = await params;
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
          <Link href={`/stores/${slug}/admin/categories/${category.id}/edit`}>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Edit Category
            </Button>
          </Link>
          <CategoryDeleteButton 
            category={category as any}
            deleteAction={deleteCategoryAction}
            redirectPath={`/stores/${slug}/admin/categories`}
          />
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
      <CategoryProductsSection 
        category={{ id: category.id, name: category.name }}
        products={products}
        totalCount={totalCount}
        totalPages={totalPages}
        currentPage={currentPage}
        slug={slug}
      />

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