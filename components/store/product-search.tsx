"use client";

import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";

interface ProductSearchProps {
  storeSlug: string;
  placeholder?: string;
}

export function ProductSearch({ storeSlug, placeholder = "Search products..." }: ProductSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");

  // Update search term when URL changes
  useEffect(() => {
    setSearchTerm(searchParams.get("search") || "");
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateSearch(searchTerm);
  };

  const updateSearch = (term: string) => {
    const params = new URLSearchParams(searchParams);
    
    if (term) {
      params.set("search", term);
      params.delete("page"); // Reset to page 1 when searching
    } else {
      params.delete("search");
    }
    
    router.push(`/stores/${storeSlug}/client?${params.toString()}`);
  };

  const clearSearch = () => {
    setSearchTerm("");
    updateSearch("");
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <Input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          className="pl-10 pr-24"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-20 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <Button 
          type="submit" 
          size="sm" 
          className="absolute right-1 top-1/2 transform -translate-y-1/2"
        >
          Search
        </Button>
      </div>
    </form>
  );
}