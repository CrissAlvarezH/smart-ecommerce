import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Percent, Calendar, Package, Edit } from "lucide-react";
import Link from "next/link";
import { getDiscountByIdAction, getDiscountProductsAction } from "../actions";
import { notFound } from "next/navigation";
import { storeService } from "@/services/stores";
import { DiscountProductsSection } from "./discount-products-section";
import { BackButton } from "@/components/ui/back-button";

interface DiscountPageProps {
  params: Promise<{ slug: string; id: string }>;
}

export default async function DiscountPage({ params }: DiscountPageProps) {
  const { slug, id } = await params;
  const store = await storeService.getStoreBySlug(slug);
  if (!store) {
    notFound();
  }

  const discountResult = await getDiscountByIdAction({ id: id, storeId: store.id });
  const discount = discountResult.data;

  if (!discount) {
    notFound();
  }

  const isExpired = new Date(discount.endDate) < new Date();
  const isActive = discount.isActive && !isExpired;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              {discount.name}
              <Badge variant={isActive ? "default" : "secondary"}>
                {isActive ? "Active" : isExpired ? "Expired" : "Inactive"}
              </Badge>
            </h1>
            <p className="text-muted-foreground">
              Manage discount details and assigned products
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/stores/${slug}/admin/discounts/${id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Discount Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{discount.percentage}% off</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Expires {new Date(discount.endDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span>Products with discount</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Active Status:</span>
                <Badge variant={discount.isActive ? "default" : "secondary"}>
                  {discount.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Expiry Status:</span>
                <Badge variant={isExpired ? "destructive" : "default"}>
                  {isExpired ? "Expired" : "Valid"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <DiscountProductsSection
        discount={discount}
        storeId={store.id}
      />
    </div>
  );
}