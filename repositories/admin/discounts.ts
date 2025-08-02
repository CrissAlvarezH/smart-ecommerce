import { db } from "@/db";
import { discounts, productDiscounts, products } from "@/db/schemas";
import { eq, desc, ilike, and, sql, lt, gte } from "drizzle-orm";

export interface CreateDiscountData {
  name: string;
  percentage: string;
  endDate: Date;
  storeId: string;
  isActive?: boolean;
}

export interface UpdateDiscountData extends Partial<CreateDiscountData> {
  id: string;
}

export async function createDiscount(data: CreateDiscountData) {
  const discount = await db
    .insert(discounts)
    .values({
      ...data,
      updatedAt: new Date(),
    })
    .returning();

  return discount[0];
}

export async function updateDiscount(data: UpdateDiscountData) {
  const { id, ...updateData } = data;
  
  const discount = await db
    .update(discounts)
    .set({
      ...updateData,
      updatedAt: new Date(),
    })
    .where(eq(discounts.id, id))
    .returning();

  return discount[0];
}

export async function deleteDiscount(id: string) {
  // Delete product-discount relationships first
  await db
    .delete(productDiscounts)
    .where(eq(productDiscounts.discountId, id));

  // Delete the discount
  await db
    .delete(discounts)
    .where(eq(discounts.id, id));
}

export async function getDiscounts(limit = 50, offset = 0, search?: string, storeId?: string, includeExpired = false) {
  const conditions = [];

  // Always filter by store if provided
  if (storeId) {
    conditions.push(eq(discounts.storeId, storeId));
  }

  if (search) {
    conditions.push(ilike(discounts.name, `%${search}%`));
  }

  // Filter out expired discounts unless explicitly requested
  if (!includeExpired) {
    conditions.push(gte(discounts.endDate, new Date()));
  }

  let query = db
    .select({
      id: discounts.id,
      name: discounts.name,
      percentage: discounts.percentage,
      endDate: discounts.endDate,
      isActive: discounts.isActive,
      createdAt: discounts.createdAt,
      updatedAt: discounts.updatedAt,
      productCount: sql<number>`count(${productDiscounts.productId})`.as('productCount')
    })
    .from(discounts)
    .leftJoin(productDiscounts, eq(discounts.id, productDiscounts.discountId))
    .groupBy(discounts.id);

  // Apply conditions if any
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  return await query
    .orderBy(desc(discounts.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getDiscountsCount(search?: string, storeId?: string, includeExpired = false) {
  const conditions = [];

  if (storeId) {
    conditions.push(eq(discounts.storeId, storeId));
  }

  if (search) {
    conditions.push(ilike(discounts.name, `%${search}%`));
  }

  if (!includeExpired) {
    conditions.push(gte(discounts.endDate, new Date()));
  }

  let query = db
    .select({ count: sql<number>`count(*)` })
    .from(discounts);

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  const result = await query;
  return result[0]?.count || 0;
}

export async function getDiscountById(id: string, storeId?: string) {
  const discount = await db
    .select()
    .from(discounts)
    .where(storeId ? and(eq(discounts.id, id), eq(discounts.storeId, storeId)) : eq(discounts.id, id))
    .limit(1);

  return discount[0] || null;
}

export async function addProductToDiscount(discountId: string, productId: string) {
  const result = await db
    .insert(productDiscounts)
    .values({
      discountId,
      productId,
    })
    .returning();

  return result[0];
}

export async function removeProductFromDiscount(discountId: string, productId: string) {
  await db
    .delete(productDiscounts)
    .where(and(
      eq(productDiscounts.discountId, discountId),
      eq(productDiscounts.productId, productId)
    ));
}

export async function getDiscountProducts(discountId: string) {
  return await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      price: products.price,
      sku: products.sku,
      isActive: products.isActive,
    })
    .from(productDiscounts)
    .innerJoin(products, eq(productDiscounts.productId, products.id))
    .where(eq(productDiscounts.discountId, discountId));
}

export async function getProductDiscounts(productId: string) {
  return await db
    .select({
      id: discounts.id,
      name: discounts.name,
      percentage: discounts.percentage,
      endDate: discounts.endDate,
      isActive: discounts.isActive,
    })
    .from(productDiscounts)
    .innerJoin(discounts, eq(productDiscounts.discountId, discounts.id))
    .where(and(
      eq(productDiscounts.productId, productId),
      eq(discounts.isActive, true),
      gte(discounts.endDate, new Date()) // Only active and non-expired discounts
    ));
}

export async function getActiveDiscountsForProducts(productIds: string[]) {
  if (productIds.length === 0) return [];
  
  return await db
    .select({
      productId: productDiscounts.productId,
      discountId: discounts.id,
      name: discounts.name,
      percentage: discounts.percentage,
      endDate: discounts.endDate,
    })
    .from(productDiscounts)
    .innerJoin(discounts, eq(productDiscounts.discountId, discounts.id))
    .where(and(
      sql`${productDiscounts.productId} = ANY(${productIds})`,
      eq(discounts.isActive, true),
      gte(discounts.endDate, new Date())
    ));
}