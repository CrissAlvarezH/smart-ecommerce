import { ProductGrid } from "@/components/products/product-grid";
import { notFound } from "next/navigation";
import { getStoreBySlugAction, getStoreProductsAction } from "../../actions";

interface StoreProductsPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function StoreProductsPage({ params }: StoreProductsPageProps) {
  const { slug } = await params;
  
  // Get store info
  const storeResult = await getStoreBySlugAction({ slug });
  if (!storeResult.data) {
    notFound();
  }
  
  const store = storeResult.data.store;

  // Get products for this store
  const productsResult = await getStoreProductsAction({ storeId: store.id });
  
  if (!productsResult.data) {
    notFound();
  }
  
  const products = productsResult.data.products || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{store.name} Products</h1>
        <p className="text-gray-600">Discover our amazing collection of products</p>
      </div>

      <ProductGrid products={products} storeSlug={slug} />
    </div>
  );
}