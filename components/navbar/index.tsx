import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserNavButton } from "@/components/navbar/user-nav-btn";
import { CartButton } from "@/components/cart/cart-button";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default async function Navbar() {
  return (
    <div className="flex justify-center shadow">
      <div className="flex w-full max-w-5xl items-center justify-between py-1 px-2">
        <div className="flex">
          <Link href="/">
            <Button variant="link">Home</Button>
          </Link>
          <Link href="/products">
            <Button variant="link">Products</Button>
          </Link>
          <Link href="/blog">
            <Button variant="link">Blog</Button>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <CartButton />
          <Suspense fallback={<Skeleton className="h-5 w-20" />}>
            <UserNavButton />
          </Suspense>
        </div>
      </div>
    </div >
  );
}
