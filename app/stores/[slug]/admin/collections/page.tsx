import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, FolderOpen } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import * as collectionsRepo from "@/repositories/admin/collections";
import { storeRepository } from "@/repositories/stores";
import { CollectionsClient } from "./collections-client";

interface CollectionsPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CollectionsPage({ params }: CollectionsPageProps) {
  const { slug } = await params;
  
  // Get store by slug
  const store = await storeRepository.findBySlug(slug);
  if (!store) {
    notFound();
  }
  
  // Get collections filtered by store ID
  const collections = await collectionsRepo.getCollections(50, 0, undefined, store.id);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Collections</h2>
          <p className="text-gray-600 mt-2">
            Manage your product collections
          </p>
        </div>
        <Link href={`/stores/${slug}/admin/collections/new`}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Collection
          </Button>
        </Link>
      </div>

      <CollectionsClient initialCollections={collections} slug={slug} />
    </div>
  );
}