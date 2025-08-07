import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getStoreBySlugAction } from "../../../../../actions";
import { getShippingZoneWithRatesAction } from "../../../actions";
import { notFound } from "next/navigation";
import { EditShippingZoneForm } from "./edit-shipping-zone-form";

interface EditZonePageProps {
  params: Promise<{
    slug: string;
    id: string;
  }>;
}

export default async function EditZonePage({ params }: EditZonePageProps) {
  const { slug, id } = await params;
  
  // Get store information first
  const storeResult = await getStoreBySlugAction({ slug });
  const store = storeResult.data?.store;
  
  if (!store) {
    notFound();
  }
  
  // Fetch zone information
  const result = await getShippingZoneWithRatesAction({ 
    zoneId: id, 
    storeId: store.id 
  });
  
  if (!result.data) {
    notFound();
  }
  
  const { zone } = result.data;

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
        <h2 className="text-3xl font-bold text-gray-900">Edit Shipping Zone</h2>
        <p className="text-gray-600 mt-2">
          Update the coverage area and settings for {zone.name}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Zone Details</CardTitle>
          <CardDescription>
            Modify the geographical coverage and basic information for this shipping zone
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditShippingZoneForm zone={zone} storeId={store.id} slug={slug} />
        </CardContent>
      </Card>
    </div>
  );
}