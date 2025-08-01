import { CategoryForm } from "../../category-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import * as categoriesRepo from "@/repositories/admin/categories";
import { BackButton } from "@/components/ui/back-button";
import { getStoreBySlugAction } from "../../../../actions";

interface EditCategoryPageProps {
  params: Promise<{
    slug: string;
    id: string;
  }>;
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const { slug, id } = await params;
  
  // Get store information first
  const storeResult = await getStoreBySlugAction({ slug });
  const store = storeResult.data?.store;
  
  if (!store) {
    notFound();
  }
  
  // Fetch category data
  const category = await categoriesRepo.getCategoryById(id, store.id);

  // If category doesn't exist, show 404
  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <BackButton></BackButton>
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Edit Category</h2>
          <p className="text-gray-600 mt-2">
            Update category information for &ldquo;{category.name}&rdquo;
          </p>
        </div>
      </div>

      <CategoryForm 
        category={category as any}
        isEditing={true}
        slug={slug}
        storeId={store.id}
      />
    </div>
  );
}