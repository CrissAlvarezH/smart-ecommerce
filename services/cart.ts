import {
  getOrCreateCart,
  getCartWithItems,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  getCartTotal,
  getCartItemCount,
  mergeGuestCartToUser
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
};