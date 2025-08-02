import { DiscountForm } from "../discount-form";
import { notFound } from "next/navigation";
import { storeService } from "@/services/stores";

interface NewDiscountPageProps {
  params: Promise<{ slug: string }>;
}

export default async function NewDiscountPage({ params }: NewDiscountPageProps) {
  const { slug } = await params;
  const store = await storeService.getStoreBySlug(slug);
  if (!store) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Discount</h1>
        <p className="text-muted-foreground">
          Create a new discount to offer promotions to your customers
        </p>
      </div>

      <DiscountForm slug={slug} storeId={store.id} />
    </div>
  );
}