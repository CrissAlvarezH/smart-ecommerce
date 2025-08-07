import { SelectShippingRate, SelectCartItem, SelectProduct } from "@/db/schemas";

export interface ShippingCalculationOptions {
  cartItems: (SelectCartItem & { product: SelectProduct })[];
  address?: {
    country?: string;
    state?: string;
    postalCode?: string;
  };
}

export interface ShippingRateCalculation {
  rateId: string;
  name: string;
  description?: string | null;
  type: string;
  price: string;
  estimatedDays?: number | null;
  isEligible: boolean;
  calculatedCost: string;
}

export function calculateShippingCost(
  rate: SelectShippingRate,
  options: ShippingCalculationOptions
): ShippingRateCalculation {
  const { cartItems } = options;
  
  // Calculate cart totals
  const cartSubtotal = cartItems.reduce((total, item) => {
    return total + (parseFloat(item.product.price) * item.quantity);
  }, 0);
  
  const cartWeight = cartItems.reduce((total, item) => {
    const weight = item.product.weight ? parseFloat(item.product.weight) : 0;
    return total + (weight * item.quantity);
  }, 0);

  let isEligible = true;
  let calculatedCost = "0.00";

  switch (rate.type) {
    case "free":
      calculatedCost = "0.00";
      break;
      
    case "flat_rate":
      calculatedCost = rate.price || "0.00";
      break;
      
    case "weight_based":
      const minWeight = rate.minWeight ? parseFloat(rate.minWeight) : 0;
      const maxWeight = rate.maxWeight ? parseFloat(rate.maxWeight) : Infinity;
      
      if (cartWeight < minWeight || cartWeight > maxWeight) {
        isEligible = false;
      } else {
        calculatedCost = rate.price || "0.00";
      }
      break;
      
    case "price_based":
      const minPrice = rate.minPrice ? parseFloat(rate.minPrice) : 0;
      const maxPrice = rate.maxPrice ? parseFloat(rate.maxPrice) : Infinity;
      
      if (cartSubtotal < minPrice || cartSubtotal > maxPrice) {
        isEligible = false;
      } else {
        calculatedCost = rate.price || "0.00";
      }
      break;
      
    default:
      isEligible = false;
  }

  return {
    rateId: rate.id,
    name: rate.name,
    description: rate.description,
    type: rate.type,
    price: rate.price || "0.00",
    estimatedDays: rate.estimatedDays,
    isEligible,
    calculatedCost: calculatedCost,
  };
}

export function calculateShippingForRates(
  rates: SelectShippingRate[],
  options: ShippingCalculationOptions
): ShippingRateCalculation[] {
  return rates
    .map(rate => calculateShippingCost(rate, options))
    .filter(calculation => calculation.isEligible)
    .sort((a, b) => parseFloat(a.calculatedCost) - parseFloat(b.calculatedCost));
}

export function findCheapestShippingRate(
  rates: SelectShippingRate[],
  options: ShippingCalculationOptions
): ShippingRateCalculation | null {
  const eligibleRates = calculateShippingForRates(rates, options);
  return eligibleRates.length > 0 ? eligibleRates[0] : null;
}

export function calculateCartTotalWithShipping(
  cartSubtotal: number,
  shippingCost: string | null
): number {
  const shipping = shippingCost ? parseFloat(shippingCost) : 0;
  return cartSubtotal + shipping;
}