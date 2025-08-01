"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAction } from "next-safe-action/hooks";
import { 
  createProductAction, 
  updateProductAction,
  addProductImageAction,
  deleteProductImageAction,
  getProductImagesAction,
  updateProductImageAction,
  reorderProductImagesAction
} from "./actions";
import { toast } from "@/hooks/use-toast";
import { ProductImageManager } from "@/components/admin/product-image-manager";

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  price: string;
  compareAtPrice: string | null;
  sku: string | null;
  inventory: number;
  weight: string | null;
  categoryId: string | null;
  isActive: boolean;
  isFeatured: boolean;
}

interface ProductFormProps {
  categories: Category[];
  product?: Product;
  isEditing?: boolean;
  slug: string;
  storeId: string;
}

export function ProductForm({ categories, product, isEditing = false, slug, storeId }: ProductFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: product?.name || "",
    slug: product?.slug || "",
    description: product?.description || "",
    shortDescription: product?.shortDescription || "",
    price: product?.price || "",
    compareAtPrice: product?.compareAtPrice || "",
    sku: product?.sku || "",
    inventory: product?.inventory || 0,
    weight: product?.weight || "",
    categoryId: product?.categoryId || "",
    isActive: product?.isActive ?? true,
    isFeatured: product?.isFeatured ?? false,
  });

  const [errors, setErrors] = useState({
    price: "",
    compareAtPrice: "",
  });

  const { execute: createProduct, isExecuting: isCreating } = useAction(createProductAction, {
    onSuccess: () => {
      toast({
        title: "Product created",
        description: "The product has been successfully created.",
      });
      router.push(`/stores/${slug}/admin/products`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.error?.serverError || "Failed to create product",
        variant: "destructive",
      });
    },
  });

  const { execute: updateProduct, isExecuting: isUpdating } = useAction(updateProductAction, {
    onSuccess: () => {
      toast({
        title: "Product updated",
        description: "The product has been successfully updated.",
      });
      router.push(`/stores/${slug}/admin/products`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.error?.serverError || "Failed to update product",
        variant: "destructive",
      });
    },
  });

  const isLoading = isCreating || isUpdating;
  const hasErrors = errors.price || errors.compareAtPrice;

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const validatePrice = (value: string, fieldName: "price" | "compareAtPrice") => {
    if (!value && fieldName === "compareAtPrice") {
      // Compare at price is optional
      setErrors(prev => ({ ...prev, [fieldName]: "" }));
      return true;
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) {
      const errorMessage = fieldName === "price" 
        ? "Price must be greater than 0" 
        : "Compare at price must be greater than 0";
      setErrors(prev => ({ ...prev, [fieldName]: errorMessage }));
      return false;
    }

    // Additional validation for compareAtPrice
    if (fieldName === "compareAtPrice" && formData.price) {
      const price = parseFloat(formData.price);
      if (!isNaN(price) && numValue <= price) {
        setErrors(prev => ({ ...prev, compareAtPrice: "Compare at price must be greater than the regular price" }));
        return false;
      }
    }

    setErrors(prev => ({ ...prev, [fieldName]: "" }));
    return true;
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }));
  };

  const handlePriceChange = (value: string, fieldName: "price" | "compareAtPrice") => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    validatePrice(value, fieldName);
    
    // If regular price changed, revalidate compare at price if it exists
    if (fieldName === "price" && formData.compareAtPrice) {
      validatePrice(formData.compareAtPrice, "compareAtPrice");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all prices and set error states
    const isPriceValid = validatePrice(formData.price, "price");
    const isCompareAtPriceValid = validatePrice(formData.compareAtPrice, "compareAtPrice");

    // Additional validation: check if compareAtPrice > price
    if (formData.compareAtPrice && formData.price) {
      const price = parseFloat(formData.price);
      const compareAtPrice = parseFloat(formData.compareAtPrice);
      if (!isNaN(price) && !isNaN(compareAtPrice) && compareAtPrice <= price) {
        setErrors(prev => ({ ...prev, compareAtPrice: "Compare at price must be greater than the regular price" }));
        return;
      }
    }

    // Don't submit if there are validation errors
    if (!isPriceValid || !isCompareAtPriceValid) {
      return;
    }

    const productData = {
      ...formData,
      inventory: Number(formData.inventory),
      categoryId: formData.categoryId || undefined,
      storeId,
    };

    if (isEditing && product) {
      updateProduct({
        id: product.id,
        ...productData,
      });
    } else {
      createProduct(productData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Product Images - Show at top when editing existing product */}
      {isEditing && product?.id && (
        <ProductImageManager 
          productId={product.id} 
          actions={{
            addProductImageAction,
            deleteProductImageAction,
            getProductImagesAction,
            updateProductImageAction,
            reorderProductImagesAction
          }}
        />
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={handleNameChange}
                placeholder="e.g., Wireless Bluetooth Headphones"
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
                placeholder="e.g., wireless-bluetooth-headphones"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shortDescription">Short Description</Label>
            <Textarea
              id="shortDescription"
              value={formData.shortDescription}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              placeholder="Brief product description..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Full Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed product description..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Pricing & Inventory */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing & Inventory</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.price}
                onChange={(e) => handlePriceChange(e.target.value, "price")}
                placeholder="0.01"
                required
                className={errors.price ? "border-red-500 focus:border-red-500" : ""}
              />
              {errors.price && (
                <p className="text-sm text-red-500 mt-1">{errors.price}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="compareAtPrice">Compare At Price</Label>
              <Input
                id="compareAtPrice"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.compareAtPrice}
                onChange={(e) => handlePriceChange(e.target.value, "compareAtPrice")}
                placeholder="0.01"
                className={errors.compareAtPrice ? "border-red-500 focus:border-red-500" : ""}
              />
              {errors.compareAtPrice && (
                <p className="text-sm text-red-500 mt-1">{errors.compareAtPrice}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="inventory">Inventory *</Label>
              <Input
                id="inventory"
                type="number"
                min="0"
                value={formData.inventory}
                onChange={(e) => setFormData({ ...formData, inventory: Number(e.target.value) })}
                placeholder="0"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Organization */}
      <Card>
        <CardHeader>
          <CardTitle>Organization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              {categories.length > 0 ? (
                <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">
                    No categories available.{" "}
                    <Link 
                      href={`/stores/${slug}/admin/categories/new`}
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      Add a category
                    </Link>
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="e.g., WBH-001"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="weight">Weight (optional)</Label>
            <Input
              id="weight"
              type="number"
              step="0.01"
              min="0"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              placeholder="0.00"
            />
            <p className="text-sm text-gray-500">Weight in pounds or kilograms</p>
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
            <Label htmlFor="isActive">Active</Label>
            <p className="text-sm text-gray-500">
              Only active products will be shown on the website.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isFeatured"
              checked={formData.isFeatured}
              onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked })}
            />
            <Label htmlFor="isFeatured">Featured</Label>
            <p className="text-sm text-gray-500">
              Featured products will be highlighted on the home page.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex gap-4">
        <Button
          type="submit"
          disabled={isLoading || hasErrors}
          className="min-w-[100px]"
        >
          {isLoading 
            ? (isEditing ? "Updating..." : "Creating...") 
            : (isEditing ? "Update Product" : "Create Product")
          }
        </Button>
        
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/stores/${slug}/admin/products`)}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}