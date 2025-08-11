import { db } from "@/db";
import { orders, orderItems, orderStatusHistory, paymentTransactions } from "@/db/schemas";
import { eq, and, desc, sql } from "drizzle-orm";

export interface CreateOrderData {
  storeId: string;
  userId?: string;
  sessionId?: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  customerDocument?: string;
  shippingAddress: {
    street: string;
    city: string;
    department: string;
    postalCode?: string;
    country: string;
    additionalInfo?: string;
  };
  shippingMethod: string;
  shippingCost: string;
  billingAddress?: {
    street: string;
    city: string;
    department: string;
    postalCode?: string;
    country: string;
    additionalInfo?: string;
  };
  subtotal: string;
  tax: string;
  discount: string;
  total: string;
  currency?: string;
  notes?: string;
  metadata?: any;
}

export interface CreateOrderItemData {
  orderId: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage?: string;
  productSku?: string;
  price: string;
  compareAtPrice?: string;
  quantity: number;
  subtotal: string;
  metadata?: any;
}

export interface CreatePaymentTransactionData {
  orderId: string;
  wompiTransactionId: string;
  wompiReference: string;
  wompiStatus: string;
  wompiPaymentMethod?: string;
  wompiPaymentMethodType?: string;
  amount: string;
  currency?: string;
  wompiResponseData?: any;
  errorCode?: string;
  errorMessage?: string;
}

export const ordersRepository = {
  async createOrder(data: CreateOrderData) {
    const [order] = await db
      .insert(orders)
      .values({
        ...data,
        status: "pending",
        paymentStatus: "pending",
      })
      .returning();
    
    return order;
  },

  async createOrderItems(items: CreateOrderItemData[]) {
    if (items.length === 0) return [];
    
    const insertedItems = await db
      .insert(orderItems)
      .values(items)
      .returning();
    
    return insertedItems;
  },

  async getOrderById(orderId: string) {
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId));
    
    return order;
  },

  async getOrderWithItems(orderId: string) {
    const order = await this.getOrderById(orderId);
    if (!order) return null;

    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));

    return {
      ...order,
      items,
    };
  },

  async getOrdersByStore(storeId: string, limit = 50) {
    const storeOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.storeId, storeId))
      .orderBy(desc(orders.createdAt))
      .limit(limit);
    
    return storeOrders;
  },

  async getOrdersByUser(userId: string, limit = 50) {
    const userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt))
      .limit(limit);
    
    return userOrders;
  },

  async updateOrderStatus(
    orderId: string, 
    status: string, 
    changedBy: string = "system"
  ) {
    const [currentOrder] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId));
    
    if (!currentOrder) {
      throw new Error("Order not found");
    }

    // Update order status
    const [updatedOrder] = await db
      .update(orders)
      .set({ 
        status,
        updatedAt: new Date(),
        ...(status === "completed" ? { completedAt: new Date() } : {}),
        ...(status === "cancelled" ? { cancelledAt: new Date() } : {})
      })
      .where(eq(orders.id, orderId))
      .returning();

    // Record status history
    await db
      .insert(orderStatusHistory)
      .values({
        orderId,
        fromStatus: currentOrder.status,
        toStatus: status,
        changedBy,
      });

    return updatedOrder;
  },

  async updateOrderPaymentStatus(
    orderId: string, 
    paymentStatus: string,
    paymentData?: {
      paymentMethod?: string;
      paymentTransactionId?: string;
      paymentReference?: string;
      paymentData?: any;
    }
  ) {
    const updateData: any = {
      paymentStatus,
      updatedAt: new Date(),
      ...(paymentStatus === "paid" ? { paidAt: new Date() } : {}),
    };

    if (paymentData) {
      Object.assign(updateData, paymentData);
    }

    const [updatedOrder] = await db
      .update(orders)
      .set(updateData)
      .where(eq(orders.id, orderId))
      .returning();

    return updatedOrder;
  },

  async createPaymentTransaction(data: CreatePaymentTransactionData) {
    const [transaction] = await db
      .insert(paymentTransactions)
      .values(data)
      .returning();
    
    return transaction;
  },

  async updatePaymentTransaction(
    transactionId: string,
    data: {
      wompiStatus?: string;
      wompiWebhookData?: any;
      processedAt?: Date;
      errorCode?: string;
      errorMessage?: string;
    }
  ) {
    const [updatedTransaction] = await db
      .update(paymentTransactions)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(paymentTransactions.wompiTransactionId, transactionId))
      .returning();
    
    return updatedTransaction;
  },

  async getPaymentTransactionByWompiId(wompiTransactionId: string) {
    const [transaction] = await db
      .select()
      .from(paymentTransactions)
      .where(eq(paymentTransactions.wompiTransactionId, wompiTransactionId));
    
    return transaction;
  },

  async getOrderStatusHistory(orderId: string) {
    const history = await db
      .select()
      .from(orderStatusHistory)
      .where(eq(orderStatusHistory.orderId, orderId))
      .orderBy(desc(orderStatusHistory.createdAt));
    
    return history;
  },

  async updateShippingTrackingNumber(orderId: string, trackingNumber: string) {
    const [updatedOrder] = await db
      .update(orders)
      .set({
        shippingTrackingNumber: trackingNumber,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId))
      .returning();
    
    return updatedOrder;
  },

  async getOrderByReference(reference: string) {
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.paymentReference, reference));
    
    return order;
  },
};