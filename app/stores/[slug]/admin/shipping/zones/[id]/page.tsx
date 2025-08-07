import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { getShippingZoneWithRatesAction } from "../../actions";
import { getStoreBySlugAction } from "../../../../actions";
import { notFound } from "next/navigation";
import { ShippingRatesClient } from "./shipping-rates-client";

interface ZoneDetailsPageProps {
  params: Promise<{
    slug: string;
    id: string;
  }>;
}

export default async function ZoneDetailsPage({ params }: ZoneDetailsPageProps) {
  const { slug, id } = await params;
  
  // Get store information first
  const storeResult = await getStoreBySlugAction({ slug });
  const store = storeResult.data?.store;
  
  if (!store) {
    notFound();
  }
  
  // Fetch zone with rates
  const result = await getShippingZoneWithRatesAction({ 
    zoneId: id, 
    storeId: store.id 
  });
  
  if (!result.data) {
    notFound();
  }
  
  const { zone, rates } = result.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/stores/${slug}/admin/shipping`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Shipping
          </Button>
        </Link>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">{zone.name}</h2>
          <p className="text-gray-600 mt-2">
            Manage shipping rates for this zone
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/stores/${slug}/admin/shipping/zones/${id}/edit`}>
            <Button variant="outline">Edit Zone</Button>
          </Link>
          <Link href={`/stores/${slug}/admin/shipping/zones/${id}/rates/new`}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Rate
            </Button>
          </Link>
        </div>
      </div>

      {/* Zone Details */}
      <Card>
        <CardHeader>
          <CardTitle>Zone Coverage</CardTitle>
          <CardDescription>
            Geographical areas covered by this shipping zone
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {zone.countries && zone.countries.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Countries</h4>
                <div className="flex flex-wrap gap-2">
                  {zone.countries.map((country) => (
                    <span key={country} className="px-3 py-1 bg-gray-100 rounded-md text-sm">
                      {country}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {zone.states && zone.states.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">States/Provinces</h4>
                <div className="flex flex-wrap gap-2">
                  {zone.states.map((state) => (
                    <span key={state} className="px-3 py-1 bg-gray-100 rounded-md text-sm">
                      {state}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {zone.postalCodes && zone.postalCodes.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Postal Codes</h4>
                <div className="flex flex-wrap gap-2">
                  {zone.postalCodes.map((code) => (
                    <span key={code} className="px-3 py-1 bg-gray-100 rounded-md text-sm">
                      {code}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {(!zone.countries || zone.countries.length === 0) && 
             (!zone.states || zone.states.length === 0) && 
             (!zone.postalCodes || zone.postalCodes.length === 0) && (
              <p className="text-gray-500">This zone covers all locations (worldwide)</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Shipping Rates */}
      <Card>
        <CardHeader>
          <CardTitle>Shipping Rates</CardTitle>
          <CardDescription>
            Available shipping options for this zone
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ShippingRatesClient rates={rates} zoneId={id} slug={slug} />
        </CardContent>
      </Card>
    </div>
  );
}