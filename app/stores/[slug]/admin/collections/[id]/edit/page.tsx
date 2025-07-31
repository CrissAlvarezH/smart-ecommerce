import { CollectionForm } from "../../collection-form";
import { notFound } from "next/navigation";
import * as collectionsRepo from "@/repositories/admin/collections";
import { BackButton } from "@/components/ui/back-button";

interface EditCollectionPageProps {
  params: Promise<{
    slug: string;
    id: string;
  }>;
}

export default async function EditCollectionPage({ params }: EditCollectionPageProps) {
  const { slug, id } = await params;
  
  // Fetch collection data
  const collection = await collectionsRepo.getCollectionById(id);

  // If collection doesn't exist, show 404
  if (!collection) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <BackButton />
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Edit Collection</h2>
          <p className="text-gray-600 mt-2">
            Update collection information for &ldquo;{collection.name}&rdquo;
          </p>
        </div>
      </div>

      <CollectionForm 
        collection={collection}
        isEditing={true}
        slug={slug}
      />
    </div>
  );
}