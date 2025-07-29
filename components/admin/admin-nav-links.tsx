"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { 
  Package, 
  Tag, 
  FolderOpen, 
  BarChart3 
} from "lucide-react";

export function AdminNavLinks() {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/admin",
      label: "Dashboard",
      icon: BarChart3,
      isActive: pathname === "/admin"
    },
    {
      href: "/admin/products",
      label: "Products",
      icon: Package,
      isActive: pathname.startsWith("/admin/products")
    },
    {
      href: "/admin/categories",
      label: "Categories",
      icon: Tag,
      isActive: pathname.startsWith("/admin/categories")
    },
    {
      href: "/admin/collections",
      label: "Collections",
      icon: FolderOpen,
      isActive: pathname.startsWith("/admin/collections")
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