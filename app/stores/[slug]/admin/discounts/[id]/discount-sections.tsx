"use client";

import { useState } from "react";
import { DiscountProductsSection } from "./discount-products-section";
import { DiscountCollectionsSection } from "./discount-collections-section";

interface Discount {
  id: string;
  name: string;
  percentage: string;
  endDate: Date;
  storeId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface DiscountSectionsProps {
  discount: Discount;
  storeId: string;
  storeSlug: string;
}

export function DiscountSections({ discount, storeId, storeSlug }: DiscountSectionsProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCollectionsChange = () => {
    // Force refresh of products section when collections change
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <DiscountCollectionsSection
        discount={discount}
        storeId={storeId}
        onCollectionsChange={handleCollectionsChange}
      />
      <DiscountProductsSection
        key={refreshKey}
        discount={discount}
        storeId={storeId}
        storeSlug={storeSlug}
      />
    </div>
  );
}