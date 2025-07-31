"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useAction } from "next-safe-action/hooks";
import { deleteCategoryAction } from "../actions";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  parentId: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface CategoriesClientProps {
  initialCategories: Category[];
  slug: string;
}

export function CategoriesClient({ initialCategories, slug }: CategoriesClientProps) {
  const [categories, setCategories] = useState(initialCategories);

  const { execute: deleteCategory, isExecuting: isDeleting } = useAction(deleteCategoryAction, {
    onSuccess: () => {
      toast({
        title: "Category deleted",
        description: "The category has been successfully deleted.",
      });
      // Refresh categories list
      window.location.reload();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.error?.serverError || "Failed to delete category",
        variant: "destructive",
      });
    },
  });

  // Categories are already filtered by the parent component
  const filteredCategories = categories;

  const handleDelete = (id: string) => {
    deleteCategory({ id });
  };

  return (
    <>
      {filteredCategories.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No categories found.</p>
              <p className="text-sm mt-2">
                Create your first category to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCategories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">
                        <Link 
                          href={`/stores/${slug}/admin/categories/${category.id}`}
                          className="hover:text-blue-600 transition-colors"
                        >
                          {category.name}
                        </Link>
                      </h3>
                      <Badge variant={category.isActive ? "default" : "secondary"}>
                        {category.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Slug: {category.slug}
                    </p>
                    {category.description && (
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {category.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-400">
                      Created: {new Date(category.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Link href={`/stores/${slug}/admin/categories/${category.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" disabled={isDeleting}>
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Category</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete &ldquo;{category.name}&rdquo;? This action cannot be undone.
                            Products in this category will no longer be categorized.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                          </DialogClose>
                          <Button
                            onClick={() => handleDelete(category.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
      )}
    </>
  );
}