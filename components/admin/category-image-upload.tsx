"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface CategoryImageUploadProps {
  title: string;
  type: "image" | "banner";
  currentImageUrl?: string;
  onImageChange: (imageUrl: string | null) => void;
  onFileChange?: (file: File | null) => void;
  className?: string;
}

export function CategoryImageUpload({ 
  title, 
  type, 
  currentImageUrl, 
  onImageChange,
  onFileChange,
  className 
}: CategoryImageUploadProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoadingExisting, setIsLoadingExisting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing image if currentImageUrl is provided
  useEffect(() => {
    if (currentImageUrl && !currentImageUrl.startsWith('blob:')) {
      setIsLoadingExisting(true);
      // Fetch signed URL for existing image
      fetch(`/api/files/url?path=${encodeURIComponent(currentImageUrl)}`)
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            setPreviewUrl(data.url);
          } else {
            console.error('Failed to get file URL:', data.error);
          }
        })
        .catch(error => {
          console.error('Error fetching file URL:', error);
        })
        .finally(() => {
          setIsLoadingExisting(false);
        });
    } else if (currentImageUrl?.startsWith('blob:')) {
      setPreviewUrl(currentImageUrl);
    }
  }, [currentImageUrl]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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

    // Store file locally and create preview
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    
    // Notify parent components about the changes
    onImageChange(null); // Clear any existing URL since we have a new file
    onFileChange?.(file);

    toast({
      title: "File selected",
      description: `${title} will be uploaded when you create the category.`,
    });
  };

  const handleRemoveImage = async () => {
    setIsDeleting(true);
    
    try {
      // If there's a selected file (local), just remove it locally
      if (selectedFile) {
        // Revoke the object URL to free memory
        if (previewUrl?.startsWith('blob:')) {
          URL.revokeObjectURL(previewUrl);
        }
        
        setSelectedFile(null);
        setPreviewUrl(null);
        onImageChange(null);
        onFileChange?.(null);
        
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        
        toast({
          title: "File removed",
          description: `${title} has been removed.`,
        });
      }
      // If there's a current image URL (existing image), delete it from S3
      else if (currentImageUrl && !currentImageUrl.startsWith('blob:')) {
        console.log("🗑️ Deleting image from S3:", currentImageUrl);
        
        const response = await fetch(`/api/categories/delete-image?imageUrl=${encodeURIComponent(currentImageUrl)}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to delete image from S3");
        }

        console.log("✅ Image deleted from S3");
        
        setPreviewUrl(null);
        onImageChange(null);
        
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        
        toast({
          title: "Image removed",
          description: `${title} has been removed and deleted from storage.`,
        });
      }

    } catch (error) {
      console.error("Error removing image:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove image",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoadingExisting ? (
          <div className={`border rounded-lg ${
            type === "banner" ? "h-32" : "h-48"
          } flex flex-col items-center justify-center`}>
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <p className="text-sm text-gray-500 mt-2">Loading existing image...</p>
          </div>
        ) : previewUrl ? (
          <div className="relative">
            <img
              src={previewUrl}
              alt={title}
              className={`w-full object-cover rounded-lg border ${
                type === "banner" ? "h-32" : "h-48"
              }`}
            />
            <Button
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={handleRemoveImage}
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
            </Button>
          </div>
        ) : (
          <div
            className={`border-2 border-dashed border-gray-300 rounded-lg ${
              type === "banner" ? "h-32" : "h-48"
            } flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors ${
              isDeleting ? "pointer-events-none opacity-50" : ""
            }`}
            onClick={handleUploadClick}
          >
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-8 w-8 text-gray-400" />
              <p className="text-sm text-gray-500">Click to select {title.toLowerCase()}</p>
              <p className="text-xs text-gray-400">JPEG, PNG, WebP up to 5MB</p>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isDeleting}
        />
      </CardContent>
    </Card>
  );
}