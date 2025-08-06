"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { formatPrice } from "@/lib/format-price";

interface CartItemProps {
  item: {
    id: string;
    quantity: number;
    product: {
      id: string;
      name: string;
      slug: string;
      price: string;
      compareAtPrice?: string;
      inventory: number;
      image?: {
        url: string;
        altText?: string;
      };
    };
  };
  onUpdateQuantity: (itemId: string, quantity: number) => Promise<void>;
  onRemove: (itemId: string) => Promise<void>;
}

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
 const price = parseFloat(item.product.price);
  const comparePrice = item.product.compareAtPrice ? parseFloat(item.product.compareAtPrice) : null;
  const discount = comparePrice ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;
  const total = price * item.quantity;
  const [isUpdating, setIsUpdating] = useState(false);

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 0 || newQuantity > item.product.inventory) return;
    
    setIsUpdating(true);
    try {
      await onUpdateQuantity(item.id, newQuantity);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    setIsUpdating(true);
    try {
      await onRemove(item.id);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
            {item.product.image ? (
              <Image
                src={item.product.image.url}
                alt={item.product.image.altText || item.product.name}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400 text-xs">No image</span>
              </div>
            )}
          </div>

          <div className="flex-grow">
            <h3 className="font-semibold text-lg mb-1">{item.product.name}</h3>
            <div className="mb-2">
              {comparePrice ? (
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-gray-500 line-through">
                      {formatPrice(comparePrice!)}
                    </span>
                    <span className="text-sm text-green-600 font-medium">
                      -{discount}%
                    </span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">
                    {formatPrice(price)} each
                  </span>
                </div>
              ) : (
                <span className="text-lg font-bold text-gray-900">{formatPrice(price)} each</span>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(item.quantity - 1)}
                  disabled={isUpdating || item.quantity <= 1}
                  className="h-8 w-8 p-0"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                
                <span className="mx-2 min-w-[2rem] text-center font-medium">
                  {item.quantity}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(item.quantity + 1)}
                  disabled={isUpdating || item.quantity >= item.product.inventory}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-bold text-lg">
                  {formatPrice(total)}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemove}
                  disabled={isUpdating}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}