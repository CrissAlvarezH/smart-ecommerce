import { notFound } from "next/navigation";
import { getStoreBySlugAction } from "../actions";
import { StoreNavbar } from "@/components/store/store-navbar";

interface ClientLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    slug: string;
  }>;
}

export default async function ClientLayout({ children, params }: ClientLayoutProps) {
  const { slug } = await params;
  
  const result = await getStoreBySlugAction({ slug });
  
  if (!result.data) {
    notFound();
  }
  
  const store = result.data.store;

  return (
    <div className="min-h-screen bg-gray-50">
      <StoreNavbar store={store} />
      <main className="pt-16">
        {children}
      </main>
    </div>
  );
}