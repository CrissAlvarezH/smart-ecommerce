import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, MapPin, Package, Truck } from "lucide-react";
import Link from "next/link";
import { getShippingZonesAction, getShippingMethodsAction } from "./actions";
import { getStoreBySlugAction } from "../../actions";
import { notFound } from "next/navigation";
import { ShippingZonesClient } from "./shipping-zones-client";
import { ShippingMethodsClient } from "./shipping-methods-client";

interface ShippingPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ShippingPage({ params }: ShippingPageProps) {
  const { slug } = await params;
  
  // Get store information first
  const storeResult = await getStoreBySlugAction({ slug });
  const store = storeResult.data?.store;
  
  if (!store) {
    notFound();
  }
  
  // Fetch shipping zones and methods
  const [zonesResult, methodsResult] = await Promise.all([
    getShippingZonesAction({ storeId: store.id }),
    getShippingMethodsAction({ storeId: store.id })
  ]);
  
  const zones = zonesResult.data?.zones || [];
  const methods = methodsResult.data?.methods || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Shipping</h2>
          <p className="text-gray-600 mt-2">
            Manage shipping zones, rates, and methods
          </p>
        </div>
      </div>

      {/* Shipping Zones */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Zones
              </CardTitle>
              <CardDescription>
                Define geographical regions and their shipping rates
              </CardDescription>
            </div>
            <Link href={`/stores/${slug}/admin/shipping/zones/new`}>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Zone
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <ShippingZonesClient zones={zones} storeId={store.id} slug={slug} />
        </CardContent>
      </Card>

      {/* Shipping Methods */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Shipping Methods
              </CardTitle>
              <CardDescription>
                Configure carriers and tracking options
              </CardDescription>
            </div>
            <Link href={`/stores/${slug}/admin/shipping/methods/new`}>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Method
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <ShippingMethodsClient methods={methods} storeId={store.id} slug={slug} />
        </CardContent>
      </Card>
    </div>
  );
}