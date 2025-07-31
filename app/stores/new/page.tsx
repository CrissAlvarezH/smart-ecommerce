import { CreateStoreForm } from "@/components/stores/create-store-form";
import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function CreateStorePage() {
  const { user } = await validateRequest();
  
  if (!user) {
    redirect("/sign-in?redirect=/stores/new");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Store</h1>
          <p className="text-gray-600">
            Fill in the details below to set up your new online store
          </p>
        </div>
        
        <CreateStoreForm />
      </div>
    </div>
  );
}