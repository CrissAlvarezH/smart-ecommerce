import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Package, 
  Tag, 
  FolderOpen, 
  Home, 
  BarChart3,
  Settings 
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="outline" size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  View Site
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <Card>
              <CardContent className="p-6">
                <nav className="space-y-2">
                  <Link href="/admin">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start"
                    >
                      <BarChart3 className="h-4 w-4 mr-3" />
                      Dashboard
                    </Button>
                  </Link>
                  
                  <Link href="/admin/products">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start"
                    >
                      <Package className="h-4 w-4 mr-3" />
                      Products
                    </Button>
                  </Link>
                  
                  <Link href="/admin/categories">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start"
                    >
                      <Tag className="h-4 w-4 mr-3" />
                      Categories
                    </Button>
                  </Link>
                  
                  <Link href="/admin/collections">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start"
                    >
                      <FolderOpen className="h-4 w-4 mr-3" />
                      Collections
                    </Button>
                  </Link>
                  
                  <div className="border-t pt-4 mt-4">
                    <Link href="/admin/settings">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start"
                      >
                        <Settings className="h-4 w-4 mr-3" />
                        Settings
                      </Button>
                    </Link>
                  </div>
                </nav>
              </CardContent>
            </Card>
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