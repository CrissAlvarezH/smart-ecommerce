"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { AddToCartButton } from "./add-to-cart-button";

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
          <p className="text-sm text-gray-500 mb-1">{product.categoryName}</p>
        )}
        
        <Link href={storeSlug ? `/stores/${storeSlug}/client/products/${product.slug}` : `/products/${product.slug}`}>
          <h3 className="font-semibold text-lg mb-2 hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
        </Link>
        
        {product.shortDescription && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {product.shortDescription}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            {comparePrice && (
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm text-gray-500 line-through">
                  ${comparePrice.toFixed(2)}
                </span>
                <span className="text-sm text-green-600 font-medium">
                  -{discount}%
                </span>
              </div>
            )}
            <span className="text-xl font-bold text-gray-900">
              ${price.toFixed(2)}
            </span>
          </div>
          
          <AddToCartButton
            productId={product.id}
            productName={product.name}
            inStock={product.inventory > 0}
            size="sm"
            className="flex items-center gap-2"
            storeSlug={storeSlug}
          />
        </div>
      </CardContent>
    </Card>
  );
}