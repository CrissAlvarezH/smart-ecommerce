"use server";

import { authenticatedAction } from "@/lib/server-actions";
import { z } from "zod";
import * as shippingService from "@/services/admin/shipping";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const shippingZoneSchema = z.object({
  name: z.string().min(1, "Name is required"),
  departments: z.array(z.string()).min(1, "At least one department is required"),
  cities: z.array(z.string()).min(1, "At least one city is required"),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Price must be a valid decimal number"),
  isActive: z.boolean().optional(),
});

export const getShippingZonesAction = authenticatedAction
  .inputSchema(z.object({ storeId: z.string() }))
  .action(async ({ parsedInput }) => {
    return await shippingService.getShippingZones(parsedInput.storeId);
  });

export const getShippingZoneByIdAction = authenticatedAction
  .inputSchema(z.object({ 
    id: z.string(),
    storeId: z.string() 
  }))
  .action(async ({ parsedInput }) => {
    return await shippingService.getShippingZoneById(parsedInput.id, parsedInput.storeId);
  });

export const createShippingZoneAction = authenticatedAction
  .inputSchema(shippingZoneSchema.extend({ 
    storeId: z.string(),
    storeSlug: z.string()
  }))
  .action(async ({ parsedInput }) => {
    const { storeSlug, ...zoneData } = parsedInput;
    const zone = await shippingService.createShippingZone(zoneData);
    revalidatePath(`/stores/${storeSlug}/admin/shipping`);
    return zone;
  });

export const updateShippingZoneAction = authenticatedAction
  .inputSchema(shippingZoneSchema.partial().extend({ 
    id: z.string(),
    storeId: z.string(),
    storeSlug: z.string()
  }))
  .action(async ({ parsedInput }) => {
    const { id, storeId, storeSlug, ...updateData } = parsedInput;
    const zone = await shippingService.updateShippingZone(id, storeId, updateData);
    revalidatePath(`/stores/${storeSlug}/admin/shipping`);
    return zone;
  });

export const deleteShippingZoneAction = authenticatedAction
  .inputSchema(z.object({ 
    id: z.string(),
    storeId: z.string(),
    storeSlug: z.string()
  }))
  .action(async ({ parsedInput }) => {
    const success = await shippingService.deleteShippingZone(parsedInput.id, parsedInput.storeId);
    if (success) {
      revalidatePath(`/stores/${parsedInput.storeSlug}/admin/shipping`);
    }
    return success;
  });

export const toggleShippingZoneStatusAction = authenticatedAction
  .inputSchema(z.object({ 
    id: z.string(),
    storeId: z.string(),
    storeSlug: z.string()
  }))
  .action(async ({ parsedInput }) => {
    const zone = await shippingService.toggleShippingZoneStatus(parsedInput.id, parsedInput.storeId);
    revalidatePath(`/stores/${parsedInput.storeSlug}/admin/shipping`);
    return zone;
  });