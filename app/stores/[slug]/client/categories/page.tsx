import { notFound } from "next/navigation";
import Link from "next/link";
import { getStoreBySlugAction, getStoreCategoriesAction } from "../../actions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Folder, Package } from "lucide-react";
import { CategoryImage } from "@/components/store/category-image";

interface StoreCategoriesPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function StoreCategoriesPage({ params }: StoreCategoriesPageProps) {
  const { slug } = await params;
  
  // Get store info
  const storeResult = await getStoreBySlugAction({ slug });
  if (!storeResult.data) {
    notFound();
  }
  
  const store = storeResult.data.store;
  
  if (!store) {
    notFound();
  }

  // Get categories for this store
  const categoriesResult = await getStoreCategoriesAction({ storeId: store.id });
  
  if (!categoriesResult.data) {
    notFound();
  }
  
  const categories = categoriesResult.data.categories || [];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Categories</h1>
        <p className="text-gray-600">Browse products by category in {store.name}</p>
      </div>

      {categories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link 
              key={category.id} 
              href={`/stores/${slug}/client/categories/${category.slug}`}
              className="group"
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow group-hover:scale-105 transition-transform duration-300">
                <CategoryImage 
                  imageUrl={category.bannerUrl}
                  categoryName={category.name}
                />
                
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors">
                      {category.name}
                    </h3>
                    <Badge variant={category.isActive ? "default" : "secondary"} className="text-xs">
                      {category.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  
                  {category.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {category.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Package className="h-4 w-4" />
                    <span>View products</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Folder className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No categories yet</h3>
          <p className="text-gray-600 mb-6">
            This store hasn&apos;t created any categories yet. Check back soon!
          </p>
          <Link 
            href={`/stores/${slug}/client`}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Back to Store
          </Link>
        </div>
      )}
    </div>
  );
}