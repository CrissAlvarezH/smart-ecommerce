import { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Store, Package, Tag, Users, Settings, BarChart3, Layers, Percent } from "lucide-react";
import { getStoreBySlugAction } from "../actions";
import { validateRequest } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";

interface AdminLayoutProps {
  children: ReactNode;
  params: Promise<{
    slug: string;
  }>;
}

export default async function AdminLayout({ children, params }: AdminLayoutProps) {
  const { slug } = await params;
  const { user } = await validateRequest();
  
  if (!user) {
    redirect(`/sign-in?redirect=/stores/${slug}/admin`);
  }

  const result = await getStoreBySlugAction({ slug });
  const store = result.data?.store;
  
  if (!store) {
    notFound();
  }

  // Check if user owns this store
  if (store.ownerId !== user.id) {
    redirect(`/stores/${slug}`);
  }

  const navigation = [
    { name: "Dashboard", href: `/stores/${slug}/admin`, icon: BarChart3 },
    { name: "Products", href: `/stores/${slug}/admin/products`, icon: Package },
    { name: "Categories", href: `/stores/${slug}/admin/categories`, icon: Tag },
    { name: "Collections", href: `/stores/${slug}/admin/collections`, icon: Layers },
    { name: "Discounts", href: `/stores/${slug}/admin/discounts`, icon: Percent },
    { name: "Orders", href: `/stores/${slug}/admin/orders`, icon: Users },
    { name: "Settings", href: `/stores/${slug}/admin/settings`, icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/stores/${slug}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Store
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-gray-500" />
                <h1 className="text-xl font-semibold">{store.name} - Admin</h1>
              </div>
            </div>
            <Link href="/my-stores">
              <Button variant="outline" size="sm">
                My Stores
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <nav className="bg-white rounded-lg shadow-sm p-4">
              <ul className="space-y-2">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors"
                    >
                      <item.icon className="w-4 h-4" />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}