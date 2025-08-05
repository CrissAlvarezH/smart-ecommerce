"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SelectStore } from "@/db/schemas";
import { useAction } from "next-safe-action/hooks";
import { logoutAction } from "@/app/(auth)/login/actions";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface MobileMenuProps {
  store: SelectStore;
  user?: {
    id: number;
    email: string;
    name?: string;
  };
}

export function MobileMenu({ store, user }: MobileMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  
  const { execute: logout } = useAction(logoutAction, {
    onSuccess: () => {
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      router.refresh();
      setIsMenuOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <>
      <button
        className="md:hidden"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        {isMenuOpen ? (
          <X className="h-6 w-6 text-gray-700" />
        ) : (
          <Menu className="h-6 w-6 text-gray-700" />
        )}
      </button>

      {isMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white shadow-lg md:hidden">
          <div className="flex flex-col py-4">
            <Link 
              href={`/stores/${store.slug}/client`} 
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              href={`/stores/${store.slug}/client/products`} 
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Products
            </Link>
            <Link 
              href={`/stores/${store.slug}/client/categories`} 
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Categories
            </Link>
            
            <div className="border-t my-2"></div>
            
            {user ? (
              <>
                <div className="px-4 py-2">
                  <p className="text-sm font-medium text-gray-900">{user.name || "User"}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <Link 
                  href="/account" 
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Account
                </Link>
                <Link 
                  href="/orders" 
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Orders
                </Link>
                <button
                  className="px-4 py-2 text-left text-gray-700 hover:bg-gray-100 hover:text-gray-900 font-medium"
                  onClick={() => logout()}
                >
                  Log out
                </button>
              </>
            ) : (
              <Link 
                href="/login" 
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}