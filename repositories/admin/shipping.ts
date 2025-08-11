import { db } from "@/db";
import { shippingZones, type InsertShippingZone, type SelectShippingZone } from "@/db/schemas";
import { eq, and, desc } from "drizzle-orm";

export async function getShippingZones(storeId: string): Promise<SelectShippingZone[]> {
  return await db
    .select()
    .from(shippingZones)
    .where(eq(shippingZones.storeId, storeId))
    .orderBy(desc(shippingZones.createdAt));
}

export async function getShippingZoneById(id: string, storeId: string): Promise<SelectShippingZone | undefined> {
  const [zone] = await db
    .select()
    .from(shippingZones)
    .where(and(eq(shippingZones.id, id), eq(shippingZones.storeId, storeId)))
    .limit(1);
  
  return zone;
}

export async function createShippingZone(data: InsertShippingZone): Promise<SelectShippingZone> {
  const [newZone] = await db.insert(shippingZones).values(data).returning();
  return newZone;
}

export async function updateShippingZone(
  id: string, 
  storeId: string, 
  data: Partial<InsertShippingZone>
): Promise<SelectShippingZone | undefined> {
  const [updatedZone] = await db
    .update(shippingZones)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(and(eq(shippingZones.id, id), eq(shippingZones.storeId, storeId)))
    .returning();
  
  return updatedZone;
}

export async function deleteShippingZone(id: string, storeId: string): Promise<boolean> {
  const result = await db
    .delete(shippingZones)
    .where(and(eq(shippingZones.id, id), eq(shippingZones.storeId, storeId)))
    .returning();
  
  return result.length > 0;
}

export async function getActiveShippingZoneForLocation(
  storeId: string,
  department: string,
  city: string
): Promise<SelectShippingZone | undefined> {
  const zones = await db
    .select()
    .from(shippingZones)
    .where(and(
      eq(shippingZones.storeId, storeId),
      eq(shippingZones.isActive, true)
    ))
    .orderBy(desc(shippingZones.createdAt));
  
  // Find a zone that includes the specific city and department
  for (const zone of zones) {
    const departments = zone.departments as string[];
    const cities = zone.cities as string[];
    
    if (departments.includes(department) && cities.includes(city)) {
      return zone;
    }
  }
  
  return undefined;
}