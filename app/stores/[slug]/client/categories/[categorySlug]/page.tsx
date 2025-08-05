import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package } from "lucide-react";
import { getStoreBySlugAction, getStoreCategoryBySlugAction, getStoreCategoryProductsAction } from "../../../actions";
import { ProductGrid } from "@/components/products/product-grid";
import { Button } from "@/components/ui/button";

interface StoreCategoryPageProps {
  params: Promise<{
    slug: string;
    categorySlug: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function StoreCategoryPage({ params, searchParams }: StoreCategoryPageProps) {
  const { slug, categorySlug } = await params;
  const { page = "1" } = await searchParams;
  
  // Get store info
  const storeResult = await getStoreBySlugAction({ slug });
  if (!storeResult.data) {
    notFound();
  }
  
  const store = storeResult.data.store;
  
  if (!store) {
    notFound();
  }

  // Get category info
  const categoryResult = await getStoreCategoryBySlugAction({ 
    storeId: store.id, 
    categorySlug 
  });
  
  if (!categoryResult.data || !categoryResult.data.category) {
    notFound();
  }
  
  const category = categoryResult.data.category;

  // Get products in this category
  const productsResult = await getStoreCategoryProductsAction({
    storeId: store.id,
    categoryId: category.id,
    page,
  });
  
  if (!productsResult.data) {
    notFound();
  }
  
  const products = productsResult.data.products || [];
  const totalPages = productsResult.data.totalPages || 1;
  const currentPage = parseInt(page, 10);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Navigation */}
      <Link 
        href={`/stores/${slug}/client/categories`} 
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Categories
      </Link>

      {/* Category Header */}
      {category.bannerUrl && (
        <div className="mb-8 rounded-lg overflow-hidden h-64 relative">
          <img 
            src={category.bannerUrl} 
            alt={`${category.name} banner`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
            <div className="p-8 text-white">
              <h1 className="text-4xl font-bold mb-2">{category.name}</h1>
              {category.description && (
                <p className="text-lg">{category.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Page Header (when no banner) */}
      {!category.bannerUrl && (
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            {category.imageUrl && (
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                <img 
                  src={category.imageUrl} 
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{category.name}</h1>
              {category.description && (
                <p className="text-gray-600">{category.description}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Products Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Products in {category.name}
          </h2>
          <div className="text-sm text-gray-500">
            {products.length} {products.length === 1 ? 'product' : 'products'}
          </div>
        </div>

        {products.length > 0 ? (
          <>
            <ProductGrid products={products} storeSlug={slug} />
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                {currentPage > 1 && (
                  <Link href={`/stores/${slug}/client/categories/${categorySlug}?page=${currentPage - 1}`}>
                    <Button variant="outline">Previous</Button>
                  </Link>
                )}
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <Link 
                      key={pageNum} 
                      href={`/stores/${slug}/client/categories/${categorySlug}?page=${pageNum}`}
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
                  <Link href={`/stores/${slug}/client/categories/${categorySlug}?page=${currentPage + 1}`}>
                    <Button variant="outline">Next</Button>
                  </Link>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products in this category yet</h3>
            <p className="text-gray-600 mb-6">
              This category doesn&apos;t have any products yet. Check back soon!
            </p>
            <Link href={`/stores/${slug}/client/categories`}>
              <Button variant="outline">
                Browse Other Categories
                <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
              </Button>
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}