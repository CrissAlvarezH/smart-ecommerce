import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getStoreBySlugAction } from "../../../../actions";
import { notFound } from "next/navigation";
import { ShippingMethodForm } from "./shipping-method-form";

interface NewMethodPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function NewMethodPage({ params }: NewMethodPageProps) {
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
        <h2 className="text-3xl font-bold text-gray-900">Add Shipping Method</h2>
        <p className="text-gray-600 mt-2">
          Configure a carrier or delivery method
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Method Details</CardTitle>
          <CardDescription>
            Set up carrier information and tracking options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ShippingMethodForm storeId={store.id} slug={slug} />
        </CardContent>
      </Card>
    </div>
  );
}