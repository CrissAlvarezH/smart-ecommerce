import { storeRepository } from "@/repositories/stores";
import { type InsertStore, type SelectStore } from "@/db/schemas";
import slugify from "slugify";

export const storeService = {
  async createStore(data: Omit<InsertStore, 'slug' | 'createdAt' | 'updatedAt'>): Promise<SelectStore> {
    // Generate slug from name
    const baseSlug = slugify(data.name, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;
    
    // Ensure slug is unique
    while (await storeRepository.checkSlugExists(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    return await storeRepository.create({
      ...data,
      slug,
    });
  },

  async getStoreById(id: string): Promise<SelectStore | null> {
    return await storeRepository.findById(id);
  },

  async getStoreBySlug(slug: string): Promise<SelectStore | null> {
    return await storeRepository.findBySlug(slug);
  },

  async getStoresByOwner(ownerId: number): Promise<SelectStore[]> {
    return await storeRepository.findByOwnerId(ownerId);
  },

  async getAllStores(): Promise<SelectStore[]> {
    return await storeRepository.findAll();
  },

  async updateStore(id: string, data: Partial<InsertStore>): Promise<SelectStore | null> {
    // If name is being updated, regenerate slug
    if (data.name) {
      const baseSlug = slugify(data.name, { lower: true, strict: true });
      let slug = baseSlug;
      let counter = 1;
      
      // Ensure slug is unique (excluding current store)
      while (await storeRepository.checkSlugExists(slug, id)) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      
      data.slug = slug;
    }
    
    return await storeRepository.update(id, data);
  },

  async deleteStore(id: string): Promise<boolean> {
    return await storeRepository.delete(id);
  },

  async validateStoreData(data: Partial<InsertStore>): Promise<string[]> {
    const errors: string[] = [];
    
    if (data.name && data.name.trim().length < 2) {
      errors.push("Store name must be at least 2 characters long");
    }
    
    if (data.email && !isValidEmail(data.email)) {
      errors.push("Invalid email address");
    }
    
    if (data.domain && !isValidDomain(data.domain)) {
      errors.push("Invalid domain format");
    }
    
    return errors;
  }
};

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidDomain(domain: string): boolean {
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])*$/;
  return domainRegex.test(domain);
}