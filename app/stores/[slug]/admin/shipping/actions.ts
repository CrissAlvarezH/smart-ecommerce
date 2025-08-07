"use server";

import { authenticatedAction } from "@/lib/server-actions";
import { z } from "zod";
import * as shippingService from "@/services/admin/shipping-service";
import { revalidatePath } from "next/cache";

const createShippingZoneSchema = z.object({
  name: z.string().min(1, "Name is required"),
  storeId: z.string().uuid(),
  countries: z.array(z.string()).optional().nullable(),
  states: z.array(z.string()).optional().nullable(),
  postalCodes: z.array(z.string()).optional().nullable(),
  isActive: z.boolean().optional(),
});

export const createShippingZoneAction = authenticatedAction
  .inputSchema(createShippingZoneSchema)
  .action(async ({ parsedInput }) => {
    const zone = await shippingService.createShippingZone(parsedInput);
    revalidatePath("/admin/shipping");
    return { zone };
  });

const updateShippingZoneSchema = z.object({
  id: z.string().uuid(),
  storeId: z.string().uuid(),
  name: z.string().min(1, "Name is required").optional(),
  countries: z.array(z.string()).optional().nullable(),
  states: z.array(z.string()).optional().nullable(),
  postalCodes: z.array(z.string()).optional().nullable(),
  isActive: z.boolean().optional(),
});

export const updateShippingZoneAction = authenticatedAction
  .inputSchema(updateShippingZoneSchema)
  .action(async ({ parsedInput }) => {
    const { id, storeId, ...data } = parsedInput;
    const zone = await shippingService.updateShippingZone(id, storeId, data);
    revalidatePath("/admin/shipping");
    return { zone };
  });

const deleteShippingZoneSchema = z.object({
  id: z.string().uuid(),
  storeId: z.string().uuid(),
});

export const deleteShippingZoneAction = authenticatedAction
  .inputSchema(deleteShippingZoneSchema)
  .action(async ({ parsedInput }) => {
    await shippingService.deleteShippingZone(parsedInput.id, parsedInput.storeId);
    revalidatePath("/admin/shipping");
    return { success: true };
  });

const getShippingZonesSchema = z.object({
  storeId: z.string().uuid(),
});

export const getShippingZonesAction = authenticatedAction
  .inputSchema(getShippingZonesSchema)
  .action(async ({ parsedInput }) => {
    const zones = await shippingService.getShippingZonesForStore(parsedInput.storeId);
    return { zones };
  });

const getShippingZoneWithRatesSchema = z.object({
  zoneId: z.string().uuid(),
  storeId: z.string().uuid(),
});

export const getShippingZoneWithRatesAction = authenticatedAction
  .inputSchema(getShippingZoneWithRatesSchema)
  .action(async ({ parsedInput }) => {
    const data = await shippingService.getShippingZoneWithRates(parsedInput.zoneId, parsedInput.storeId);
    return data;
  });

const createShippingRateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().nullable(),
  zoneId: z.string().uuid(),
  type: z.enum(["flat_rate", "weight_based", "price_based", "free"]),
  price: z.string().optional().nullable(),
  minWeight: z.string().optional().nullable(),
  maxWeight: z.string().optional().nullable(),
  minPrice: z.string().optional().nullable(),
  maxPrice: z.string().optional().nullable(),
  estimatedDays: z.number().optional().nullable(),
  isActive: z.boolean().optional(),
});

export const createShippingRateAction = authenticatedAction
  .inputSchema(createShippingRateSchema)
  .action(async ({ parsedInput }) => {
    const rate = await shippingService.createShippingRate(parsedInput);
    revalidatePath("/admin/shipping");
    return { rate };
  });

const updateShippingRateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().optional().nullable(),
  type: z.enum(["flat_rate", "weight_based", "price_based", "free"]).optional(),
  price: z.string().optional().nullable(),
  minWeight: z.string().optional().nullable(),
  maxWeight: z.string().optional().nullable(),
  minPrice: z.string().optional().nullable(),
  maxPrice: z.string().optional().nullable(),
  estimatedDays: z.number().optional().nullable(),
  isActive: z.boolean().optional(),
});

export const updateShippingRateAction = authenticatedAction
  .inputSchema(updateShippingRateSchema)
  .action(async ({ parsedInput }) => {
    const { id, ...data } = parsedInput;
    const rate = await shippingService.updateShippingRate(id, data);
    revalidatePath("/admin/shipping");
    return { rate };
  });

const deleteShippingRateSchema = z.object({
  id: z.string().uuid(),
});

export const deleteShippingRateAction = authenticatedAction
  .inputSchema(deleteShippingRateSchema)
  .action(async ({ parsedInput }) => {
    await shippingService.deleteShippingRate(parsedInput.id);
    revalidatePath("/admin/shipping");
    return { success: true };
  });

const getShippingMethodsSchema = z.object({
  storeId: z.string().uuid(),
});

export const getShippingMethodsAction = authenticatedAction
  .inputSchema(getShippingMethodsSchema)
  .action(async ({ parsedInput }) => {
    const methods = await shippingService.getShippingMethodsForStore(parsedInput.storeId);
    return { methods };
  });

const createShippingMethodSchema = z.object({
  name: z.string().min(1, "Name is required"),
  carrier: z.string().optional().nullable(),
  code: z.string().optional().nullable(),
  trackingUrlTemplate: z.string().optional().nullable(),
  storeId: z.string().uuid(),
  isActive: z.boolean().optional(),
});

export const createShippingMethodAction = authenticatedAction
  .inputSchema(createShippingMethodSchema)
  .action(async ({ parsedInput }) => {
    const method = await shippingService.createShippingMethod(parsedInput);
    revalidatePath("/admin/shipping");
    return { method };
  });

const updateShippingMethodSchema = z.object({
  id: z.string().uuid(),
  storeId: z.string().uuid(),
  name: z.string().min(1, "Name is required").optional(),
  carrier: z.string().optional().nullable(),
  code: z.string().optional().nullable(),
  trackingUrlTemplate: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

export const updateShippingMethodAction = authenticatedAction
  .inputSchema(updateShippingMethodSchema)
  .action(async ({ parsedInput }) => {
    const { id, storeId, ...data } = parsedInput;
    const method = await shippingService.updateShippingMethod(id, storeId, data);
    revalidatePath("/admin/shipping");
    return { method };
  });

const deleteShippingMethodSchema = z.object({
  id: z.string().uuid(),
  storeId: z.string().uuid(),
});

export const deleteShippingMethodAction = authenticatedAction
  .inputSchema(deleteShippingMethodSchema)
  .action(async ({ parsedInput }) => {
    await shippingService.deleteShippingMethod(parsedInput.id, parsedInput.storeId);
    revalidatePath("/admin/shipping");
    return { success: true };
  });