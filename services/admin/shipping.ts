import * as shippingRepository from "@/repositories/admin/shipping";
import { type InsertShippingZone, type SelectShippingZone } from "@/db/schemas";

export async function getShippingZones(storeId: string): Promise<SelectShippingZone[]> {
  return await shippingRepository.getShippingZones(storeId);
}

export async function getShippingZoneById(id: string, storeId: string): Promise<SelectShippingZone | undefined> {
  return await shippingRepository.getShippingZoneById(id, storeId);
}

export async function createShippingZone(data: {
  name: string;
  storeId: string;
  departments: string[];
  cities: string[];
  price: string;
  isActive?: boolean;
}): Promise<SelectShippingZone> {
  const shippingZoneData: InsertShippingZone = {
    name: data.name,
    storeId: data.storeId,
    departments: data.departments,
    cities: data.cities,
    price: data.price,
    isActive: data.isActive ?? true,
  };
  
  return await shippingRepository.createShippingZone(shippingZoneData);
}

export async function updateShippingZone(
  id: string,
  storeId: string,
  data: {
    name?: string;
    departments?: string[];
    cities?: string[];
    price?: string;
    isActive?: boolean;
  }
): Promise<SelectShippingZone | undefined> {
  return await shippingRepository.updateShippingZone(id, storeId, data);
}

export async function deleteShippingZone(id: string, storeId: string): Promise<boolean> {
  return await shippingRepository.deleteShippingZone(id, storeId);
}

export async function toggleShippingZoneStatus(id: string, storeId: string): Promise<SelectShippingZone | undefined> {
  const zone = await shippingRepository.getShippingZoneById(id, storeId);
  if (!zone) {
    throw new Error("Shipping zone not found");
  }
  
  return await shippingRepository.updateShippingZone(id, storeId, {
    isActive: !zone.isActive,
  });
}

export async function calculateShippingCost(
  storeId: string,
  department: string,
  city: string
): Promise<{ zoneId: string; price: string } | null> {
  const zone = await shippingRepository.getActiveShippingZoneForLocation(storeId, department, city);
  
  if (!zone || !zone.price) {
    return null;
  }
  
  return {
    zoneId: zone.id,
    price: zone.price,
  };
}