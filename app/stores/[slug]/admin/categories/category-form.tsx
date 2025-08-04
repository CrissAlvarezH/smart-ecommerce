"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAction } from "next-safe-action/hooks";
import { 
  createCategoryAction, 
  updateCategoryAction,
  addCategoryImageAction,
  deleteCategoryImageAction,
  getCategoryImagesAction,
  updateCategoryImageAction,
  reorderCategoryImagesAction,
  setMainCategoryImageAction
} from "../actions";
import { toast } from "@/hooks/use-toast";
import { CategoryImageUpload } from "@/components/admin/category-image-upload";
import { CategoryImageManager } from "@/components/admin/category-image-manager";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  bannerUrl: string | null;
  displayMode: "banner" | "image" | "products";
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
    bannerUrl: category?.bannerUrl || "",
    displayMode: (category?.displayMode as "banner" | "image" | "products") || "products",
    isActive: category?.isActive ?? true,
  });
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [mainImageId, setMainImageId] = useState<string | null>(null);
  const [localImages, setLocalImages] = useState<{ file: File; preview: string; id: string; altText: string; isMain: boolean }[]>([]);
  const localImagesRef = useRef(localImages);

  // Debug effect to track localImages changes
  useEffect(() => {
    console.log("🔍 Debug - CategoryForm localImages state changed:", localImages);
    console.log("🔍 Debug - CategoryForm localImages length:", localImages.length);
    localImagesRef.current = localImages;
  }, [localImages]);

  // Debug callback for local images change
  const handleLocalImagesChange = useCallback((images: { file: File; preview: string; id: string; altText: string; isMain: boolean }[]) => {
    console.log("🔍 Debug - CategoryForm received local images:", images);
    console.log("🔍 Debug - CategoryForm images count:", images.length);
    setLocalImages(images);
  }, []);

  const { executeAsync: addImage } = useAction(addCategoryImageAction);

  const { execute: createCategory, isExecuting: isCreating } = useAction(createCategoryAction, {
    onSuccess: async (result) => {
      console.log("✅ Category created:", result.data);
      console.log("🔍 Debug - localImages state:", localImages);
      console.log("🔍 Debug - localImagesRef.current:", localImagesRef.current);
      console.log("🔍 Debug - localImages length:", localImages.length);
      console.log("🔍 Debug - localImagesRef length:", localImagesRef.current.length);
      const createdCategory = result.data;
      
      // Upload local images after category creation - use ref to get current value
      const currentLocalImages = localImagesRef.current;
      if (currentLocalImages.length > 0) {
        console.log(`📸 Uploading ${currentLocalImages.length} images for category ${createdCategory.id}`);
        
        try {
          for (let i = 0; i < currentLocalImages.length; i++) {
            const localImage = currentLocalImages[i];
            
            // Upload file to S3
            const uploadedUrl = await uploadFile(localImage.file, "image");
            
            // Add image to category using server action
            await addImage({
              categoryId: createdCategory.id,
              url: uploadedUrl,
              altText: localImage.altText,
              position: i,
              isMain: localImage.isMain,
            });
            
            console.log(`✅ Image ${i + 1} uploaded and linked to category`);
          }
          
          toast({
            title: "Category created",
            description: `Category and ${currentLocalImages.length} images have been successfully created.`,
          });
        } catch (error) {
          console.error("❌ Error uploading images:", error);
          toast({
            title: "Category created",
            description: "Category created but some images failed to upload. You can add them later.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Category created",
          description: "The category has been successfully created.",
        });
      }
      
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
    onSuccess: async (result) => {
      console.log("✅ Category updated:", result.data);
      const updatedCategory = result.data;
      console.log('🔍 Debug - localImages state:', localImages);
      console.log('🔍 Debug - localImagesRef.current:', localImagesRef.current);
      console.log('🔍 Debug - localImages detailed:', localImages.map(img => ({ id: img.id, altText: img.altText })));
      console.log('🔍 Debug - localImagesRef detailed:', localImagesRef.current.map(img => ({ id: img.id, altText: img.altText })));
      
      // Upload local images after category update - use ref to get current value
      const currentLocalImages = localImagesRef.current;
      if (currentLocalImages.length > 0) {
        console.log(`📸 Uploading ${currentLocalImages.length} new images for category ${updatedCategory.id}`);
        
        try {
          for (let i = 0; i < currentLocalImages.length; i++) {
            const localImage = currentLocalImages[i];
            
            // Upload file to S3
            const uploadedUrl = await uploadFile(localImage.file, "image");
            
            // Add image to category using server action
            await addImage({
              categoryId: updatedCategory.id,
              url: uploadedUrl,
              altText: localImage.altText,
              position: i,
              isMain: localImage.isMain,
            });
            
            console.log(`✅ Image ${i + 1} uploaded and linked to category`);
          }
          
          toast({
            title: "Category updated",
            description: `Category and ${currentLocalImages.length} new images have been successfully updated.`,
          });
        } catch (error) {
          console.error("❌ Error uploading new images:", error);
          toast({
            title: "Category updated",
            description: "Category updated but some new images failed to upload. You can add them later.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Category updated",
          description: "The category has been successfully updated.",
        });
      }
      
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
    
    console.log("🔍 Debug - Form submission started");
    console.log("🔍 Debug - localImages at submission:", localImages);
    console.log("🔍 Debug - localImages length at submission:", localImages.length);

    try {
      // Prepare the submission data
      const submissionData = { ...formData };

      // Upload banner file if present
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
        // For new categories, we'll handle multi-image upload after category creation
        // The CategoryImageManager will handle local images during creation
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
          
          <CategoryImageManager
            categoryId={category?.id}
            isEditing={isEditing}
            onMainImageChange={setMainImageId}
            onLocalImagesChange={handleLocalImagesChange}
            actions={isEditing ? {
              addCategoryImageAction,
              deleteCategoryImageAction,
              getCategoryImagesAction,
              updateCategoryImageAction,
              reorderCategoryImagesAction,
              setMainCategoryImageAction,
            } : undefined}
          />

          <div className="space-y-2">
            <Label htmlFor="displayMode">Display Mode</Label>
            <Select
              value={formData.displayMode}
              onValueChange={(value: "banner" | "image" | "products") => setFormData({ ...formData, displayMode: value })}
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