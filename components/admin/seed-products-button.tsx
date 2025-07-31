"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Shuffle, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface SeedProductsButtonProps {
  storeSlug?: string;
}

export function SeedProductsButton({ storeSlug }: SeedProductsButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSeedProducts = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(storeSlug ? `/api/stores/${storeSlug}/seed-products` : '/api/seed-products', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Products created successfully!",
          description: `Added ${data.products.length} random products to the database.`,
        });
      } else {
        throw new Error(data.error || 'Failed to seed products');
      }
    } catch (error) {
      console.error('Error seeding products:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create products",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleSeedProducts}
      disabled={isLoading}
      variant="secondary"
      className="w-full"
      size="lg"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Shuffle className="h-4 w-4 mr-2" />
      )}
      {isLoading ? "Creating Products..." : "Add 10 Random Products"}
    </Button>
  );
}