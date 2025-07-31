import { CategoryForm } from "../category-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { BackButton } from "@/components/ui/back-button";

interface NewCategoryPageProps {
  params: Promise<{ slug: string; }>;
}

export default async function NewCategoryPage({ params }: NewCategoryPageProps) {
  const { slug } = await params;
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

      <CategoryForm slug={slug} />
    </div>
  );
}