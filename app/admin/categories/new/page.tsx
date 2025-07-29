import { CategoryForm } from "../category-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewCategoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/categories">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Create Category</h2>
          <p className="text-gray-600 mt-2">
            Add a new product category to your store
          </p>
        </div>
      </div>

      <CategoryForm />
    </div>
  );
}