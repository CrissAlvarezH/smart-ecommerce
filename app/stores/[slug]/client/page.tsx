import { notFound } from "next/navigation";
import { getStoreBySlugAction, getStoreProductsAction } from "../actions";
import { ProductGrid } from "@/components/products/product-grid";
import { Button } from "@/components/ui/button";
import { ArrowRight, Package } from "lucide-react";
import Link from "next/link";
import { SortDropdown } from "@/components/store/sort-dropdown";

interface StoreClientPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    page?: string;
    search?: string;
    category?: string;
    sort?: string;
  }>;
}

export default async function StoreClientPage({ params, searchParams }: StoreClientPageProps) {
  const { slug } = await params;
  const { page = "1", search, category, sort } = await searchParams;
  
  // Fetch store data
  const storeResult = await getStoreBySlugAction({ slug });
  
  if (!storeResult.data) {
    notFound();
  }
  
  const store = storeResult.data.store;
  
  // Fetch products for this store
  const productsResult = await getStoreProductsAction({
    storeId: store.id,
    page,
    search,
    categoryId: category,
    sort,
  });
  
  if (!productsResult.data) {
    notFound();
  }
  
  const products = productsResult.data.products || [];
  const totalPages = productsResult.data.totalPages || 1;
  const currentPage = parseInt(page, 10);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Store Banner */}
      {store.bannerUrl && (
        <div className="mb-8 rounded-lg overflow-hidden h-64 relative">
          <img 
            src={store.bannerUrl} 
            alt={`${store.name} banner`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
            <div className="p-8 text-white">
              <h1 className="text-4xl font-bold mb-2">{store.name}</h1>
              {store.description && (
                <p className="text-lg">{store.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Page Header */}
      {!store.bannerUrl && (
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{store.name}</h1>
          {store.description && (
            <p className="text-lg text-gray-600">{store.description}</p>
          )}
        </div>
      )}

      {/* Products Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            All Products
            {search && <span className="text-gray-600 text-lg ml-2">- searching for &quot;{search}&quot;</span>}
          </h2>
          <div className="flex items-center gap-4">
            <SortDropdown defaultValue={sort || "newest"} />
          </div>
        </div>

        {products.length > 0 ? (
          <>
            <ProductGrid products={products} storeSlug={slug} />
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                {currentPage > 1 && (
                  <Link href={`/stores/${slug}/client?page=${currentPage - 1}${search ? `&search=${search}` : ''}${category ? `&category=${category}` : ''}${sort ? `&sort=${sort}` : ''}`}>
                    <Button variant="outline">Previous</Button>
                  </Link>
                )}
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <Link 
                      key={pageNum} 
                      href={`/stores/${slug}/client?page=${pageNum}${search ? `&search=${search}` : ''}${category ? `&category=${category}` : ''}${sort ? `&sort=${sort}` : ''}`}
                    >
                      <Button 
                        variant={pageNum === currentPage ? "default" : "outline"}
                        size="sm"
                      >
                        {pageNum}
                      </Button>
                    </Link>
                  ))}
                </div>
                
                {currentPage < totalPages && (
                  <Link href={`/stores/${slug}/client?page=${currentPage + 1}${search ? `&search=${search}` : ''}${category ? `&category=${category}` : ''}${sort ? `&sort=${sort}` : ''}`}>
                    <Button variant="outline">Next</Button>
                  </Link>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {search ? "No products found" : "No products yet"}
            </h3>
            <p className="text-gray-600 mb-6">
              {search 
                ? "Try adjusting your search terms or browse all products." 
                : "This store hasn't added any products yet. Check back soon!"
              }
            </p>
            {search && (
              <Link href={`/stores/${slug}/client`}>
                <Button variant="outline">
                  View All Products
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        )}
      </section>
    </div>
  );
}