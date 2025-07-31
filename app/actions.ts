"use server";

import { z } from "zod";
import { authenticatedAction, unauthenticatedAction } from "@/lib/server-actions";
import { storeService } from "@/services/stores";

const createStoreSchema = z.object({
  name: z.string().min(2, "Store name must be at least 2 characters"),
  description: z.string().optional(),
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  currency: z.string().default("USD"),
  timezone: z.string().default("UTC"),
});

export const createStoreAction = authenticatedAction
  .inputSchema(createStoreSchema)
  .action(async ({ parsedInput, ctx: { user } }) => {
    const store = await storeService.createStore({
      ...parsedInput,
      ownerId: user.id,
    });
    
    return { store };
  });

export const getMyStoresAction = authenticatedAction
  .inputSchema(z.object({}))
  .action(async ({ ctx: { user } }) => {
    const stores = await storeService.getStoresByOwner(user.id);
    return { stores };
  });

export const getAllStoresAction = unauthenticatedAction
  .inputSchema(z.object({}))
  .action(async () => {
    const stores = await storeService.getAllStores();
    return { stores };
  });

export const getStoreBySlugAction = unauthenticatedAction
  .inputSchema(z.object({ slug: z.string() }))
  .action(async ({ parsedInput }) => {
    const store = await storeService.getStoreBySlug(parsedInput.slug);
    return { store };
  });

export const debugStoresAction = authenticatedAction
  .inputSchema(z.object({}))
  .action(async ({ ctx: { user } }) => {
    console.log("=== DEBUG STORES ACTION ===");
    console.log("User ID:", user.id, "Type:", typeof user.id);
    
    // Get all stores from database
    const allStores = await storeService.getAllStores();
    console.log("All stores in database:", allStores);
    
    // Get user's stores
    const userStores = await storeService.getStoresByOwner(user.id);
    console.log("User's stores:", userStores);
    
    return { 
      userId: user.id,
      allStores,
      userStores,
      userStoresCount: userStores.length
    };
  });