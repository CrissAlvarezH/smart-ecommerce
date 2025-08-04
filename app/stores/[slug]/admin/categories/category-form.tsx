"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAction } from "next-safe-action/hooks";
import { createCategoryAction, updateCategoryAction } from "../actions";
import { toast } from "@/hooks/use-toast";
import { CategoryImageUpload } from "@/components/admin/category-image-upload";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  bannerUrl: string | null;
  displayMode: string;
  parentId: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface CategoryFormProps {
  category?: Category;
  isEditing?: boolean;
  slug: string;
  storeId: string;
}

export function CategoryForm({ category, isEditing = false, slug, storeId }: CategoryFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: category?.name || "",
    slug: category?.slug || "",
    description: category?.description || "",
    imageUrl: category?.imageUrl || "",
    bannerUrl: category?.bannerUrl || "",
    displayMode: category?.displayMode || "products",
    isActive: category?.isActive ?? true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  const { execute: createCategory, isExecuting: isCreating } = useAction(createCategoryAction, {
    onSuccess: () => {
      toast({
        title: "Category created",
        description: "The category has been successfully created.",
      });
      router.push(`/stores/${slug}/admin/categories`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.error?.serverError || "Failed to create category",
        variant: "destructive",
      });
    },
  });

  const { execute: updateCategory, isExecuting: isUpdating } = useAction(updateCategoryAction, {
    onSuccess: () => {
      toast({
        title: "Category updated",
        description: "The category has been successfully updated.",
      });
      router.push(`/stores/${slug}/admin/categories`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.error?.serverError || "Failed to update category",
        variant: "destructive",
      });
    },
  });

  const isLoading = isCreating || isUpdating;

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }));
  };

  const uploadFile = async (file: File, type: "image" | "banner"): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    const response = await fetch("/api/categories/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Upload failed");
    }

    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Prepare the submission data
      const submissionData = { ...formData };

      // Upload new files if present
      if (imageFile) {
        console.log("📤 Uploading category image...");
        submissionData.imageUrl = await uploadFile(imageFile, "image");
      }

      if (bannerFile) {
        console.log("📤 Uploading category banner...");
        submissionData.bannerUrl = await uploadFile(bannerFile, "banner");
      }

      if (isEditing && category) {
        updateCategory({
          id: category.id,
          storeId,
          ...submissionData,
        });
      } else {
        createCategory({
          ...submissionData,
          storeId,
        });
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      toast({
        title: "Upload Error",
        description: error instanceof Error ? error.message : "Failed to upload files",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>
            {isEditing ? "Edit Category" : "Category Information"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={handleNameChange}
                placeholder="e.g., Electronics"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="e.g., electronics"
                required
              />
              <p className="text-sm text-gray-500">
                Used in URLs. Will be auto-generated from name if left empty.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of this category..."
              rows={3}
            />
          </div>

          <CategoryImageUpload
            title="Category Banner"
            type="banner"
            currentImageUrl={formData.bannerUrl}
            onImageChange={(url) => setFormData({ ...formData, bannerUrl: url || "" })}
            onFileChange={(file) => setBannerFile(file)}
          />
          
          <CategoryImageUpload
            title="Category Image"
            type="image"
            currentImageUrl={formData.imageUrl}
            onImageChange={(url) => setFormData({ ...formData, imageUrl: url || "" })}
            onFileChange={(file) => setImageFile(file)}
          />

          <div className="space-y-2">
            <Label htmlFor="displayMode">Display Mode</Label>
            <Select
              value={formData.displayMode}
              onValueChange={(value) => setFormData({ ...formData, displayMode: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select display mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="products">Products List</SelectItem>
                <SelectItem value="image">Image Display</SelectItem>
                <SelectItem value="banner">Banner Display</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">
              How this category should be displayed on the website.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
            <Label htmlFor="isActive">Active</Label>
            <p className="text-sm text-gray-500">
              Only active categories will be shown on the website.
            </p>
          </div>

          <div className="flex gap-4 pt-6">
            <Button
              type="submit"
              disabled={isLoading}
              className="min-w-[100px]"
            >
              {isLoading 
                ? (isEditing ? "Updating..." : "Creating...") 
                : (isEditing ? "Update Category" : "Create Category")
              }
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/stores/${slug}/admin/categories`)}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}