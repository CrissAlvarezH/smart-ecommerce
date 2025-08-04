"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Plus, Loader2, Check } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "@/hooks/use-toast";
import {
  addCollectionToDiscountAction,
  getAvailableCollectionsForDiscountAction,
} from "../actions";
import { cn } from "@/lib/utils";

interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
}

interface AddCollectionToDiscountDialogProps {
  discount: {
    id: string;
    name: string;
  };
  storeId: string;
  onCollectionAdded?: () => void;
}

export function AddCollectionToDiscountDialog({
  discount,
  storeId,
  onCollectionAdded,
}: AddCollectionToDiscountDialogProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);

  const { result: collectionsResult, isExecuting: isLoadingCollections, execute: fetchCollections } = useAction(
    getAvailableCollectionsForDiscountAction,
    {
      onError: (error) => {
        toast({
          title: "Error loading collections",
          description: error.error.serverError || "Failed to load available collections.",
          variant: "destructive",
        });
      },
    }
  );

  const { execute: addCollection, isExecuting: isAdding } = useAction(
    addCollectionToDiscountAction,
    {
      onSuccess: () => {
        if (selectedCollections.length === 1) {
          toast({
            title: "Collection added",
            description: "Collection has been added to the discount.",
          });
        }
      },
      onError: (error) => {
        toast({
          title: "Error adding collection",
          description: error.error.serverError || "Failed to add collection to discount.",
          variant: "destructive",
        });
      },
    }
  );

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      setSelectedCollections([]);
      setSearch("");
      fetchCollections({
        discountId: discount.id,
        storeId,
        search: "",
      });
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    fetchCollections({
      discountId: discount.id,
      storeId,
      search: value,
    });
  };

  const handleToggleCollection = (collectionId: string) => {
    setSelectedCollections((prev) =>
      prev.includes(collectionId)
        ? prev.filter((id) => id !== collectionId)
        : [...prev, collectionId]
    );
  };

  const handleAddCollections = async () => {
    if (selectedCollections.length === 0) return;

    const promises = selectedCollections.map((collectionId) =>
      addCollection({
        discountId: discount.id,
        collectionId,
      })
    );

    await Promise.all(promises);

    if (selectedCollections.length > 1) {
      toast({
        title: "Collections added",
        description: `${selectedCollections.length} collections have been added to the discount.`,
      });
    }

    onCollectionAdded?.();
    setOpen(false);
  };

  const collections = collectionsResult?.data || [];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Collections
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Collections to Discount</DialogTitle>
          <DialogDescription>
            Select collections to apply the &quot;{discount.name}&quot; discount to all their products.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search collections..."
              value={search}
              onValueChange={handleSearchChange}
            />
            <CommandList className="max-h-[400px]">
              {isLoadingCollections ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : collections.length === 0 ? (
                <CommandEmpty>No collections available to add.</CommandEmpty>
              ) : (
                <CommandGroup>
                  {collections.map((collection) => (
                    <CommandItem
                      key={collection.id}
                      value={collection.id}
                      onSelect={() => handleToggleCollection(collection.id)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className={cn(
                            "h-4 w-4 border rounded-sm flex items-center justify-center",
                            selectedCollections.includes(collection.id)
                              ? "bg-primary border-primary"
                              : "border-input"
                          )}
                        >
                          {selectedCollections.includes(collection.id) && (
                            <Check className="h-3 w-3 text-primary-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{collection.name}</div>
                          {collection.description && (
                            <div className="text-sm text-muted-foreground truncate">
                              {collection.description}
                            </div>
                          )}
                        </div>
                        <Badge variant={collection.isActive ? "default" : "secondary"}>
                          {collection.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAddCollections}
            disabled={isAdding || selectedCollections.length === 0}
          >
            {isAdding && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Add {selectedCollections.length > 0 && `(${selectedCollections.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}