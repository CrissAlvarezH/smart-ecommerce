import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StoreList } from "@/components/stores/store-list";
import { Plus } from "lucide-react";
import { getMyStoresAction } from "../actions";
import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function MyStoresPage() {
  const { user } = await validateRequest();
  
  if (!user) {
    redirect("/sign-in?redirect=/my-stores");
  }

  const result = await getMyStoresAction({});
  const stores = result?.data?.stores || [];
  
  console.log("My Stores Debug:", {
    userId: user.id,
    result,
    stores,
    storesLength: stores.length
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Stores</h1>
          <p className="text-gray-600">Manage and monitor your online stores</p>
        </div>
        <Link href="/stores/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create New Store
          </Button>
        </Link>
      </div>

      {stores.length > 0 ? (
        <StoreList stores={stores} showAdminLinks={true} />
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <div className="text-6xl mb-4">🏪</div>
          <h3 className="text-2xl font-medium text-gray-900 mb-3">No stores yet</h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            You haven&apos;t created any stores yet. Create your first store to start selling online!
          </p>
          <Link href="/stores/new">
            <Button size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Create Your First Store
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}