"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
// Delete action passed as prop
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

interface CategoryDeleteButtonProps {
  category: Category;
  deleteAction: any;
  redirectPath?: string;
}

export function CategoryDeleteButton({ category, deleteAction, redirectPath = "/admin/categories" }: CategoryDeleteButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const { execute: deleteCategory, isExecuting: isDeleting } = useAction(deleteAction, {
    onSuccess: () => {
      toast({
        title: "Category deleted",
        description: "The category has been successfully deleted.",
      });
      router.push(redirectPath);
    },
    onError: ({ error }) => {
      toast({
        title: "Error",
        description: error.serverError || "Failed to delete category",
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    deleteCategory({ id: category.id });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" disabled={isDeleting}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Category
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
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}