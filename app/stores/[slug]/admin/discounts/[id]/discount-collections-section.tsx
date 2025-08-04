"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package2, Minus, Loader2 } from "lucide-react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { getDiscountCollectionsAction, removeCollectionFromDiscountAction } from "../actions";
import { AddCollectionToDiscountDialog } from "./add-collection-dialog";

interface Discount {
  id: string;
  name: string;
  percentage: string;
  endDate: Date;
  storeId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
}

interface DiscountCollectionsSectionProps {
  discount: Discount;
  storeId: string;
  onCollectionsChange?: () => void;
}

export function DiscountCollectionsSection({
  discount,
  storeId,
  onCollectionsChange,
}: DiscountCollectionsSectionProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  
  const { result, isExecuting, execute: fetchCollections } = useAction(getDiscountCollectionsAction, {
    onSuccess: (result) => {
      setCollections(result.data || []);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to load discount collections.",
        variant: "destructive",
      });
    },
  });

  const { execute: removeCollection, isExecuting: isRemoving } = useAction(
    removeCollectionFromDiscountAction,
    {
      onSuccess: () => {
        toast({
          title: "Collection removed",
          description: "Collection has been removed from the discount.",
        });
        refetchCollections();
        onCollectionsChange?.();
      },
      onError: (error) => {
        toast({
          title: "Error removing collection",
          description: error.error.serverError || "Failed to remove collection from discount.",
          variant: "destructive",
        });
      },
    }
  );

  const refetchCollections = () => {
    fetchCollections({ discountId: discount.id });
  };

  useEffect(() => {
    refetchCollections();
  }, [discount.id, fetchCollections]);

  const handleRemoveCollection = (collectionId: string) => {
    removeCollection({
      discountId: discount.id,
      collectionId,
    });
  };

  const handleCollectionAdded = () => {
    refetchCollections();
    onCollectionsChange?.();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package2 className="h-5 w-5" />
              Assigned Collections ({collections.length})
            </CardTitle>
            <CardDescription>
              Collections that have this discount applied to all their products
            </CardDescription>
          </div>
          <AddCollectionToDiscountDialog
            discount={discount}
            storeId={storeId}
            onCollectionAdded={handleCollectionAdded}
          />
        </div>
      </CardHeader>
      <CardContent>
        {isExecuting ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-500">Loading collections...</p>
          </div>
        ) : collections.length === 0 ? (
          <div className="text-center py-8">
            <Package2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No collections assigned</h3>
            <p className="text-muted-foreground mb-4">
              This discount is not yet applied to any collections.
            </p>
            <AddCollectionToDiscountDialog
              discount={discount}
              storeId={storeId}
              onCollectionAdded={handleCollectionAdded}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {collections.map((collection) => (
              <div
                key={collection.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 truncate">
                        {collection.name}
                      </h4>
                      {collection.description && (
                        <p className="text-sm text-gray-500 mt-1 truncate">
                          {collection.description}
                        </p>
                      )}
                    </div>
                    <Badge variant={collection.isActive ? "default" : "secondary"}>
                      {collection.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isRemoving}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Remove Collection from Discount</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to remove &quot;{collection.name}&quot; from the discount &quot;{discount.name}&quot;? 
                          This will remove the discount from all products in this collection.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <DialogClose asChild>
                          <Button
                            variant="destructive"
                            onClick={() => handleRemoveCollection(collection.id)}
                            disabled={isRemoving}
                          >
                            Remove Collection
                          </Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}