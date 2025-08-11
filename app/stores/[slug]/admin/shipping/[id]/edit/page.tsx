import { notFound } from "next/navigation";
import { getStoreBySlugAction } from "../../../../actions";
import { getShippingZoneByIdAction } from "../../actions";
import EditShippingZoneForm from "./edit-shipping-zone-form";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function EditShippingZonePage({ 
  params 
}: { 
  params: { slug: string; id: string } 
}) {
  const storeResult = await getStoreBySlugAction({ slug: params.slug });
  
  if (!storeResult.data?.store) {
    notFound();
  }

  const store = storeResult.data.store;
  const zoneResult = await getShippingZoneByIdAction({ id: params.id, storeId: store.id });
  
  if (!zoneResult.data) {
    notFound();
  }

  const zone = zoneResult.data;

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
          <h1 className="text-3xl font-bold">Edit Shipping Zone</h1>
          <p className="text-muted-foreground mt-1">
            Update shipping zone details and coverage
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        <EditShippingZoneForm 
          storeId={store.id} 
          storeSlug={params.slug}
          initialData={{
            id: zone.id,
            name: zone.name,
            departments: zone.departments as string[],
            cities: zone.cities as string[],
            price: zone.price || "0",
            isActive: zone.isActive,
          }}
        />
      </div>
    </div>
  );
}