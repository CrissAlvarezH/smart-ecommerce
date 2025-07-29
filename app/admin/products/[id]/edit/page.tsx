import { ProductForm } from "../../product-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import * as categoriesRepo from "@/repositories/admin/categories";
import * as productsRepo from "@/repositories/admin/products";

interface EditProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  
  // Fetch product and categories in parallel
  const [product, categories] = await Promise.all([
    productsRepo.getProductById(id),
    categoriesRepo.getActiveCategories()
  ]);

  // If product doesn't exist, show 404
  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Edit Product</h2>
          <p className="text-gray-600 mt-2">
            Update product information for "{product.name}"
          </p>
        </div>
      </div>

      <ProductForm 
        categories={categories} 
        product={product}
        isEditing={true}
      />
    </div>
  );
}