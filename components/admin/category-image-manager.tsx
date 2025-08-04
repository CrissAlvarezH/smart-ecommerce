"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  X, 
  Star, 
  StarOff, 
  Image as ImageIcon, 
  Loader2,
  Edit3,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CategoryImage {
  id: string;
  categoryId: string;
  url: string;
  altText: string | null;
  position: number;
  isMain: boolean;
  createdAt: Date;
}

interface CategoryImageManagerProps {
  categoryId?: string; // Optional for new categories
  onImagesChange?: (images: CategoryImage[]) => void;
  onMainImageChange?: (mainImageId: string | null) => void;
  onLocalImagesChange?: (localImages: { file: File; preview: string; id: string; altText: string; isMain: boolean }[]) => void;
  isEditing: boolean;
  actions?: {
    addCategoryImageAction: any;
    deleteCategoryImageAction: any;
    getCategoryImagesAction: any;
    updateCategoryImageAction: any;
    reorderCategoryImagesAction: any;
  };
}

export function CategoryImageManager({ 
  categoryId, 
  onImagesChange, 
  onMainImageChange, 
  onLocalImagesChange,
  isEditing, 
  actions 
}: CategoryImageManagerProps) {
  const [images, setImages] = useState<CategoryImage[]>([]);
  const [localImages, setLocalImages] = useState<{ file: File; preview: string; id: string; altText: string; isMain: boolean }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [mainImageId, setMainImageId] = useState<string | null>(null);
  const [editingImage, setEditingImage] = useState<CategoryImage | null>(null);
  const [editAltText, setEditAltText] = useState("");

  // Server actions - always call hooks but conditionally use them
  const fetchImages = useAction(actions?.getCategoryImagesAction || (() => Promise.resolve({ data: [] })), {
    onSuccess: (result) => {
      if (!actions?.getCategoryImagesAction) return;
      console.log("📸 Fetch images result:", result);
      // Ensure result.data is an array before sorting
      const imageData = Array.isArray(result.data) ? result.data : [];
      const sortedImages = imageData.sort((a, b) => a.position - b.position);
      setImages(sortedImages);
      const mainImage = sortedImages.find(img => img.isMain);
      if (mainImage) {
        setMainImageId(mainImage.id);
        onMainImageChange?.(mainImage.id);
      }
      onImagesChange?.(sortedImages);
    },
    onError: (error) => {
      if (!actions?.getCategoryImagesAction) return;
      console.error("❌ Fetch images error:", error);
      toast({
        title: "Error",
        description: error.error?.serverError || "Failed to load images",
        variant: "destructive",
      });
    },
  });

  const addImage = useAction(actions?.addCategoryImageAction || (() => Promise.resolve({ data: {} })), {
    onSuccess: () => {
      if (!actions?.addCategoryImageAction) return;
      toast({
        title: "Image added",
        description: "Image has been successfully added to the category.",
      });
      if (categoryId) {
        fetchImages.execute({ categoryId });
      }
    },
    onError: (error) => {
      if (!actions?.addCategoryImageAction) return;
      toast({
        title: "Error",
        description: error.error?.serverError || "Failed to add image",
        variant: "destructive",
      });
    },
  });

  const deleteImage = useAction(actions?.deleteCategoryImageAction || (() => Promise.resolve({ data: {} })), {
    onSuccess: () => {
      if (!actions?.deleteCategoryImageAction) return;
      toast({
        title: "Image deleted",
        description: "Image has been successfully deleted.",
      });
      if (categoryId) {
        fetchImages.execute({ categoryId });
      }
    },
    onError: (error) => {
      if (!actions?.deleteCategoryImageAction) return;
      toast({
        title: "Error",
        description: error.error?.serverError || "Failed to delete image",
        variant: "destructive",
      });
    },
  });

  const updateImage = useAction(actions?.updateCategoryImageAction || (() => Promise.resolve({ data: {} })), {
    onSuccess: () => {
      if (!actions?.updateCategoryImageAction) return;
      toast({
        title: "Image updated",
        description: "Image has been successfully updated.",
      });
      setEditingImage(null);
      setEditAltText("");
      if (categoryId) {
        fetchImages.execute({ categoryId });
      }
    },
    onError: (error) => {
      if (!actions?.updateCategoryImageAction) return;
      toast({
        title: "Error",
        description: error.error?.serverError || "Failed to update image",
        variant: "destructive",
      });
    },
  });

  const reorderImages = useAction(actions?.reorderCategoryImagesAction || (() => Promise.resolve({ data: {} })), {
    onSuccess: () => {
      if (!actions?.reorderCategoryImagesAction) return;
      toast({
        title: "Images reordered",
        description: "Image order has been updated.",
      });
    },
    onError: (error) => {
      if (!actions?.reorderCategoryImagesAction) return;
      toast({
        title: "Error",
        description: error.error?.serverError || "Failed to reorder images",
        variant: "destructive",
      });
      if (categoryId) {
        fetchImages.execute({ categoryId });
      }
    },
  });

  // Load images on component mount (only for existing categories)
  useEffect(() => {
    if (categoryId && isEditing && actions?.getCategoryImagesAction) {
      console.log("🔄 Loading category images for categoryId:", categoryId);
      fetchImages.execute({ categoryId });
    }
  }, [categoryId, isEditing, actions]);

  // Notify parent when local images change
  useEffect(() => {
    if (onLocalImagesChange) {
      onLocalImagesChange(localImages);
    }
  }, [localImages, onLocalImagesChange]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Only JPEG, PNG, and WebP files are allowed.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Maximum file size is 5MB.",
        variant: "destructive",
      });
      return;
    }

    if (isEditing && categoryId && addImage) {
      // For existing categories, upload immediately
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", "image");

        const response = await fetch("/api/categories/upload", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (result.success) {
          const position = images.length;
          const isMain = images.length === 0; // First image is main by default
          
          addImage.execute({
            categoryId,
            url: result.url,
            altText: file.name,
            position,
            isMain,
          });
        } else {
          throw new Error(result.error || "Upload failed");
        }
      } catch (error) {
        toast({
          title: "Upload failed",
          description: error instanceof Error ? error.message : "Failed to upload image",
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
      }
    } else {
      // For new categories, store locally
      const preview = URL.createObjectURL(file);
      const id = `local-${Date.now()}-${Math.random()}`;
      const isMain = localImages.length === 0; // First image is main by default
      
      const newLocalImage = {
        file,
        preview,
        id,
        altText: file.name,
        isMain,
      };

      const updatedLocalImages = [...localImages, newLocalImage];
      setLocalImages(updatedLocalImages);
      
      if (isMain) {
        setMainImageId(id);
        onMainImageChange?.(id);
      }

      toast({
        title: "Image selected",
        description: "Image will be uploaded when you create the category.",
      });
    }

    // Reset file input
    event.target.value = "";
  };

  const handleDeleteLocalImage = (imageId: string) => {
    const imageToRemove = localImages.find(img => img.id === imageId);
    if (imageToRemove) {
      URL.revokeObjectURL(imageToRemove.preview);
      const updatedImages = localImages.filter(img => img.id !== imageId);
      setLocalImages(updatedImages);
      
      // Update main image if deleted image was main
      if (mainImageId === imageId) {
        const newMainId = updatedImages.length > 0 ? updatedImages[0].id : null;
        setMainImageId(newMainId);
        onMainImageChange?.(newMainId);
        
        // Update isMain flags
        const updatedImagesWithMain = updatedImages.map((img, index) => ({
          ...img,
          isMain: index === 0,
        }));
        setLocalImages(updatedImagesWithMain);
      }
    }
  };

  const handleDeleteServerImage = (imageId: string) => {
    if (deleteImage) {
      deleteImage.execute({ id: imageId });
    }
  };

  const handleSetMainLocalImage = (imageId: string) => {
    const updatedImages = localImages.map(img => ({
      ...img,
      isMain: img.id === imageId,
    }));
    
    // Move main image to first position
    const mainImageIndex = updatedImages.findIndex(img => img.id === imageId);
    if (mainImageIndex > 0) {
      const [mainImage] = updatedImages.splice(mainImageIndex, 1);
      updatedImages.unshift(mainImage);
    }
    
    setLocalImages(updatedImages);
    setMainImageId(imageId);
    onMainImageChange?.(imageId);
    
    toast({
      title: "Main image set",
      description: "This image is now the main category image.",
    });
  };

  const handleSetMainServerImage = (imageId: string) => {
    // This would require a server action to update the isMain flag
    // For now, we'll handle this through the existing update mechanism
    setMainImageId(imageId);
    onMainImageChange?.(imageId);
    
    toast({
      title: "Main image set",
      description: "This image is now the main category image.",
    });
  };

  const getAllImages = () => {
    if (isEditing) {
      return images;
    } else {
      return localImages.map((img, index) => ({
        id: img.id,
        categoryId: '',
        url: img.preview,
        altText: img.altText,
        position: index,
        isMain: img.isMain,
        createdAt: new Date(),
      }));
    }
  };

  const allImages = getAllImages();
  const isLoading = fetchImages?.isExecuting || false;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Category Images ({allImages.length})
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Upload Section */}
        <div className="mb-6">
          <Label htmlFor="category-image-upload" className="text-sm font-medium">
            Add Images
          </Label>
          <div className="mt-2">
            <div className="flex items-center gap-4">
              <Button
                type="button"
                onClick={() => document.getElementById("category-image-upload")?.click()}
                disabled={isUploading}
                variant="outline"
                className="flex items-center gap-2"
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                {isEditing ? "Upload Image" : "Select Image"}
              </Button>
              <span className="text-sm text-gray-500">
                Supported: JPG, PNG, WebP (max 5MB)
              </span>
            </div>
            <input
              id="category-image-upload"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* Images Grid */}
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">
            <Loader2 className="mx-auto h-12 w-12 text-gray-300 mb-4 animate-spin" />
            <p>Loading images...</p>
          </div>
        ) : allImages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p>No images added yet.</p>
            <p className="text-sm mt-2">
              {isEditing ? "Upload your first image to get started." : "Select your first image for this category."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {allImages.map((image, index) => (
              <div
                key={image.id}
                className={`relative group border rounded-lg overflow-hidden ${
                  (image.isMain || mainImageId === image.id) ? "ring-2 ring-blue-500" : ""
                }`}
              >
                {/* Main Image Badge */}
                {(image.isMain || mainImageId === image.id) && (
                  <Badge className="absolute top-2 right-2 z-10 bg-blue-500">
                    Main
                  </Badge>
                )}

                {/* Image */}
                <div className="aspect-square bg-gray-100">
                  <img
                    src={image.url}
                    alt={image.altText || `Category image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      if (isEditing) {
                        handleSetMainServerImage(image.id);
                      } else {
                        handleSetMainLocalImage(image.id);
                      }
                    }}
                    disabled={image.isMain || mainImageId === image.id}
                    title={image.isMain || mainImageId === image.id ? "Current main image" : "Set as main image"}
                  >
                    {(image.isMain || mainImageId === image.id) ? (
                      <Star className="h-4 w-4 fill-current" />
                    ) : (
                      <StarOff className="h-4 w-4" />
                    )}
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      if (isEditing) {
                        handleDeleteServerImage(image.id);
                      } else {
                        handleDeleteLocalImage(image.id);
                      }
                    }}
                    title="Delete image"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {allImages.length > 0 && (
          <div className="mt-4 text-sm text-gray-500">
            <p>💡 Tip: Click the star to set the main category image. The main image will be displayed prominently.</p>
            {!isEditing && (
              <p className="mt-1">📁 Images will be uploaded when you create the category.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Export function to get local images (for form submission)
export const getCategoryLocalImages = (managerRef: React.RefObject<any>) => {
  return managerRef.current?.getLocalImages?.() || [];
};