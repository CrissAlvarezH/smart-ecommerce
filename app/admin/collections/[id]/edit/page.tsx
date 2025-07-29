import { CollectionForm } from "../../collection-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import * as collectionsRepo from "@/repositories/admin/collections";

interface EditCollectionPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditCollectionPage({ params }: EditCollectionPageProps) {
  const { id } = await params;
  
  // Fetch collection data
  const collection = await collectionsRepo.getCollectionById(id);

  // If collection doesn't exist, show 404
  if (!collection) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/collections">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Edit Collection</h2>
          <p className="text-gray-600 mt-2">
            Update collection information for "{collection.name}"
          </p>
        </div>
      </div>

      <CollectionForm 
        collection={collection}
        isEditing={true}
      />
    </div>
  );
}