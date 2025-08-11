import { getShippingZonesAction } from "./actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, MapPin, DollarSign, ToggleLeft, ToggleRight } from "lucide-react";
import { notFound } from "next/navigation";
import { getStoreBySlugAction } from "../../actions";
import ShippingZoneActions from "./shipping-zone-actions";

export default async function ShippingZonesPage({ 
  params 
}: { 
  params: { slug: string } 
}) {
  const storeResult = await getStoreBySlugAction({ slug: params.slug });
  
  if (!storeResult.data?.store) {
    notFound();
  }

  const store = storeResult.data.store;
  const zonesResult = await getShippingZonesAction({ storeId: store.id });
  const zones = zonesResult.data || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Shipping Zones</h1>
          <p className="text-muted-foreground mt-1">
            Manage shipping zones and rates for different regions in Colombia
          </p>
        </div>
        <Link href={`/stores/${params.slug}/admin/shipping/new`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Shipping Zone
          </Button>
        </Link>
      </div>

      {zones.length === 0 ? (
        <div className="border rounded-lg p-12 text-center">
          <MapPin className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No shipping zones yet</h2>
          <p className="text-muted-foreground mb-4">
            Create your first shipping zone to start managing delivery rates
          </p>
          <Link href={`/stores/${params.slug}/admin/shipping/new`}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Shipping Zone
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {zones.map((zone) => (
            <div
              key={zone.id}
              className="border rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{zone.name}</h3>
                    {zone.isActive ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Inactive
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {(zone.departments as string[]).length} department{(zone.departments as string[]).length !== 1 ? 's' : ''}, {(zone.cities as string[]).length} cit{(zone.cities as string[]).length !== 1 ? 'ies' : 'y'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      <span>${zone.price}</span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <p className="text-sm text-muted-foreground">
                      <strong>Departments:</strong> {(zone.departments as string[]).slice(0, 3).join(", ")}
                      {(zone.departments as string[]).length > 3 && ` +${(zone.departments as string[]).length - 3} more`}
                    </p>
                  </div>
                </div>

                <ShippingZoneActions
                  zone={zone}
                  storeSlug={params.slug}
                  storeId={store.id}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}