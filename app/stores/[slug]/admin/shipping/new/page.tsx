import { notFound } from "next/navigation";
import { getStoreBySlugAction } from "../../../actions";
import ShippingZoneForm from "./shipping-zone-form";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function NewShippingZonePage({ 
  params 
}: { 
  params: { slug: string } 
}) {
  const storeResult = await getStoreBySlugAction({ slug: params.slug });
  
  if (!storeResult.data?.store) {
    notFound();
  }

  const store = storeResult.data.store;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/stores/${params.slug}/admin/shipping`}>
          <Button variant="ghost" size="sm">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Create Shipping Zone</h1>
          <p className="text-muted-foreground mt-1">
            Define a new shipping zone with Colombian departments and cities
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        <ShippingZoneForm storeId={store.id} storeSlug={params.slug} />
      </div>
    </div>
  );
}