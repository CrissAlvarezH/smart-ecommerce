import { DiscountForm } from "../../discount-form";
import { getDiscountByIdAction } from "../../actions";
import { notFound } from "next/navigation";
import { storeService } from "@/services/stores";
import { BackButton } from "@/components/ui/back-button";

interface EditDiscountPageProps {
  params: Promise<{ slug: string; id: string }>;
}

export default async function EditDiscountPage({ params }: EditDiscountPageProps) {
  const { slug, id } = await params;
  const store = await storeService.getStoreBySlug(slug);
  if (!store) {
    notFound();
  }

  const result = await getDiscountByIdAction({
    id: id,
    storeId: store.id,
  });

  const discount = result.data;

  if (!discount) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <BackButton />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Discount</h1>
          <p className="text-muted-foreground">
            Update the discount details and settings
          </p>
        </div>
      </div>

      <DiscountForm
        discount={discount}
        isEditing={true}
        slug={slug}
        storeId={store.id}
      />
    </div>
  );
}