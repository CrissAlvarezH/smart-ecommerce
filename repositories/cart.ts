import { db } from "@/db";
import { carts, cartItems, products, productImages, shippingRates, shippingZones } from "@/db/schemas";
import { eq, and, desc } from "drizzle-orm";
import { applyDiscountsToProducts } from "./products";

export async function getOrCreateCart(userId?: string, sessionId?: string, storeId?: string) {
  if (!userId && !sessionId) {
    throw new Error("Either userId or sessionId must be provided");
  }

  let cart;
  
  if (userId) {
    cart = await db
      .select()
      .from(carts)
      .where(eq(carts.userId, parseInt(userId)))
      .limit(1);
  } else if (sessionId) {
    cart = await db
      .select()
      .from(carts)
      .where(eq(carts.sessionId, sessionId))
      .limit(1);
  }

  if (cart && cart.length > 0) {
    return cart[0];
  }

  // For new carts, storeId is required
  if (!storeId) {
    throw new Error("storeId is required when creating a new cart");
  }

  const newCart = await db
    .insert(carts)
    .values({
      userId: userId ? parseInt(userId) : null,
      sessionId: sessionId || null,
      storeId: storeId,
    })
    .returning();

  return newCart[0];
}

export async function getCartWithItems(cartId: string) {
  const cartItemsWithProducts = await db
    .select({
      id: cartItems.id,
      quantity: cartItems.quantity,
      createdAt: cartItems.createdAt,
      product: {
        id: products.id,
        name: products.name,
        slug: products.slug,
        price: products.price,
        compareAtPrice: products.compareAtPrice,
        inventory: products.inventory,
      },
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.cartId, cartId))
    .orderBy(desc(cartItems.createdAt));

  // Apply discounts to products
  const productsData = cartItemsWithProducts.map(item => item.product);
  const productsWithDiscounts = await applyDiscountsToProducts(productsData);
  
  // Map discounted products back to cart items
  const cartItemsWithDiscountedProducts = cartItemsWithProducts.map((item, index) => ({
    ...item,
    product: productsWithDiscounts[index]
  }));

  // Get first image for each product
  const itemsWithImages = await Promise.all(
    cartItemsWithDiscountedProducts.map(async (item) => {
      const images = await db
        .select()
        .from(productImages)
        .where(eq(productImages.productId, item.product.id))
        .orderBy(productImages.position)
        .limit(1);
      
      return {
        ...item,
        product: {
          ...item.product,
          image: images[0] || null,
        },
      };
    })
  );

  return itemsWithImages;
}

export async function addToCart(cartId: string, productId: string, quantity: number = 1) {
  // First check if product has enough stock
  const product = await db
    .select({ inventory: products.inventory })
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  if (!product[0]) {
    throw new Error("Product not found");
  }

  // Check if item already exists in cart
  const existingItem = await db
    .select()
    .from(cartItems)
    .where(and(eq(cartItems.cartId, cartId), eq(cartItems.productId, productId)))
    .limit(1);

  const totalQuantity = existingItem.length > 0 
    ? existingItem[0].quantity + quantity 
    : quantity;

  // Check if we have enough stock
  if (product[0].inventory < totalQuantity) {
    throw new Error(`Not enough stock. Only ${product[0].inventory} items available.`);
  }

  if (existingItem.length > 0) {
    // Update quantity
    const updatedItem = await db
      .update(cartItems)
      .set({ 
        quantity: totalQuantity,
        updatedAt: new Date()
      })
      .where(eq(cartItems.id, existingItem[0].id))
      .returning();
    
    return updatedItem[0];
  } else {
    // Add new item
    const newItem = await db
      .insert(cartItems)
      .values({
        cartId,
        productId,
        quantity,
      })
      .returning();
    
    return newItem[0];
  }
}

export async function updateCartItemQuantity(cartId: string, cartItemId: string, quantity: number) {
  if (quantity <= 0) {
    return await removeFromCart(cartId, cartItemId);
  }

  // Get the cart item with product info to check stock
  const cartItem = await db
    .select({
      productId: cartItems.productId,
      inventory: products.inventory
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.id, cartItemId))
    .limit(1);

  if (!cartItem[0]) {
    throw new Error("Cart item not found");
  }

  // Check if we have enough stock
  if (cartItem[0].inventory < quantity) {
    throw new Error(`Not enough stock. Only ${cartItem[0].inventory} items available.`);
  }

  const updatedItem = await db
    .update(cartItems)
    .set({ 
      quantity,
      updatedAt: new Date()
    })
    .where(eq(cartItems.id, cartItemId))
    .returning();

  return updatedItem[0];
}

export async function removeFromCart(cartId: string, cartItemId: string) {
  await db
    .delete(cartItems)
    .where(eq(cartItems.id, cartItemId));
}

export async function clearCart(cartId: string) {
  await db
    .delete(cartItems)
    .where(eq(cartItems.cartId, cartId));
}

export async function getCartTotal(cartId: string) {
  const items = await getCartWithItems(cartId);
  
  return items.reduce((total, item) => {
    const price = parseFloat(item.product.price);
    return total + (price * item.quantity);
  }, 0);
}

export async function getCartItemCount(cartId: string) {
  const items = await db
    .select()
    .from(cartItems)
    .where(eq(cartItems.cartId, cartId));
  
  return items.reduce((total, item) => total + item.quantity, 0);
}

export async function isProductInCart(cartId: string, productId: string) {
  const existingItem = await db
    .select()
    .from(cartItems)
    .where(and(eq(cartItems.cartId, cartId), eq(cartItems.productId, productId)))
    .limit(1);

  return existingItem.length > 0 ? existingItem[0] : null;
}

export async function getCartBySession(sessionId: string) {
  const cart = await db
    .select()
    .from(carts)
    .where(eq(carts.sessionId, sessionId))
    .limit(1);

  return cart.length > 0 ? cart[0] : null;
}

export async function mergeGuestCartToUser(guestSessionId: string, userId: string) {
  // Get or create user cart
  const userCart = await getOrCreateCart(userId);
  
  // Get guest cart
  const guestCart = await db
    .select()
    .from(carts)
    .where(eq(carts.sessionId, guestSessionId))
    .limit(1);

  if (guestCart.length === 0) return userCart;

  // Get guest cart items
  const guestItems = await db
    .select()
    .from(cartItems)
    .where(eq(cartItems.cartId, guestCart[0].id));

  // Move guest items to user cart
  for (const item of guestItems) {
    await addToCart(userCart.id, item.productId, item.quantity);
  }

  // Delete guest cart and items
  await db.delete(cartItems).where(eq(cartItems.cartId, guestCart[0].id));
  await db.delete(carts).where(eq(carts.id, guestCart[0].id));

  return userCart;
}

export async function updateCartShipping(cartId: string, data: {
  shippingRateId?: string | null;
  shippingCost?: string | null;
  shippingAddress?: string | null;
  shippingCity?: string | null;
  shippingState?: string | null;
  shippingCountry?: string | null;
  shippingPostalCode?: string | null;
}) {
  const updatedCart = await db
    .update(carts)
    .set({ 
      ...data,
      updatedAt: new Date()
    })
    .where(eq(carts.id, cartId))
    .returning();

  return updatedCart[0];
}

export async function getCartWithShippingDetails(cartId: string) {
  const cart = await db
    .select({
      cart: carts,
      shippingRate: shippingRates,
      shippingZone: shippingZones,
    })
    .from(carts)
    .leftJoin(shippingRates, eq(carts.shippingRateId, shippingRates.id))
    .leftJoin(shippingZones, eq(shippingRates.zoneId, shippingZones.id))
    .where(eq(carts.id, cartId))
    .limit(1);

  return cart[0] || null;
}

export async function getAvailableShippingRates(storeId: string, address?: {
  country?: string;
  state?: string;
  postalCode?: string;
}) {
  // For now, get all active shipping zones and rates for the store
  // In a more advanced implementation, you would filter by address
  const zones = await db
    .select({
      zone: shippingZones,
      rates: shippingRates,
    })
    .from(shippingZones)
    .innerJoin(shippingRates, and(
      eq(shippingZones.id, shippingRates.zoneId),
      eq(shippingRates.isActive, true)
    ))
    .where(and(
      eq(shippingZones.storeId, storeId),
      eq(shippingZones.isActive, true)
    ))
    .orderBy(shippingRates.price);

  // Group rates by zone
  const groupedRates = zones.reduce((acc, { zone, rates }) => {
    if (!acc[zone.id]) {
      acc[zone.id] = {
        zone,
        rates: []
      };
    }
    acc[zone.id].rates.push(rates);
    return acc;
  }, {} as Record<string, { zone: typeof zone, rates: typeof rates[] }>);

  return Object.values(groupedRates);
}