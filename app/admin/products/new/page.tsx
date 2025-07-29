import { ProductForm } from "../product-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import * as categoriesRepo from "@/repositories/admin/categories";

export default async function NewProductPage() {
  const categories = await categoriesRepo.getActiveCategories();

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
          <h2 className="text-3xl font-bold text-gray-900">Create Product</h2>
          <p className="text-gray-600 mt-2">
            Add a new product to your store
          </p>
        </div>
      </div>

      <ProductForm categories={categories} />
    </div>
  );
}