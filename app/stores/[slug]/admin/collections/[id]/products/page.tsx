import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Package } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import * as collectionsRepo from "@/repositories/admin/collections";
import { CollectionProductsManager } from "./collection-products-manager";
import { BackButton } from "@/components/ui/back-button";

interface CollectionProductsPageProps {
  params: Promise<{ slug: string; id: string }>;
  searchParams: Promise<{
    page?: string;
    availablePage?: string;
    search?: string;
    availableSearch?: string;
  }>;
}

export default async function CollectionProductsPage({ params }: CollectionProductsPageProps) {
  const { slug, id } = await params;
  const collection = await collectionsRepo.getCollectionById(id);

  if (!collection) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BackButton></BackButton>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Manage Collection Products</h2>
            <p className="text-gray-600 mt-2">
              Add and remove products from &ldquo;{collection.name}&rdquo;
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Link href={`/stores/${slug}/admin/collections/${collection.id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit Collection
            </Button>
          </Link>
        </div>
      </div>

      {/* Collection Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Collection Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-500">Collection Name</label>
              <p className="text-lg font-semibold">{collection.name}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <div className="mt-1">
                <Badge variant={collection.isActive ? "default" : "secondary"}>
                  {collection.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Management */}
      <CollectionProductsManager
        collection={collection}
      />
    </div>
  );
}