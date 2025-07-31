import * as productsRepo from "@/repositories/admin/products";
import * as categoriesRepo from "@/repositories/admin/categories";
import * as collectionsRepo from "@/repositories/admin/collections";

export const adminProductService = {
  getProducts: productsRepo.getProducts,
  getProductsCount: productsRepo.getProductsCount,
  getProductById: productsRepo.getProductById,
  getProductBySlug: productsRepo.getProductBySlug,
  createProduct: productsRepo.createProduct,
  updateProduct: productsRepo.updateProduct,
  deleteProduct: productsRepo.deleteProduct,
  addProductImage: productsRepo.addProductImage,
  updateProductImage: productsRepo.updateProductImage,
  deleteProductImage: productsRepo.deleteProductImage,
  getProductImages: productsRepo.getProductImages,
  getProductCollections: productsRepo.getProductCollections,
};

export const adminCategoryService = {
  getCategories: categoriesRepo.getCategories,
  getCategoriesCount: categoriesRepo.getCategoriesCount,
  getCategoryById: categoriesRepo.getCategoryById,
  getCategoryBySlug: categoriesRepo.getCategoryBySlug,
  getActiveCategories: categoriesRepo.getActiveCategories,
  createCategory: categoriesRepo.createCategory,
  updateCategory: categoriesRepo.updateCategory,
  deleteCategory: categoriesRepo.deleteCategory,
};

export const adminCollectionService = {
  getCollections: collectionsRepo.getCollections,
  getCollectionById: collectionsRepo.getCollectionById,
  getCollectionBySlug: collectionsRepo.getCollectionBySlug,
  getActiveCollections: collectionsRepo.getActiveCollections,
  getCollectionProducts: collectionsRepo.getCollectionProducts,
  getProductCollections: collectionsRepo.getProductCollections,
  createCollection: collectionsRepo.createCollection,
  updateCollection: collectionsRepo.updateCollection,
  deleteCollection: collectionsRepo.deleteCollection,
  addProductToCollection: collectionsRepo.addProductToCollection,
  removeProductFromCollection: collectionsRepo.removeProductFromCollection,
};