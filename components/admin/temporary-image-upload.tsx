"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Edit3,
  ChevronUp,
  ChevronDown
} from "lucide-react";
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

export interface TemporaryImage {
  file: File;
  altText: string;
  position: number;
  preview: string;
}

interface TemporaryImageUploadProps {
  images: TemporaryImage[];
  onImagesChange: (images: TemporaryImage[]) => void;
}

export function TemporaryImageUpload({ images, onImagesChange }: TemporaryImageUploadProps) {
  const [editingImage, setEditingImage] = useState<TemporaryImage | null>(null);
  const [newAltText, setNewAltText] = useState("");

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newImages: TemporaryImage[] = [];

    for (const file of files) {
      // Validate file type
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a valid image file. Only JPEG, PNG, and WebP are allowed.`,
          variant: "destructive",
        });
        continue;
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds the 5MB size limit.`,
          variant: "destructive",
        });
        continue;
      }

      // Create local preview
      const preview = URL.createObjectURL(file);
      
      newImages.push({
        file,
        altText: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
        position: images.length + newImages.length,
        preview,
      });
    }

    if (newImages.length > 0) {
      onImagesChange([...images, ...newImages]);
      toast({
        title: "Images selected",
        description: `${newImages.length} image${newImages.length > 1 ? 's' : ''} ready to upload.`,
      });
    }

    // Reset the input
    e.target.value = "";
  }, [images, onImagesChange]);

  const handleDelete = (index: number) => {
    const imageToDelete = images[index];
    // Revoke the object URL to free memory
    URL.revokeObjectURL(imageToDelete.preview);
    
    const newImages = images.filter((_, i) => i !== index);
    // Update positions
    const reorderedImages = newImages.map((img, i) => ({
      ...img,
      position: i,
    }));
    onImagesChange(reorderedImages);
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const newImages = [...images];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= images.length) return;
    
    // Swap images
    [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
    
    // Update positions
    const reorderedImages = newImages.map((img, i) => ({
      ...img,
      position: i,
    }));
    
    onImagesChange(reorderedImages);
  };

  const handleAltTextUpdate = () => {
    if (!editingImage) return;
    
    const updatedImages = images.map(img => 
      img === editingImage ? { ...img, altText: newAltText } : img
    );
    
    onImagesChange(updatedImages);
    setEditingImage(null);
    setNewAltText("");
    
    toast({
      title: "Alt text updated",
      description: "Image alt text has been updated successfully.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Images</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Button */}
        <div className="space-y-2">
          <Label htmlFor="image-upload">Select Images</Label>
          <div className="flex items-center gap-4">
            <Input
              id="image-upload"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById("image-upload")?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              Select Images
            </Button>
            <span className="text-sm text-gray-500">
              JPEG, PNG, or WebP. Max 5MB per file.
            </span>
          </div>
          <p className="text-sm text-gray-500">
            Images will be uploaded when you create the product.
          </p>
        </div>

        {/* Image List */}
        {images.length > 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              {images.length} image{images.length > 1 ? 's' : ''} selected
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div
                  key={`${image.file.name}-${index}`}
                  className="relative group rounded-lg border border-gray-200 overflow-hidden"
                >
                  <img
                    src={image.preview}
                    alt={image.altText || `Product image ${index + 1}`}
                    className="w-full h-32 object-cover"
                  />
                  
                  {/* Position Badge */}
                  {index === 0 && (
                    <div className="absolute top-2 left-2">
                      <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
                        Primary
                      </span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <Button
                      type="button"
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8"
                      onClick={() => handleMove(index, "up")}
                      disabled={index === 0}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8"
                      onClick={() => handleMove(index, "down")}
                      disabled={index === images.length - 1}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          type="button"
                          size="icon"
                          variant="secondary"
                          className="h-8 w-8"
                          onClick={() => {
                            setEditingImage(image);
                            setNewAltText(image.altText || "");
                          }}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Image Alt Text</DialogTitle>
                          <DialogDescription>
                            Provide descriptive alt text for accessibility and SEO.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="alt-text">Alt Text</Label>
                            <Input
                              id="alt-text"
                              value={newAltText}
                              onChange={(e) => setNewAltText(e.target.value)}
                              placeholder="Describe the image..."
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button type="button" variant="outline">
                              Cancel
                            </Button>
                          </DialogClose>
                          <Button type="button" onClick={handleAltTextUpdate}>
                            Save
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Button
                      type="button"
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8"
                      onClick={() => handleDelete(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <ImageIcon className="mx-auto h-12 w-12 mb-3 text-gray-300" />
            <p>No images selected yet</p>
            <p className="text-sm">Select images to showcase your product</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}