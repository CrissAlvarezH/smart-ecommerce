import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserNavButton } from "@/components/navbar/user-nav-btn";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { validateRequest } from "@/lib/auth";

export default async function MainNavbar() {
  const { user } = await validateRequest();

  return (
    <div className="flex justify-center shadow-sm border-b bg-white">
      <div className="flex w-full max-w-6xl items-center justify-between py-3 px-4">
        <div className="flex items-center">
          <Link href="/" className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
            Smart Ecommerce
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link href="/my-stores">
                <Button variant="ghost">My Stores</Button>
              </Link>
              <Link href="/stores/new">
                <Button>Create Store</Button>
              </Link>
              <Suspense fallback={<Skeleton className="h-8 w-20" />}>
                <UserNavButton />
              </Suspense>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button>Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}