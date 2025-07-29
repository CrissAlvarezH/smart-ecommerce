"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useAction } from "next-safe-action/hooks";
import { createCollectionAction, updateCollectionAction } from "../actions";
import { toast } from "@/hooks/use-toast";

interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
}

interface CollectionFormProps {
  collection?: Collection;
  isEditing?: boolean;
}

export function CollectionForm({ collection, isEditing = false }: CollectionFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: collection?.name || "",
    slug: collection?.slug || "",
    description: collection?.description || "",
    imageUrl: collection?.imageUrl || "",
    isActive: collection?.isActive ?? true,
  });

  const { execute: createCollection, isExecuting: isCreating } = useAction(createCollectionAction, {
    onSuccess: () => {
      toast({
        title: "Collection created",
        description: "The collection has been successfully created.",
      });
      router.push("/admin/collections");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.error?.serverError || "Failed to create collection",
        variant: "destructive",
      });
    },
  });

  const { execute: updateCollection, isExecuting: isUpdating } = useAction(updateCollectionAction, {
    onSuccess: () => {
      toast({
        title: "Collection updated",
        description: "The collection has been successfully updated.",
      });
      router.push("/admin/collections");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.error?.serverError || "Failed to update collection",
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing && collection) {
      updateCollection({
        id: collection.id,
        ...formData,
      });
    } else {
      createCollection(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>
            {isEditing ? "Edit Collection" : "Collection Information"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Collection Name *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={handleNameChange}
                placeholder="e.g., Summer Collection"
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
                placeholder="e.g., summer-collection"
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
              placeholder="Brief description of this collection..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-sm text-gray-500">
              Optional image to represent this collection.
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
              Only active collections will be shown on the website.
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
                : (isEditing ? "Update Collection" : "Create Collection")
              }
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/collections")}
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