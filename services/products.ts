import { 
  getProducts, 
  getProductBySlug, 
  getFeaturedProducts, 
  getCategories, 
  getCollections,
  getProductsByCategory,
  getProductsByCollection,
  searchProducts
} from "@/repositories/products";

export const productService = {
  getProducts,
  getProductBySlug,
  getFeaturedProducts,
  getCategories,
  getCollections,
  getProductsByCategory,
  getProductsByCollection,
  searchProducts,
};