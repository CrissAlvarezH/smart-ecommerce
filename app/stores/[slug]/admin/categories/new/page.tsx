import { CategoryForm } from "../category-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { BackButton } from "@/components/ui/back-button";
import { getStoreBySlugAction } from "../../../actions";
import { notFound } from "next/navigation";

interface NewCategoryPageProps {
  params: Promise<{ slug: string; }>;
}

export default async function NewCategoryPage({ params }: NewCategoryPageProps) {
  const { slug } = await params;
  
  // Get store information first
  const storeResult = await getStoreBySlugAction({ slug });
  const store = storeResult.data?.store;
  
  if (!store) {
    notFound();
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <BackButton></BackButton>
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Create Category</h2>
          <p className="text-gray-600 mt-2">
            Add a new product category to your store
          </p>
        </div>
      </div>

      <CategoryForm slug={slug} storeId={store.id} />
    </div>
  );
}