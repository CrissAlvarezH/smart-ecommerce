import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Percent, Plus, Calendar, Package } from "lucide-react";
import Link from "next/link";
import { getDiscountsPageDataAction } from "./actions";
import { notFound } from "next/navigation";
import { storeService } from "@/services/stores";

interface DiscountsPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; search?: string; includeExpired?: string }>;
}

export default async function DiscountsPage({ params, searchParams }: DiscountsPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const store = await storeService.getStoreBySlug(slug);
  if (!store) {
    notFound();
  }

  const result = await getDiscountsPageDataAction({
    page: resolvedSearchParams.page || "1",
    search: resolvedSearchParams.search,
    storeId: store.id,
    includeExpired: resolvedSearchParams.includeExpired === "true",
  });

  const { discounts, pagination } = result.data!;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Discounts</h1>
          <p className="text-muted-foreground">
            Manage discount codes and promotions for your store
          </p>
        </div>
        <Link href={`/stores/${slug}/admin/discounts/new`}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Discount
          </Button>
        </Link>
      </div>

      {discounts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Percent className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No discounts yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first discount to start offering promotions to your customers.
            </p>
            <Link href={`/stores/${slug}/admin/discounts/new`}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Discount
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {discounts.map((discount) => {
            const isExpired = new Date(discount.endDate) < new Date();
            const isActive = discount.isActive && !isExpired;
            
            return (
              <Card key={discount.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {discount.name}
                        <Badge variant={isActive ? "default" : "secondary"}>
                          {isActive ? "Active" : isExpired ? "Expired" : "Inactive"}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1">
                          <Percent className="h-4 w-4" />
                          {discount.percentage}% off
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Expires {new Date(discount.endDate).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Package className="h-4 w-4" />
                          {discount.productCount} products
                        </span>
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/stores/${slug}/admin/discounts/${discount.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                      <Link href={`/stores/${slug}/admin/discounts/${discount.id}/edit`}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
          
          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <Link
                  key={page}
                  href={`/stores/${slug}/admin/discounts?page=${page}${resolvedSearchParams.search ? `&search=${resolvedSearchParams.search}` : ''}${resolvedSearchParams.includeExpired ? `&includeExpired=${resolvedSearchParams.includeExpired}` : ''}`}
                >
                  <Button
                    variant={page === pagination.page ? "default" : "outline"}
                    size="sm"
                  >
                    {page}
                  </Button>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}