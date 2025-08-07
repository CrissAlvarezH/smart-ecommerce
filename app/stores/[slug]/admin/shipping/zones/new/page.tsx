import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getStoreBySlugAction } from "../../../../actions";
import { notFound } from "next/navigation";
import { ShippingZoneForm } from "./shipping-zone-form";

interface NewZonePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function NewZonePage({ params }: NewZonePageProps) {
  const { slug } = await params;
  
  // Get store information first
  const storeResult = await getStoreBySlugAction({ slug });
  const store = storeResult.data?.store;
  
  if (!store) {
    notFound();
  }

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

      <div>
        <h2 className="text-3xl font-bold text-gray-900">Create Shipping Zone</h2>
        <p className="text-gray-600 mt-2">
          Define a geographical region for shipping rates
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Zone Details</CardTitle>
          <CardDescription>
            Set up the coverage area and basic information for this shipping zone
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ShippingZoneForm storeId={store.id} slug={slug} />
        </CardContent>
      </Card>
    </div>
  );
}