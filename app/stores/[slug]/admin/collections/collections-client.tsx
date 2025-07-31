"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Edit, Trash2, Search, FolderOpen, Plus, Package } from "lucide-react";
import Link from "next/link";
import { useAction } from "next-safe-action/hooks";
import { deleteCollectionAction } from "../actions";
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

interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface CollectionsClientProps {
  initialCollections: Collection[];
  slug: string;
}

export function CollectionsClient({ initialCollections, slug }: CollectionsClientProps) {
  const [collections, setCollections] = useState(initialCollections);
  const [searchTerm, setSearchTerm] = useState("");

  const { execute: deleteCollection, isExecuting: isDeleting } = useAction(deleteCollectionAction, {
    onSuccess: () => {
      toast({
        title: "Collection deleted",
        description: "The collection has been successfully deleted.",
      });
      // Refresh collections list
      window.location.reload();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.error?.serverError || "Failed to delete collection",
        variant: "destructive",
      });
    },
  });

  const filteredCollections = collections.filter(collection =>
    collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    collection.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    deleteCollection({ id });
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search collections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Collections List */}
      <Card>
        <CardHeader>
          <CardTitle>Collections ({filteredCollections.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCollections.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FolderOpen className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p>No collections found.</p>
              <p className="text-sm mt-2">
                {searchTerm ? "Try adjusting your search." : "Create your first collection to get started."}
              </p>
              {!searchTerm && (
                <Link href={`/stores/${slug}/admin/collections/new`}>
                  <Button className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Collection
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCollections.map((collection) => (
                <div
                  key={collection.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{collection.name}</h3>
                      <Badge variant={collection.isActive ? "default" : "secondary"}>
                        {collection.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Slug: {collection.slug}
                    </p>
                    {collection.description && (
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {collection.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-400">
                      Created: {new Date(collection.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Link href={`/stores/${slug}/admin/collections/${collection.id}/products`}>
                      <Button variant="outline" size="sm">
                        <Package className="h-4 w-4" />
                      </Button>
                    </Link>
                    
                    <Link href={`/stores/${slug}/admin/collections/${collection.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" disabled={isDeleting}>
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Collection</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete &ldquo;{collection.name}&rdquo;? This action cannot be undone.
                            Products will be removed from this collection.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                          </DialogClose>
                          <Button
                            onClick={() => handleDelete(collection.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </Button>
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
    </div>
  );
}