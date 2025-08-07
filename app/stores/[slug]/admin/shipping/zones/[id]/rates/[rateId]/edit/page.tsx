import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getStoreBySlugAction } from "../../../../../../../actions";
import * as shippingRepository from "@/repositories/admin/shipping-repository";
import { notFound } from "next/navigation";
import { EditShippingRateForm } from "./edit-shipping-rate-form";

interface EditRatePageProps {
  params: Promise<{
    slug: string;
    id: string;
    rateId: string;
  }>;
}

export default async function EditRatePage({ params }: EditRatePageProps) {
  const { slug, id, rateId } = await params;
  
  // Get store information first
  const storeResult = await getStoreBySlugAction({ slug });
  const store = storeResult.data?.store;
  
  if (!store) {
    notFound();
  }
  
  // Get zone and rate information
  const [zone, rate] = await Promise.all([
    shippingRepository.getShippingZoneById(id, store.id),
    shippingRepository.getShippingRateById(rateId)
  ]);
  
  if (!zone || !rate) {
    notFound();
  }

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
        <h2 className="text-3xl font-bold text-gray-900">Edit Shipping Rate</h2>
        <p className="text-gray-600 mt-2">
          Update the shipping rate for {zone.name}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rate Details</CardTitle>
          <CardDescription>
            Modify the pricing and conditions for this shipping option
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditShippingRateForm rate={rate} zoneId={id} slug={slug} />
        </CardContent>
      </Card>
    </div>
  );
}