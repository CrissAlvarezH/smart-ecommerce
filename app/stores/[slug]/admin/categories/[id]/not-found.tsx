import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Tag } from "lucide-react";
import Link from "next/link";

interface CategoryNotFoundProps {
  params: Promise<{ slug: string; }>;
}

export default async function CategoryNotFound({ params }: CategoryNotFoundProps) {
  const { slug } = await params;
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/stores/${slug}/admin/categories`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Categories
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Category Not Found</h2>
          <p className="text-gray-600 mt-2">
            The category you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-gray-500">
            <Tag className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p>This category could not be found.</p>
            <p className="text-sm mt-2">
              It may have been deleted or moved to a different location.
            </p>
            <Link href={`/stores/${slug}/admin/categories`}>
              <Button className="mt-4">
                View All Categories
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}