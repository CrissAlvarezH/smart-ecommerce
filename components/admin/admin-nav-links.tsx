"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { 
  Package, 
  Tag, 
  FolderOpen, 
  BarChart3,
  Percent
} from "lucide-react";

interface AdminNavLinksProps {
  storeSlug: string;
}

export function AdminNavLinks({ storeSlug }: AdminNavLinksProps) {
  const pathname = usePathname();

  const navItems = [
    {
      href: `/stores/${storeSlug}/admin`,
      label: "Dashboard",
      icon: BarChart3,
      isActive: pathname === `/stores/${storeSlug}/admin`
    },
    {
      href: `/stores/${storeSlug}/admin/products`,
      label: "Products",
      icon: Package,
      isActive: pathname.startsWith(`/stores/${storeSlug}/admin/products`)
    },
    {
      href: `/stores/${storeSlug}/admin/categories`,
      label: "Categories",
      icon: Tag,
      isActive: pathname.startsWith(`/stores/${storeSlug}/admin/categories`)
    },
    {
      href: `/stores/${storeSlug}/admin/collections`,
      label: "Collections",
      icon: FolderOpen,
      isActive: pathname.startsWith(`/stores/${storeSlug}/admin/collections`)
    },
    {
      href: `/stores/${storeSlug}/admin/discounts`,
      label: "Discounts",
      icon: Percent,
      isActive: pathname.startsWith(`/stores/${storeSlug}/admin/discounts`)
    }
  ];

  return (
    <div className="hidden md:flex items-center space-x-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link key={item.href} href={item.href}>
            <Button 
              variant={item.isActive ? "default" : "ghost"} 
              size="sm"
              className={item.isActive ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              <Icon className="h-4 w-4 mr-2" />
              {item.label}
            </Button>
          </Link>
        );
      })}
    </div>
  );
}