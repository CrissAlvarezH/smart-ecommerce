import { DiscountProductsList } from "./discount-products-list";

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

interface DiscountProductsManagerProps {
  discount: Discount;
  storeSlug: string;
  storeId: string;
}

export function DiscountProductsManager({
  discount,
  storeSlug,
  storeId,
}: DiscountProductsManagerProps) {
  return (
    <div className="w-full">
      <DiscountProductsList discount={discount} storeSlug={storeSlug} storeId={storeId} />
    </div>
  );
}