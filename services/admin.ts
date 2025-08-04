import * as productsRepo from "@/repositories/admin/products";
import * as categoriesRepo from "@/repositories/admin/categories";
import * as collectionsRepo from "@/repositories/admin/collections";
import * as discountsRepo from "@/repositories/admin/discounts";

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

export const adminDiscountService = {
  getDiscounts: discountsRepo.getDiscounts,
  getDiscountsCount: discountsRepo.getDiscountsCount,
  getDiscountById: discountsRepo.getDiscountById,
  createDiscount: discountsRepo.createDiscount,
  updateDiscount: discountsRepo.updateDiscount,
  deleteDiscount: discountsRepo.deleteDiscount,
  addProductToDiscount: discountsRepo.addProductToDiscount,
  removeProductFromDiscount: discountsRepo.removeProductFromDiscount,
  getDiscountProducts: discountsRepo.getDiscountProducts,
  getProductDiscounts: discountsRepo.getProductDiscounts,
  getActiveDiscountsForProducts: discountsRepo.getActiveDiscountsForProducts,
  addCollectionToDiscount: discountsRepo.addCollectionToDiscount,
  removeCollectionFromDiscount: discountsRepo.removeCollectionFromDiscount,
  getDiscountCollections: discountsRepo.getDiscountCollections,
  getProductsFromDiscountedCollections: discountsRepo.getProductsFromDiscountedCollections,
  getAllDiscountProducts: discountsRepo.getAllDiscountProducts,
};