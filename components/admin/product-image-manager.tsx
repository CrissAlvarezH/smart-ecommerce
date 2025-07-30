"use client";

import { useState, useEffect, useCallback } from "react";
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
  addProductImageAction,
  deleteProductImageAction,
  getProductImagesAction,
  updateProductImageAction,
  reorderProductImagesAction
} from "@/app/admin/products/actions";
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
// TODO: Add drag and drop functionality with @hello-pangea/dnd

interface ProductImage {
  id: string;
  productId: string;
  url: string;
  altText: string | null;
  position: number;
  createdAt: Date;
}

interface ProductImageManagerProps {
  productId: string;
}

export function ProductImageManager({ productId }: ProductImageManagerProps) {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [mainImageId, setMainImageId] = useState<string | null>(null);
  const [editingImage, setEditingImage] = useState<ProductImage | null>(null);
  const [editAltText, setEditAltText] = useState("");

  // Fetch product images
  const { execute: fetchImages, isExecuting: isFetching } = useAction(getProductImagesAction, {
    onSuccess: (result) => {
      const sortedImages = result.data.sort((a, b) => a.position - b.position);
      console.log("📸 Setting images in component:", sortedImages.length, sortedImages);
      setImages(sortedImages);
      // Set first image as main image if none selected
      if (sortedImages.length > 0 && !mainImageId) {
        setMainImageId(sortedImages[0].id);
      }
    },
    onError: (error) => {
      console.error("❌ Fetch images error:", error);
      toast({
        title: "Error",
        description: error.error?.serverError || "Failed to load images",
        variant: "destructive",
      });
    },
  });

  // Add product image
  const { execute: addImage } = useAction(addProductImageAction, {
    onSuccess: (result) => {
      console.log("✅ Add image success:", result);
      toast({
        title: "Image added",
        description: "Image has been successfully added to the product.",
      });
      // Refresh images
      console.log("🔄 Refreshing images after add...");
      fetchImages({ productId });
    },
    onError: (error) => {
      console.error("❌ Add image error:", error);
      toast({
        title: "Error",
        description: error.error?.serverError || "Failed to add image",
        variant: "destructive",
      });
    },
  });

  // Delete product image
  const { execute: deleteImage, isExecuting: isDeleting } = useAction(deleteProductImageAction, {
    onSuccess: () => {
      toast({
        title: "Image deleted",
        description: "Image has been successfully deleted.",
      });
      // Refresh images
      fetchImages({ productId });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.error?.serverError || "Failed to delete image",
        variant: "destructive",
      });
    },
  });

  // Update product image
  const { execute: updateImage } = useAction(updateProductImageAction, {
    onSuccess: () => {
      toast({
        title: "Image updated",
        description: "Image has been successfully updated.",
      });
      setEditingImage(null);
      setEditAltText("");
      // Refresh images
      fetchImages({ productId });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.error?.serverError || "Failed to update image",
        variant: "destructive",
      });
    },
  });

  // Reorder images
  const { execute: reorderImages } = useAction(reorderProductImagesAction, {
    onSuccess: () => {
      toast({
        title: "Images reordered",
        description: "Image order has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.error?.serverError || "Failed to reorder images",
        variant: "destructive",
      });
      // Refresh images on error to restore original order
      fetchImages({ productId });
    },
  });

  // Load images on component mount
  useEffect(() => {
    if (productId) {
      fetchImages({ productId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]); // fetchImages is stable from useAction, safe to omit

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        // Add image to product with position
        const position = images.length;
        addImage({
          productId,
          url: result.url,
          altText: file.name,
          position,
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
      // Reset file input
      event.target.value = "";
    }
  };

  const handleDeleteImage = (imageId: string) => {
    deleteImage({ id: imageId });
    // Update main image if deleting the current main image
    if (mainImageId === imageId) {
      const remainingImages = images.filter(img => img.id !== imageId);
      setMainImageId(remainingImages.length > 0 ? remainingImages[0].id : null);
    }
  };

  const handleSetMainImage = (imageId: string) => {
    setMainImageId(imageId);
    toast({
      title: "Main image set",
      description: "This image is now the main product image.",
    });
  };

  const handleEditImage = (image: ProductImage) => {
    setEditingImage(image);
    setEditAltText(image.altText || "");
  };

  const handleUpdateImage = () => {
    if (!editingImage) return;
    
    updateImage({
      id: editingImage.id,
      altText: editAltText.trim() || undefined,
    });
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    
    const reorderedImages = Array.from(images);
    const [movedImage] = reorderedImages.splice(index, 1);
    reorderedImages.splice(index - 1, 0, movedImage);
    
    setImages(reorderedImages);
    const imageIds = reorderedImages.map(img => img.id);
    reorderImages({ productId, imageIds });
  };

  const handleMoveDown = (index: number) => {
    if (index === images.length - 1) return;
    
    const reorderedImages = Array.from(images);
    const [movedImage] = reorderedImages.splice(index, 1);
    reorderedImages.splice(index + 1, 0, movedImage);
    
    setImages(reorderedImages);
    const imageIds = reorderedImages.map(img => img.id);
    reorderImages({ productId, imageIds });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Product Images ({images.length})
          {isFetching && <Loader2 className="h-4 w-4 animate-spin" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Upload Section */}
        <div className="mb-6">
          <Label htmlFor="image-upload" className="text-sm font-medium">
            Add Images
          </Label>
          <div className="mt-2">
            <div className="flex items-center gap-4">
              <Button
                type="button"
                onClick={() => document.getElementById("image-upload")?.click()}
                disabled={isUploading}
                variant="outline"
                className="flex items-center gap-2"
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                Upload Image
              </Button>
              <span className="text-sm text-gray-500">
                Supported: JPG, PNG, WebP (max 5MB)
              </span>
            </div>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* Images Grid */}
        {images.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p>No images added yet.</p>
            <p className="text-sm mt-2">Upload your first image to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div
                key={image.id}
                className={`relative group border rounded-lg overflow-hidden ${
                  mainImageId === image.id ? "ring-2 ring-blue-500" : ""
                }`}
              >
                {/* Move buttons */}
                <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="w-6 h-6 p-0"
                    title="Move up"
                  >
                    <ChevronUp className="h-3 w-3" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => handleMoveDown(index)}
                    disabled={index === images.length - 1}
                    className="w-6 h-6 p-0"
                    title="Move down"
                  >
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </div>

                {/* Main Image Badge */}
                {mainImageId === image.id && (
                  <Badge className="absolute top-2 right-2 z-10 bg-blue-500">
                    Main
                  </Badge>
                )}

                {/* Image */}
                <div className="aspect-square bg-gray-100">
                  <img
                    src={image.url}
                    alt={image.altText || `Product image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => handleSetMainImage(image.id)}
                    disabled={mainImageId === image.id}
                    title={mainImageId === image.id ? "Current main image" : "Set as main image"}
                  >
                    {mainImageId === image.id ? (
                      <Star className="h-4 w-4 fill-current" />
                    ) : (
                      <StarOff className="h-4 w-4" />
                    )}
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => handleEditImage(image)}
                    title="Edit image"
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteImage(image.id)}
                    disabled={isDeleting}
                    title="Delete image"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit Image Dialog */}
        <Dialog open={!!editingImage} onOpenChange={() => setEditingImage(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Image</DialogTitle>
              <DialogDescription>
                Update the alternative text for this image.
              </DialogDescription>
            </DialogHeader>
            
            {editingImage && (
              <div className="space-y-4">
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={editingImage.url}
                    alt={editingImage.altText || "Product image"}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div>
                  <Label htmlFor="alt-text">Alternative Text</Label>
                  <Input
                    id="alt-text"
                    value={editAltText}
                    onChange={(e) => setEditAltText(e.target.value)}
                    placeholder="Describe this image..."
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="button" onClick={handleUpdateImage}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {images.length > 0 && (
          <div className="mt-4 text-sm text-gray-500">
            <p>💡 Tip: Use the arrow buttons to reorder images. Click the star to set the main product image.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}