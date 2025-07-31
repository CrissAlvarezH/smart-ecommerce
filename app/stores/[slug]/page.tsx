import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/products/product-grid";
import { ArrowRight, Store, Mail, Phone, MapPin, Settings } from "lucide-react";
import { getStoreBySlugAction } from "./actions";
import { notFound } from "next/navigation";
import { validateRequest } from "@/lib/auth";

interface StorePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function StorePage({ params }: StorePageProps) {
  const { slug } = await params;
  const { user } = await validateRequest();
  
  console.log("Fetching store with slug:", slug);
  
  let result;
  try {
    result = await getStoreBySlugAction({ slug });
    console.log("Store action result:", result);
  } catch (error) {
    console.error("Error fetching store:", error);
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <Store className="mx-auto h-16 w-16 text-red-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Store</h2>
          <p className="text-gray-600 mb-6">
            There was an error loading this store. Please try again later.
          </p>
          <Link href="/">
            <Button variant="outline">
              Back to Home
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </main>
    );
  }
  
  if (!result.data?.store) {
    console.log("No store found for slug:", slug);
    notFound();
  }
  
  const store = result.data.store;
  const isOwner = user && store.ownerId === user.id;

  // TODO: Get store-specific products when we update the product service
  const featuredProducts: any[] = [];

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Store Header */}
      <section className="mb-16">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="w-24 h-24 bg-white rounded-lg flex items-center justify-center shadow-sm">
              {store.logoUrl ? (
                <img 
                  src={store.logoUrl} 
                  alt={`${store.name} logo`} 
                  className="w-20 h-20 object-contain rounded"
                />
              ) : (
                <Store className="w-12 h-12 text-gray-400" />
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">{store.name}</h1>
                  {store.description && (
                    <p className="text-lg text-gray-600 mb-4">{store.description}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    {store.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {store.email}
                      </div>
                    )}
                    {store.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {store.phone}
                      </div>
                    )}
                    {store.city && store.country && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {store.city}, {store.country}
                      </div>
                    )}
                  </div>
                </div>
                
                {isOwner && (
                  <Link href={`/stores/${slug}/admin`}>
                    <Button variant="outline">
                      <Settings className="w-4 h-4 mr-2" />
                      Manage Store
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Store Content */}
      {featuredProducts.length > 0 ? (
        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Products</h2>
              <p className="text-gray-600">Discover our best-selling items</p>
            </div>
            <Link href={`/stores/${slug}/products`}>
              <Button variant="outline">
                View All Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <ProductGrid products={featuredProducts} storeSlug={slug} />
        </section>
      ) : (
        <section className="text-center py-16">
          <Store className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Store Coming Soon</h2>
          <p className="text-gray-600 mb-6">
            This store is being set up. Check back soon for amazing products!
          </p>
          <Link href="/">
            <Button variant="outline">
              Browse Other Stores
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </section>
      )}
    </main>
  );
}