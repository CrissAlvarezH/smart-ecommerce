import { db } from "@/db";
import { carts, cartItems, products, productImages } from "@/db/schemas";
import { eq, and, desc } from "drizzle-orm";

export async function getOrCreateCart(userId?: string, sessionId?: string) {
  if (!userId && !sessionId) {
    throw new Error("Either userId or sessionId must be provided");
  }

  let cart;
  
  if (userId) {
    cart = await db
      .select()
      .from(carts)
      .where(eq(carts.userId, userId))
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

  const newCart = await db
    .insert(carts)
    .values({
      userId: userId || null,
      sessionId: sessionId || null,
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
        inventory: products.inventory,
      },
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.cartId, cartId))
    .orderBy(desc(cartItems.createdAt));

  // Get first image for each product
  const itemsWithImages = await Promise.all(
    cartItemsWithProducts.map(async (item) => {
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
  // Check if item already exists in cart
  const existingItem = await db
    .select()
    .from(cartItems)
    .where(and(eq(cartItems.cartId, cartId), eq(cartItems.productId, productId)))
    .limit(1);

  if (existingItem.length > 0) {
    // Update quantity
    const updatedItem = await db
      .update(cartItems)
      .set({ 
        quantity: existingItem[0].quantity + quantity,
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

export async function updateCartItemQuantity(cartItemId: string, quantity: number) {
  if (quantity <= 0) {
    return await removeFromCart(cartItemId);
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

export async function removeFromCart(cartItemId: string) {
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