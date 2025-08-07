"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AddToCartButton } from "./add-to-cart-button";
import { formatPrice } from "@/lib/format-price";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    shortDescription?: string;
    price: string;
    compareAtPrice?: string;
    categoryName?: string;
    inventory: number;
    image?: {
      url: string;
      altText?: string;
    };
  };
  storeSlug?: string;
}

export function ProductCard({ product, storeSlug }: ProductCardProps) {
  const price = parseFloat(product.price);
  const comparePrice = product.compareAtPrice ? parseFloat(product.compareAtPrice) : null;
  const discount = comparePrice ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;
  return (
    <TooltipProvider>
      <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-square overflow-hidden bg-gray-100">
        <Link href={storeSlug ? `/stores/${storeSlug}/client/products/${product.slug}` : `/products/${product.slug}`}>
          {product.image ? (
            <Image
              src={product.image.url}
              alt={product.image.altText || product.name}
              width={300}
              height={300}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="h-full w-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No image</span>
            </div>
          )}
        </Link>
      </div>
      
      <CardContent className="p-4">
        {product.categoryName && (
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-sm text-gray-500 mb-1 truncate cursor-default">{product.categoryName}</p>
            </TooltipTrigger>
            <TooltipContent>
              <p>{product.categoryName}</p>
            </TooltipContent>
          </Tooltip>
        )}
        
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Link href={storeSlug ? `/stores/${storeSlug}/client/products/${product.slug}` : `/products/${product.slug}`}>
                <h3 className="font-semibold text-lg mb-2 hover:text-blue-600 transition-colors line-clamp-2">
                  {product.name}
                </h3>
              </Link>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{product.name}</p>
          </TooltipContent>
        </Tooltip>
        
        {product.shortDescription && (
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2 cursor-default">
                {product.shortDescription}
              </p>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">{product.shortDescription}</p>
            </TooltipContent>
          </Tooltip>
        )}
        
        <div className="space-y-3">
          <div className="flex flex-col">
            {comparePrice && (
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(comparePrice)}
                </span>
                <span className="text-sm text-green-600 font-medium">
                  -{discount}%
                </span>
              </div>
            )}
            <span className="text-xl font-bold text-gray-900">
              {formatPrice(price)}
            </span>
          </div>
          
          <AddToCartButton
            productId={product.id}
            productName={product.name}
            inStock={product.inventory > 0}
            size="sm"
            className="w-full"
            storeSlug={storeSlug}
          />
        </div>
      </CardContent>
      </Card>
    </TooltipProvider>
  );
}