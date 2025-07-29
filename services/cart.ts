import {
  getOrCreateCart,
  getCartWithItems,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  getCartTotal,
  getCartItemCount,
  mergeGuestCartToUser,
  isProductInCart,
  getCartBySession
} from "@/repositories/cart";

export const cartService = {
  getOrCreateCart,
  getCartWithItems,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  getCartTotal,
  getCartItemCount,
  mergeGuestCartToUser,
  isProductInCart,
  getCartBySession,
};