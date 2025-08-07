import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getStoreBySlugAction } from "../../../../../actions";
import * as shippingRepository from "@/repositories/admin/shipping-repository";
import { notFound } from "next/navigation";
import { EditShippingMethodForm } from "./edit-shipping-method-form";

interface EditMethodPageProps {
  params: Promise<{
    slug: string;
    id: string;
  }>;
}

export default async function EditMethodPage({ params }: EditMethodPageProps) {
  const { slug, id } = await params;
  
  // Get store information first
  const storeResult = await getStoreBySlugAction({ slug });
  const store = storeResult.data?.store;
  
  if (!store) {
    notFound();
  }
  
  // Get method information
  const method = await shippingRepository.getShippingMethodById(id, store.id);
  
  if (!method) {
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
        <h2 className="text-3xl font-bold text-gray-900">Edit Shipping Method</h2>
        <p className="text-gray-600 mt-2">
          Update carrier information and tracking options
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Method Details</CardTitle>
          <CardDescription>
            Modify carrier information and tracking options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditShippingMethodForm method={method} storeId={store.id} slug={slug} />
        </CardContent>
      </Card>
    </div>
  );
}