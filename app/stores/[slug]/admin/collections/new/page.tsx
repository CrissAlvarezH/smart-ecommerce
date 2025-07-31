import { CollectionForm } from "../collection-form";
import { BackButton } from "@/components/ui/back-button";

interface NewCollectionPageProps {
  params: Promise<{ slug: string; }>;
}

export default async function NewCollectionPage({ params }: NewCollectionPageProps) {
  const { slug } = await params;
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <BackButton />
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Create Collection</h2>
          <p className="text-gray-600 mt-2">
            Add a new product collection to your store
          </p>
        </div>
      </div>

      <CollectionForm slug={slug} />
    </div>
  );
}