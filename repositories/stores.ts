import { db } from "@/db";
import { stores, type InsertStore, type SelectStore } from "@/db/schemas";
import { eq, and, ne } from "drizzle-orm";

export const storeRepository = {
  async create(data: InsertStore): Promise<SelectStore> {
    const [store] = await db.insert(stores).values(data).returning();
    return store;
  },

  async findById(id: string): Promise<SelectStore | null> {
    const [store] = await db
      .select()
      .from(stores)
      .where(eq(stores.id, id))
      .limit(1);
    return store || null;
  },

  async findBySlug(slug: string): Promise<SelectStore | null> {
    const [store] = await db
      .select()
      .from(stores)
      .where(eq(stores.slug, slug))
      .limit(1);
    return store || null;
  },

  async findByOwnerId(ownerId: number): Promise<SelectStore[]> {
    return await db
      .select()
      .from(stores)
      .where(eq(stores.ownerId, ownerId));
  },

  async findAll(): Promise<SelectStore[]> {
    return await db
      .select()
      .from(stores)
      .where(eq(stores.isActive, true));
  },

  async update(id: string, data: Partial<InsertStore>): Promise<SelectStore | null> {
    const [store] = await db
      .update(stores)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(stores.id, id))
      .returning();
    return store || null;
  },

  async delete(id: string): Promise<boolean> {
    const result = await db
      .delete(stores)
      .where(eq(stores.id, id));
    return result.rowCount > 0;
  },

  async checkSlugExists(slug: string, excludeId?: string): Promise<boolean> {
    const conditions = excludeId 
      ? and(eq(stores.slug, slug), ne(stores.id, excludeId))
      : eq(stores.slug, slug);
    
    const [existing] = await db
      .select({ id: stores.id })
      .from(stores)
      .where(conditions)
      .limit(1);
    
    return !!existing;
  },
};