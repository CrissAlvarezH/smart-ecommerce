import { 
  COLOMBIAN_SHIPPING_COMPANIES, 
  COLOMBIAN_SHIPPING_ZONES,
  calculateColombianShipping,
  getCityZone,
  formatCOP 
} from "@/lib/colombian-shipping";
import { SelectCartItem, SelectProduct } from "@/db/schemas";

export interface ColombianShippingOptions {
  cartItems: (SelectCartItem & { product: SelectProduct })[];
  originCity?: string; // City code like "BOG", "MDE"
  destinationCity?: string;
  declaredValue?: number;
  hasRecaudo?: boolean; // Cash on delivery
}

export interface ColombianShippingRate {
  id: string;
  company: string;
  serviceName: string;
  serviceCode: string;
  description: string;
  price: number;
  priceFormatted: string;
  estimatedDays: number;
  hasRecaudo: boolean;
  trackingUrl?: string;
  restrictions?: string[];
}

export function calculateColombianShippingRates(
  options: ColombianShippingOptions
): ColombianShippingRate[] {
  const { cartItems, originCity = "BOG", destinationCity = "MDE", hasRecaudo = false } = options;
  
  // Calculate cart totals
  const cartSubtotal = cartItems.reduce((total, item) => {
    return total + (parseFloat(item.product.price) * item.quantity);
  }, 0);
  
  const cartWeight = cartItems.reduce((total, item) => {
    const weight = item.product.weight ? parseFloat(item.product.weight) : 0.5; // Default 0.5kg if no weight
    return total + (weight * item.quantity);
  }, 0);

  const declaredValue = options.declaredValue || cartSubtotal;
  const originZone = getCityZone(originCity);
  const destinationZone = getCityZone(destinationCity);

  const rates: ColombianShippingRate[] = [];

  // Generate rates for each shipping company and service
  Object.values(COLOMBIAN_SHIPPING_COMPANIES).forEach(company => {
    company.services.forEach(service => {
      try {
        // Check weight restrictions
        if (service.maxWeight && cartWeight > service.maxWeight) {
          return; // Skip this service if weight exceeds limit
        }

        // Check if service supports recaudo when requested
        if (hasRecaudo && !service.hasRecaudo) {
          return; // Skip services that don't support COD when requested
        }

        // Calculate price
        let price = 0;
        
        switch (service.type) {
          case "weight_based":
            price = calculateColombianShipping(
              cartWeight,
              declaredValue,
              originZone,
              destinationZone,
              service.code,
              hasRecaudo
            );
            break;
            
          case "price_based":
            // Base price calculation based on declared value percentage
            const basePercentage = 0.05; // 5% of declared value
            price = Math.max(declaredValue * basePercentage, 10000); // Minimum $10,000 COP
            
            // Apply zone multiplier
            const zoneMultiplier = COLOMBIAN_SHIPPING_ZONES[destinationZone as keyof typeof COLOMBIAN_SHIPPING_ZONES]?.baseRate || 1.0;
            price *= zoneMultiplier;
            
            if (hasRecaudo) {
              price += declaredValue * 0.02; // 2% COD fee
            }
            break;
            
          case "flat_rate":
            // Fixed rate based on service type and zones
            const baseFlat = service.code.includes("EXPRESS") ? 25000 : 15000;
            const zoneMultiplierFlat = COLOMBIAN_SHIPPING_ZONES[destinationZone as keyof typeof COLOMBIAN_SHIPPING_ZONES]?.baseRate || 1.0;
            price = baseFlat * zoneMultiplierFlat;
            break;
        }

        // Apply same-day delivery surcharge
        if (service.sameDayDelivery && destinationZone !== "ZONE_1") {
          return; // Same day delivery only available in major cities
        }

        if (service.sameDayDelivery) {
          price *= 2; // Double price for same-day delivery
        }

        // Create tracking URL template
        const trackingUrl = createTrackingUrl(company.code, "{tracking_number}");

        rates.push({
          id: `${company.code}_${service.code}`,
          company: company.name,
          serviceName: service.name,
          serviceCode: service.code,
          description: service.description,
          price: Math.round(price),
          priceFormatted: formatCOP(price),
          estimatedDays: service.estimatedDays,
          hasRecaudo: service.hasRecaudo || false,
          trackingUrl,
          restrictions: generateRestrictions(service, cartWeight)
        });

      } catch (error) {
        console.error(`Error calculating rate for ${company.name} ${service.name}:`, error);
      }
    });
  });

  // Sort by price (cheapest first)
  return rates.sort((a, b) => a.price - b.price);
}

function createTrackingUrl(companyCode: string, trackingNumber: string): string {
  const trackingUrls = {
    ENVIA: `https://envia.co/tracking?guia=${trackingNumber}`,
    SERVIENTREGA: `https://servientrega.com/rastro?tracking=${trackingNumber}`,
    COORDINADORA: `https://coordinadora.com/seguimiento/?guia=${trackingNumber}`,
    INTERRAPIDISIMO: `https://interrapidisimo.com/tracking?numero=${trackingNumber}`
  };

  return trackingUrls[companyCode as keyof typeof trackingUrls] || `https://example.com/track/${trackingNumber}`;
}

function generateRestrictions(service: any, cartWeight: number): string[] {
  const restrictions: string[] = [];

  if (service.maxWeight && cartWeight > service.maxWeight * 0.8) {
    restrictions.push(`Peso máximo: ${service.maxWeight}kg`);
  }

  if (service.maxDimensions) {
    restrictions.push(`Dimensiones máximas: ${service.maxDimensions}`);
  }

  if (service.sameDayDelivery) {
    restrictions.push("Solo disponible en ciudades principales");
    restrictions.push("Pedido antes de las 2:00 PM");
  }

  if (service.hasRecaudo) {
    restrictions.push("Incluye recaudo contra entrega");
  }

  return restrictions;
}

// Helper to find cheapest rate
export function getCheapestColombianRate(
  options: ColombianShippingOptions
): ColombianShippingRate | null {
  const rates = calculateColombianShippingRates(options);
  return rates.length > 0 ? rates[0] : null;
}

// Helper to get rates by company
export function getRatesByCompany(
  options: ColombianShippingOptions,
  companyCode: string
): ColombianShippingRate[] {
  const allRates = calculateColombianShippingRates(options);
  return allRates.filter(rate => rate.id.startsWith(companyCode));
}

// Helper to get express rates only
export function getExpressRates(
  options: ColombianShippingOptions
): ColombianShippingRate[] {
  const allRates = calculateColombianShippingRates(options);
  return allRates.filter(rate => 
    rate.serviceCode.includes("EXPRESS") || 
    rate.serviceCode.includes("SUPER") ||
    rate.estimatedDays <= 1
  );
}