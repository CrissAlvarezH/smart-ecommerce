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
  storeId: string;
}

interface ProductDeleteButtonProps {
  product: Product;
  deleteAction: any;
  redirectPath?: string;
}

export function ProductDeleteButton({ product, deleteAction, redirectPath = "/admin/products" }: ProductDeleteButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const { execute: deleteProduct, isExecuting: isDeleting } = useAction(deleteAction, {
    onSuccess: () => {
      toast({
        title: "Product deleted",
        description: "The product has been successfully deleted.",
      });
      router.push(redirectPath);
    },
    onError: ({ error }) => {
      toast({
        title: "Error",
        description: String(error.serverError || "Failed to delete product"),
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    console.log('product.id', product.id);
    console.log('product.storeId', product.storeId);
    deleteProduct({ id: product.id, storeId: product.storeId });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" disabled={isDeleting}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Product
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Product</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &ldquo;{product.name}&rdquo;? This action cannot be undone.
            This will also remove the product from all carts and collections.
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