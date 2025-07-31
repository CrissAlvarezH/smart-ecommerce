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

  const { stores } = await getMyStoresAction({});

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Stores</h1>
          <p className="text-gray-600">Manage and monitor your online stores</p>
        </div>
        <Link href="/create-store">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create New Store
          </Button>
        </Link>
      </div>

      <StoreList stores={stores} showAdminLinks={true} />
    </div>
  );
}