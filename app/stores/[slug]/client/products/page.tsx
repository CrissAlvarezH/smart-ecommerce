import { notFound } from "next/navigation";
import { getStoreBySlugAction, getStoreProductsAction } from "../../actions";
import { ProductsClient } from "./products-client";

interface StoreProductsPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function StoreProductsPage({ params, searchParams }: StoreProductsPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const sort = typeof resolvedSearchParams.sort === 'string' ? resolvedSearchParams.sort : undefined;
  
  // Get store info
  const storeResult = await getStoreBySlugAction({ slug });
  if (!storeResult.data) {
    notFound();
  }
  
  const store = storeResult.data.store;

  // Get products for this store with sorting
  const productsResult = await getStoreProductsAction({ 
    storeId: store.id,
    sort: sort 
  });
  
  if (!productsResult.data) {
    notFound();
  }
  
  const products = productsResult.data.products || [];

  return (
    <ProductsClient 
      products={products} 
      storeSlug={slug} 
      storeName={store.name}
    />
  );
}