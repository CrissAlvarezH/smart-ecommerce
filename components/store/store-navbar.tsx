import Link from "next/link";
import { Store } from "lucide-react";
import { CartButton } from "@/components/cart/cart-button";
import { UserMenu } from "@/components/store/user-menu";
import { SelectStore } from "@/db/schemas";
import { validateRequest } from "@/lib/auth";
import { MobileMenu } from "@/components/store/mobile-menu";

interface StoreNavbarProps {
  store: SelectStore;
}

export async function StoreNavbar({ store }: StoreNavbarProps) {
  const { user } = await validateRequest();

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Store Name */}
          <Link href={`/stores/${store.slug}/client`} className="flex items-center space-x-3">
            {store.logoUrl ? (
              <img 
                src={store.logoUrl} 
                alt={`${store.name} logo`} 
                className="h-8 w-8 object-contain"
              />
            ) : (
              <Store className="h-8 w-8 text-gray-700" />
            )}
            <span className="text-xl font-bold text-gray-900">{store.name}</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href={`/stores/${store.slug}/client`} 
              className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              Home
            </Link>
            <Link 
              href={`/stores/${store.slug}/client/products`} 
              className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              Products
            </Link>
            <Link 
              href={`/stores/${store.slug}/client/categories`} 
              className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              Categories
            </Link>
          </div>

          {/* Right side buttons */}
          <div className="flex items-center space-x-4">
            {/* Cart Button */}
            <CartButton />

            {/* User Menu */}
            <div className="hidden md:block">
              <UserMenu user={user} />
            </div>

            {/* Mobile menu button */}
            <MobileMenu store={store} user={user} />
          </div>
        </div>

      </nav>
    </header>
  );
}