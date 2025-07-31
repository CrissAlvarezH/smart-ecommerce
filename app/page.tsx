import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StoreList } from "@/components/stores/store-list";
import { ArrowRight, Store, Plus, Sparkles, Users, Shield } from "lucide-react";
import { getMyStoresAction } from "./actions";
import { validateRequest } from "@/lib/auth";

export default async function Home() {
  const { user } = await validateRequest();
  
  // If user is logged in, get their stores
  let userStores: any[] = [];
  if (user) {
    const result = await getMyStoresAction({});
    userStores = result?.data?.stores || [];
  }

  if (!user) {
    // Welcome page for guests
    return (
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
                Build Your
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Dream Store</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
                Create, manage, and scale your online business with our powerful ecommerce platform. 
                No technical skills required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link href="/signup">
                  <Button size="lg" className="px-8 py-4 text-lg">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Start Free Today
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg" className="px-8 py-4 text-lg">
                    Sign In
                  </Button>
                </Link>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">1000+</div>
                  <div className="text-gray-600">Active Stores</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">50K+</div>
                  <div className="text-gray-600">Products Sold</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">99.9%</div>
                  <div className="text-gray-600">Uptime</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything You Need to Succeed</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Powerful tools and features designed to help you build and grow your online business
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Store className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Easy Store Setup</h3>
                <p className="text-gray-600">
                  Launch your store in minutes with our intuitive setup wizard. No coding required.
                </p>
              </div>
              
              <div className="text-center p-6">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Customer Management</h3>
                <p className="text-gray-600">
                  Built-in tools to manage customers, orders, and inventory all in one place.
                </p>
              </div>
              
              <div className="text-center p-6">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Secure & Reliable</h3>
                <p className="text-gray-600">
                  Enterprise-grade security and 99.9% uptime to keep your business running smoothly.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-4xl font-bold text-white mb-4">
                Ready to Start Your Journey?
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Join thousands of entrepreneurs who have built successful businesses with our platform.
              </p>
              <Link href="/signup">
                <Button size="lg" variant="secondary" className="px-8 py-4 text-lg">
                  Create Your Free Store
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  // Dashboard for logged-in users
  return (
    <main className="container mx-auto px-4 py-8">
      {/* Welcome Section */}
      <section className="mb-12">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.name || user.email}! 👋
          </h1>
          <p className="text-gray-600 mb-6">
            Manage your stores and track your business growth from your dashboard.
          </p>
          <Link href="/stores/new">
            <Button size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Create New Store
            </Button>
          </Link>
        </div>
      </section>

      {/* User Stores */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Stores</h2>
            <p className="text-gray-600">
              {userStores.length === 0 
                ? "You haven't created any stores yet. Start building your first store!" 
                : `Manage and grow your ${userStores.length} store${userStores.length > 1 ? 's' : ''}`
              }
            </p>
          </div>
          <Link href="/my-stores">
            <Button variant="outline">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {userStores.length > 0 ? (
          <StoreList stores={userStores.slice(0, 3)} showAdminLinks={true} />
        ) : (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <Store className="mx-auto h-20 w-20 text-gray-300 mb-6" />
            <h3 className="text-2xl font-medium text-gray-900 mb-3">Create Your First Store</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Get started with our easy store setup wizard and launch your online business in minutes.
            </p>
            <Link href="/stores/new">
              <Button size="lg">
                <Plus className="mr-2 h-5 w-5" />
                Create Store
              </Button>
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
