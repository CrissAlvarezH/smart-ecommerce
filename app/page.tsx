import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StoreList } from "@/components/stores/store-list";
import { ArrowRight, Store, Plus } from "lucide-react";
import { getAllStoresAction } from "./actions";
import { validateRequest } from "@/lib/auth";

export default async function Home() {
  // Get all available stores
  const result = await getAllStoresAction({});
  const stores = result?.data?.stores || [];
  const { user } = await validateRequest();

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center py-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg mb-16">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
          Smart Ecommerce Platform
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Create and manage your own online store, or browse existing stores. 
          Your journey to ecommerce success starts here.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {user ? (
            <>
              <Link href="/stores/new">
                <Button size="lg" className="min-w-40">
                  <Plus className="mr-2 h-5 w-5" />
                  Create Store
                </Button>
              </Link>
              <Link href="/my-stores">
                <Button variant="outline" size="lg" className="min-w-40">
                  <Store className="mr-2 h-5 w-5" />
                  My Stores
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/sign-in">
                <Button size="lg" className="min-w-40">
                  Sign In to Create Store
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button variant="outline" size="lg" className="min-w-40">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Available Stores */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Available Stores</h2>
            <p className="text-gray-600">Browse and shop from our collection of stores</p>
          </div>
          {stores.length > 6 && (
            <Button variant="outline">
              View All Stores
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>

        <StoreList stores={stores.slice(0, 6)} />
        
        {stores.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Store className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No stores available yet</h3>
            <p className="text-gray-500 mb-6">
              Be the first to create a store on our platform!
            </p>
            {user ? (
              <Link href="/stores/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your Store
                </Button>
              </Link>
            ) : (
              <Link href="/sign-up">
                <Button>
                  Sign Up to Create Store
                </Button>
              </Link>
            )}
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="mt-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Why Choose Our Platform?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Store className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Easy Store Creation</h3>
            <p className="text-gray-600">Set up your online store in minutes with our intuitive interface</p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <ArrowRight className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Seamless Management</h3>
            <p className="text-gray-600">Manage products, orders, and customers from a single dashboard</p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Growth Ready</h3>
            <p className="text-gray-600">Scale your business with our powerful features and integrations</p>
          </div>
        </div>
      </section>
    </main>
  );
}
