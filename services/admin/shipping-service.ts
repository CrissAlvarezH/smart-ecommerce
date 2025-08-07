import * as shippingRepository from "@/repositories/admin/shipping-repository";
import { SelectShippingZone, SelectShippingRate, SelectShippingMethod } from "@/db/schemas";

export async function getShippingZonesForStore(storeId: string) {
  const zones = await shippingRepository.getShippingZonesWithRates(storeId);
  return zones.map(({ zone, rateCount }) => ({
    ...zone,
    rateCount: Number(rateCount) || 0
  }));
}

export async function getShippingZoneWithRates(zoneId: string, storeId: string) {
  const zone = await shippingRepository.getShippingZoneById(zoneId, storeId);
  if (!zone) {
    throw new Error("Shipping zone not found");
  }
  
  const rates = await shippingRepository.getShippingRatesByZone(zoneId);
  
  return {
    zone,
    rates
  };
}

export async function createShippingZone(data: {
  name: string;
  storeId: string;
  countries?: string[] | null;
  states?: string[] | null;
  postalCodes?: string[] | null;
  isActive?: boolean;
}) {
  return await shippingRepository.createShippingZone(data);
}

export async function updateShippingZone(
  id: string,
  storeId: string,
  data: {
    name?: string;
    countries?: string[] | null;
    states?: string[] | null;
    postalCodes?: string[] | null;
    isActive?: boolean;
  }
) {
  return await shippingRepository.updateShippingZone(id, storeId, data);
}

export async function deleteShippingZone(id: string, storeId: string) {
  const rates = await shippingRepository.getShippingRatesByZone(id);
  if (rates.length > 0) {
    throw new Error("Cannot delete shipping zone with existing rates");
  }
  
  return await shippingRepository.deleteShippingZone(id, storeId);
}

export async function createShippingRate(data: {
  name: string;
  description?: string | null;
  zoneId: string;
  type: string;
  price?: string | null;
  minWeight?: string | null;
  maxWeight?: string | null;
  minPrice?: string | null;
  maxPrice?: string | null;
  estimatedDays?: number | null;
  isActive?: boolean;
}) {
  if (data.type === 'flat_rate' && !data.price) {
    throw new Error("Flat rate shipping must have a price");
  }
  
  if (data.type === 'weight_based' && (!data.minWeight || !data.maxWeight || !data.price)) {
    throw new Error("Weight-based shipping must have min/max weight and price");
  }
  
  if (data.type === 'price_based' && (!data.minPrice || !data.maxPrice || !data.price)) {
    throw new Error("Price-based shipping must have min/max price and rate");
  }
  
  return await shippingRepository.createShippingRate(data);
}

export async function updateShippingRate(
  id: string,
  data: {
    name?: string;
    description?: string | null;
    type?: string;
    price?: string | null;
    minWeight?: string | null;
    maxWeight?: string | null;
    minPrice?: string | null;
    maxPrice?: string | null;
    estimatedDays?: number | null;
    isActive?: boolean;
  }
) {
  const existingRate = await shippingRepository.getShippingRateById(id);
  if (!existingRate) {
    throw new Error("Shipping rate not found");
  }
  
  const finalType = data.type || existingRate.type;
  
  if (finalType === 'flat_rate' && !data.price && !existingRate.price) {
    throw new Error("Flat rate shipping must have a price");
  }
  
  return await shippingRepository.updateShippingRate(id, data);
}

export async function deleteShippingRate(id: string) {
  return await shippingRepository.deleteShippingRate(id);
}

export async function getShippingMethodsForStore(storeId: string) {
  return await shippingRepository.getShippingMethods(storeId);
}

export async function createShippingMethod(data: {
  name: string;
  carrier?: string | null;
  code?: string | null;
  trackingUrlTemplate?: string | null;
  storeId: string;
  isActive?: boolean;
}) {
  return await shippingRepository.createShippingMethod(data);
}

export async function updateShippingMethod(
  id: string,
  storeId: string,
  data: {
    name?: string;
    carrier?: string | null;
    code?: string | null;
    trackingUrlTemplate?: string | null;
    isActive?: boolean;
  }
) {
  return await shippingRepository.updateShippingMethod(id, storeId, data);
}

export async function deleteShippingMethod(id: string, storeId: string) {
  return await shippingRepository.deleteShippingMethod(id, storeId);
}