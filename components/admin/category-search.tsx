"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

export function CategorySearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");

  // Create a debounced search function with useCallback to prevent recreation
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (term: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          const params = new URLSearchParams(searchParams.toString());
          
          if (term.trim()) {
            params.set("search", term.trim());
          } else {
            params.delete("search");
          }
          
          // Reset to first page when searching
          params.delete("page");
          
          router.push(`?${params.toString()}`);
        }, 300);
      };
    })(),
    [router, searchParams]
  );

  // Update search term when URL changes (e.g., back button, clear search)
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    setSearchTerm(urlSearch);
  }, [searchParams]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value); // Update local state immediately for responsive UI
    debouncedSearch(value); // Debounce the URL update
  };

  const clearSearch = () => {
    setSearchTerm("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    params.delete("page");
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="relative flex-1 max-w-sm">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="pl-10 pr-10"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}