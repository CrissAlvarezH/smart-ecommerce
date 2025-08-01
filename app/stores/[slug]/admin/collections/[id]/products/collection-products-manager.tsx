import { CollectionProductsList } from "./collection-products-list";

interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  storeId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CollectionProductsManagerProps {
  collection: Collection;
}

export function CollectionProductsManager({
  collection,
}: CollectionProductsManagerProps) {
  return (
    <div className="w-full">
      <CollectionProductsList collection={collection} />
    </div>
  );
}