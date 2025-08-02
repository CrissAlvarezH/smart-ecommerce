import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Percent, Calendar } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDiscountByIdAction } from "../../actions";
import { DiscountProductsManager } from "./discount-products-manager";
import { BackButton } from "@/components/ui/back-button";
import { storeService } from "@/services/stores";

interface DiscountProductsPageProps {
  params: Promise<{ slug: string; id: string }>;
}

export default async function DiscountProductsPage({ params }: DiscountProductsPageProps) {
  const { slug, id } = await params;
  const store = await storeService.getStoreBySlug(slug);
  if (!store) {
    notFound();
  }

  const result = await getDiscountByIdAction({
    id: id,
    storeId: store.id,
  });

  const discount = result.data;

  if (!discount) {
    notFound();
  }

  const isExpired = new Date(discount.endDate) < new Date();
  const isActive = discount.isActive && !isExpired;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Manage Discount Products</h2>
            <p className="text-gray-600 mt-2">
              Add and remove products from &ldquo;{discount.name}&rdquo;
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Link href={`/stores/${slug}/admin/discounts/${discount.id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit Discount
            </Button>
          </Link>
        </div>
      </div>

      {/* Discount Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5" />
            Discount Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-500">Discount Name</label>
              <p className="text-lg font-semibold">{discount.name}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Percentage</label>
              <p className="text-lg font-semibold">{discount.percentage}% off</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">End Date</label>
              <p className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date(discount.endDate).toLocaleDateString()}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <div className="mt-1">
                <Badge variant={isActive ? "default" : "secondary"}>
                  {isActive ? "Active" : isExpired ? "Expired" : "Inactive"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Management */}
      <DiscountProductsManager
        discount={discount}
        storeSlug={slug}
        storeId={store.id}
      />
    </div>
  );
}