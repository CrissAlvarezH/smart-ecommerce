"use client";

import Link from "next/link";
import { type SelectStore } from "@/db/schemas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Store, ExternalLink, Settings } from "lucide-react";

interface StoreListProps {
  stores: SelectStore[];
  showAdminLinks?: boolean;
}

export function StoreList({ stores, showAdminLinks = false }: StoreListProps) {
  if (!stores || stores.length === 0) {
    return (
      <div className="text-center py-12">
        <Store className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No stores found</h3>
        <p className="text-gray-500">
          {showAdminLinks 
            ? "You haven't created any stores yet. Create your first store to get started!"
            : "No stores are currently available."
          }
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stores.map((store) => (
        <Card key={store.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">{store.name}</CardTitle>
                <p className="text-sm text-gray-500 mt-1">/{store.slug}</p>
              </div>
              <Badge variant={store.isActive ? "default" : "secondary"}>
                {store.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {store.description && (
              <p className="text-gray-600 mb-4 line-clamp-3">
                {store.description}
              </p>
            )}
            
            <div className="space-y-2 text-sm text-gray-500 mb-4">
              {store.email && (
                <div>Email: {store.email}</div>
              )}
              {store.city && store.country && (
                <div>Location: {store.city}, {store.country}</div>
              )}
              <div>Created: {new Date(store.createdAt).toLocaleDateString()}</div>
            </div>

            <div className="flex gap-2">
              <Link href={`/stores/${store.slug}`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Visit Store
                </Button>
              </Link>
              
              {showAdminLinks && (
                <Link href={`/stores/${store.slug}/admin`}>
                  <Button size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Manage
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}