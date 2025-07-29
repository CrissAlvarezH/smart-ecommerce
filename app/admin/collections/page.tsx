import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, FolderOpen } from "lucide-react";
import Link from "next/link";
import * as collectionsRepo from "@/repositories/admin/collections";
import { CollectionsClient } from "./collections-client";

export default async function CollectionsPage() {
  const collections = await collectionsRepo.getCollections();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Collections</h2>
          <p className="text-gray-600 mt-2">
            Manage your product collections
          </p>
        </div>
        <Link href="/admin/collections/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Collection
          </Button>
        </Link>
      </div>

      <CollectionsClient initialCollections={collections} />
    </div>
  );
}