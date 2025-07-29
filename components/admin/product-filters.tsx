"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Filter, X } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface Collection {
  id: string;
  name: string;
}

interface ProductFiltersProps {
  categories: Category[];
  collections: Collection[];
}

export function ProductFilters({ categories, collections }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const currentCategoryId = searchParams.get("categoryId");
  const currentCollectionId = searchParams.get("collectionId");
  
  // Local state for pending filter selections
  const [pendingCategoryId, setPendingCategoryId] = useState<string | null>(null);
  const [pendingCollectionId, setPendingCollectionId] = useState<string | null>(null);

  // Initialize pending state when dialog opens
  const handleDialogOpen = (open: boolean) => {
    if (open) {
      setPendingCategoryId(currentCategoryId);
      setPendingCollectionId(currentCollectionId);
    }
    setIsOpen(open);
  };
  
  const selectedCategory = categories.find(c => c.id === currentCategoryId);
  const selectedCollection = collections.find(c => c.id === currentCollectionId);

  const hasActiveFilters = currentCategoryId || currentCollectionId;

  const updatePendingFilter = (key: string, value: string | null) => {
    if (key === "categoryId") {
      setPendingCategoryId(value === "all" ? null : value);
    } else if (key === "collectionId") {
      setPendingCollectionId(value === "all" ? null : value);
    }
  };

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    // Reset to first page when filtering
    params.delete("page");
    
    router.push(`?${params.toString()}`);
  };

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Apply pending category filter
    if (pendingCategoryId) {
      params.set("categoryId", pendingCategoryId);
    } else {
      params.delete("categoryId");
    }
    
    // Apply pending collection filter
    if (pendingCollectionId) {
      params.set("collectionId", pendingCollectionId);
    } else {
      params.delete("collectionId");
    }
    
    // Reset to first page when filtering
    params.delete("page");
    
    router.push(`?${params.toString()}`);
    setIsOpen(false);
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("categoryId");
    params.delete("collectionId");
    params.delete("page");
    router.push(`?${params.toString()}`);
    setIsOpen(false);
  };

  const clearPendingFilters = () => {
    setPendingCategoryId(null);
    setPendingCollectionId(null);
  };

  const hasPendingChanges = pendingCategoryId !== currentCategoryId || pendingCollectionId !== currentCollectionId;

  return (
    <div className="flex items-center gap-2">
      <Dialog open={isOpen} onOpenChange={handleDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={hasActiveFilters ? "border-blue-500 bg-blue-50" : ""}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter
            {hasActiveFilters && (
              <span className="ml-1 bg-blue-500 text-white text-xs rounded-full px-1.5 py-0.5">
                {(currentCategoryId ? 1 : 0) + (currentCollectionId ? 1 : 0)}
              </span>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Filter Products</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-6 pr-2">
            {/* Category Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Category</Label>
              <RadioGroup 
                value={pendingCategoryId || "all"} 
                onValueChange={(value) => updatePendingFilter("categoryId", value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all-categories" />
                  <Label htmlFor="all-categories">All Categories</Label>
                </div>
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={category.id} id={`category-${category.id}`} />
                    <Label htmlFor={`category-${category.id}`}>{category.name}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <Separator />

            {/* Collection Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Collection</Label>
              <RadioGroup 
                value={pendingCollectionId || "all"} 
                onValueChange={(value) => updatePendingFilter("collectionId", value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all-collections" />
                  <Label htmlFor="all-collections">All Collections</Label>
                </div>
                {collections.map((collection) => (
                  <div key={collection.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={collection.id} id={`collection-${collection.id}`} />
                    <Label htmlFor={`collection-${collection.id}`}>{collection.name}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
          
          {/* Action Buttons - Fixed at bottom */}
          <div className="flex-shrink-0 border-t pt-4 mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearPendingFilters}
                  className="text-gray-600 hover:text-gray-700"
                >
                  Reset
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={applyFilters} disabled={!hasPendingChanges}>
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Active filters display */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2">
          {selectedCategory && (
            <div className="flex items-center gap-3 bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm">
              <div>
                <p className="text-xs font-light">Category:</p>
                <p className="text-xs font-semibold">{selectedCategory.name}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateFilter("categoryId", null)}
                className="h-4 w-4 p-0 hover:bg-blue-200"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
          
          {selectedCollection && (
            <div className="flex items-center gap-3 bg-green-100 text-green-800 px-2 py-1 rounded-md text-sm">
              <div>
                <p className="text-xs font-light">Collection:</p>
                <p className="text-xs font-semibold">{selectedCollection.name}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateFilter("collectionId", null)}
                className="h-4 w-4 p-0 hover:bg-green-200"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}