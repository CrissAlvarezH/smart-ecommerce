import { DebugStores } from "./debug";
import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DebugStoresPage() {
  const { user } = await validateRequest();
  
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Debug Stores</h1>
      <DebugStores />
    </div>
  );
}