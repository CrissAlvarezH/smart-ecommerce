import { db } from "@/db";
import { shippingZones, shippingRates, shippingMethods } from "@/db/schemas";
import { eq, and, sql, desc, asc } from "drizzle-orm";

export async function getShippingZones(storeId: string) {
  return await db
    .select()
    .from(shippingZones)
    .where(eq(shippingZones.storeId, storeId))
    .orderBy(desc(shippingZones.createdAt));
}

export async function getShippingZoneById(id: string, storeId: string) {
  const zone = await db
    .select()
    .from(shippingZones)
    .where(and(eq(shippingZones.id, id), eq(shippingZones.storeId, storeId)))
    .limit(1);
  
  return zone[0];
}

export async function createShippingZone(data: {
  name: string;
  storeId: string;
  countries?: string[] | null;
  states?: string[] | null;
  postalCodes?: string[] | null;
  isActive?: boolean;
}) {
  const result = await db
    .insert(shippingZones)
    .values(data)
    .returning();
  
  return result[0];
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
  const result = await db
    .update(shippingZones)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(shippingZones.id, id), eq(shippingZones.storeId, storeId)))
    .returning();
  
  return result[0];
}

export async function deleteShippingZone(id: string, storeId: string) {
  const result = await db
    .delete(shippingZones)
    .where(and(eq(shippingZones.id, id), eq(shippingZones.storeId, storeId)))
    .returning();
  
  return result[0];
}

export async function getShippingRatesByZone(zoneId: string) {
  return await db
    .select()
    .from(shippingRates)
    .where(eq(shippingRates.zoneId, zoneId))
    .orderBy(asc(shippingRates.name));
}

export async function getShippingRateById(id: string) {
  const rate = await db
    .select()
    .from(shippingRates)
    .where(eq(shippingRates.id, id))
    .limit(1);
  
  return rate[0];
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
  const result = await db
    .insert(shippingRates)
    .values(data)
    .returning();
  
  return result[0];
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
  const result = await db
    .update(shippingRates)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(shippingRates.id, id))
    .returning();
  
  return result[0];
}

export async function deleteShippingRate(id: string) {
  const result = await db
    .delete(shippingRates)
    .where(eq(shippingRates.id, id))
    .returning();
  
  return result[0];
}

export async function getShippingMethods(storeId: string) {
  return await db
    .select()
    .from(shippingMethods)
    .where(eq(shippingMethods.storeId, storeId))
    .orderBy(asc(shippingMethods.name));
}

export async function getShippingMethodById(id: string, storeId: string) {
  const method = await db
    .select()
    .from(shippingMethods)
    .where(and(eq(shippingMethods.id, id), eq(shippingMethods.storeId, storeId)))
    .limit(1);
  
  return method[0];
}

export async function createShippingMethod(data: {
  name: string;
  carrier?: string | null;
  code?: string | null;
  trackingUrlTemplate?: string | null;
  storeId: string;
  isActive?: boolean;
}) {
  const result = await db
    .insert(shippingMethods)
    .values(data)
    .returning();
  
  return result[0];
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
  const result = await db
    .update(shippingMethods)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(shippingMethods.id, id), eq(shippingMethods.storeId, storeId)))
    .returning();
  
  return result[0];
}

export async function deleteShippingMethod(id: string, storeId: string) {
  const result = await db
    .delete(shippingMethods)
    .where(and(eq(shippingMethods.id, id), eq(shippingMethods.storeId, storeId)))
    .returning();
  
  return result[0];
}

export async function getShippingZonesWithRates(storeId: string) {
  const zones = await db
    .select({
      zone: shippingZones,
      rateCount: sql<number>`COUNT(DISTINCT ${shippingRates.id})`.as('rate_count')
    })
    .from(shippingZones)
    .leftJoin(shippingRates, eq(shippingZones.id, shippingRates.zoneId))
    .where(eq(shippingZones.storeId, storeId))
    .groupBy(shippingZones.id)
    .orderBy(desc(shippingZones.createdAt));

  return zones;
}