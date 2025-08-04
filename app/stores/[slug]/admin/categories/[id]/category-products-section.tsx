"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";
import Link from "next/link";
import { ProductsClient } from "@/components/admin/products-client";
import { deleteProductAction } from "../../products/actions";
import { Paginator } from "@/components/pagination";
import { AddProductDialog } from "./add-product-dialog";
import { useRouter } from "next/navigation";

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

interface Category {
  id: string;
  name: string;
  storeId: string;
}

interface CategoryProductsSectionProps {
  category: Category;
  products: Product[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  slug: string;
}

export function CategoryProductsSection({ 
  category, 
  products, 
  totalCount, 
  totalPages, 
  currentPage,
  slug
}: CategoryProductsSectionProps) {
  const router = useRouter();

  const handleProductAdded = () => {
    // Refresh the page to show updated product list
    router.refresh();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Products in &ldquo;{category.name}&rdquo;
            {totalPages > 1 && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                • Page {currentPage} of {totalPages}
              </span>
            )}
          </CardTitle>
          <AddProductDialog 
            category={category} 
            storeSlug={slug}
            onProductAdded={handleProductAdded}
          />
        </div>
      </CardHeader>
      <CardContent>
        {totalCount == 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p>There aren&apos;t any products yet.</p>
            <p className="text-sm mt-2">
              Products assigned to this category will appear here.
            </p>
            <div className="flex gap-2 justify-center mt-4">
              <AddProductDialog 
                category={category} 
                storeSlug={slug}
                onProductAdded={handleProductAdded}
              />
              <Link href={`/stores/${slug}/admin/products/new`}>
                <Button variant="outline">
                  <Package className="h-4 w-4 mr-2" />
                  Create New Product
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            <ProductsClient products={products} slug={slug} deleteAction={deleteProductAction} />

            {totalPages > 1 && (
              <div className="mt-6">
                <Paginator totalPages={totalPages} />
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}