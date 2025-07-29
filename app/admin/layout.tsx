import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserNavButton } from "@/components/navbar/user-nav-btn";
import { AdminNavLinks } from "@/components/admin/admin-nav-links";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BarChart3,
  ShoppingBag 
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-page fixed inset-0 bg-gray-50 z-50 overflow-auto">
        {/* Admin Navbar */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="flex justify-center">
          <div className="flex w-full max-w-7xl items-center justify-between py-3 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-6">
              <Link href="/admin" className="flex items-center">
                <BarChart3 className="h-6 w-6 mr-2 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">Admin Panel</span>
              </Link>
              
              <AdminNavLinks />
            </div>

            <div className="flex items-center space-x-3">
              <Link href="/" target="_blank">
                <Button variant="outline" size="sm">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  View Store
                </Button>
              </Link>
              <Suspense fallback={<Skeleton className="h-8 w-20" />}>
                <UserNavButton />
              </Suspense>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <main>
          {children}
        </main>
      </div>
      
    </div>
  );
}