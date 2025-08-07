import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getStoreBySlugAction } from "../../../../../../actions";
import { getShippingZoneWithRatesAction } from "../../../../actions";
import { notFound } from "next/navigation";
import { ShippingRateForm } from "./shipping-rate-form";

interface NewRatePageProps {
  params: Promise<{
    slug: string;
    id: string;
  }>;
}

export default async function NewRatePage({ params }: NewRatePageProps) {
  const { slug, id } = await params;
  
  // Get store information first
  const storeResult = await getStoreBySlugAction({ slug });
  const store = storeResult.data?.store;
  
  if (!store) {
    notFound();
  }

  // Get zone information
  const zoneResult = await getShippingZoneWithRatesAction({ 
    zoneId: id, 
    storeId: store.id 
  });
  
  if (!zoneResult.data) {
    notFound();
  }
  
  const { zone } = zoneResult.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/stores/${slug}/admin/shipping/zones/${id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Zone
          </Button>
        </Link>
      </div>

      <div>
        <h2 className="text-3xl font-bold text-gray-900">Add Shipping Rate</h2>
        <p className="text-gray-600 mt-2">
          Create a new shipping rate for {zone.name}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rate Details</CardTitle>
          <CardDescription>
            Configure the pricing and conditions for this shipping option
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ShippingRateForm zoneId={id} slug={slug} />
        </CardContent>
      </Card>
    </div>
  );
}