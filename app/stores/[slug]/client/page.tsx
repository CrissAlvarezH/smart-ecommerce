import { notFound } from "next/navigation";
import { getStoreBySlugAction, getStoreProductsAction } from "../actions";
import { StoreClient } from "./store-client";

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
    <StoreClient
      store={store}
      products={products}
      totalPages={totalPages}
      currentPage={currentPage}
      searchTerm={search}
      categoryId={category}
      sort={sort}
    />
  );
}