import { pgTable, text, timestamp, decimal, json, varchar, integer } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { stores, products } from "./ecommerce";
import { users } from "./users";

export const orders = pgTable("orders", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  storeId: text("store_id")
    .notNull()
    .references(() => stores.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "set null" }),
  sessionId: text("session_id"),
  
  // Order status
  status: text("status").notNull().default("pending"), // pending, processing, completed, cancelled, refunded
  paymentStatus: text("payment_status").notNull().default("pending"), // pending, paid, failed, refunded
  
  // Customer information
  customerEmail: text("customer_email").notNull(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerDocument: text("customer_document"), // Colombian ID
  
  // Shipping information
  shippingAddress: json("shipping_address").$type<{
    street: string;
    city: string;
    department: string;
    postalCode?: string;
    country: string;
    additionalInfo?: string;
  }>().notNull(),
  shippingMethod: text("shipping_method").notNull(),
  shippingCost: decimal("shipping_cost", { precision: 10, scale: 2 }).notNull(),
  shippingTrackingNumber: text("shipping_tracking_number"),
  
  // Billing information
  billingAddress: json("billing_address").$type<{
    street: string;
    city: string;
    department: string;
    postalCode?: string;
    country: string;
    additionalInfo?: string;
  }>(),
  
  // Pricing
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  tax: decimal("tax", { precision: 10, scale: 2 }).notNull().default("0.00"),
  discount: decimal("discount", { precision: 10, scale: 2 }).notNull().default("0.00"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("COP"),
  
  // Payment information
  paymentMethod: text("payment_method"), // wompi, cash_on_delivery, bank_transfer
  paymentTransactionId: text("payment_transaction_id"), // Wompi transaction ID
  paymentReference: text("payment_reference"), // Wompi payment reference
  paymentData: json("payment_data"), // Store additional payment info from Wompi
  
  // Metadata
  notes: text("notes"),
  metadata: json("metadata"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  paidAt: timestamp("paid_at"),
  completedAt: timestamp("completed_at"),
  cancelledAt: timestamp("cancelled_at"),
});

export const orderItems = pgTable("order_items", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "restrict" }),
  
  // Product snapshot at time of order
  productName: text("product_name").notNull(),
  productSlug: text("product_slug").notNull(),
  productImage: text("product_image"),
  productSku: text("product_sku"),
  
  // Pricing
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  compareAtPrice: decimal("compare_at_price", { precision: 10, scale: 2 }),
  quantity: integer("quantity").notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  
  // Metadata
  metadata: json("metadata"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orderStatusHistory = pgTable("order_status_history", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  
  fromStatus: text("from_status"),
  toStatus: text("to_status").notNull(),
  note: text("note"),
  changedBy: text("changed_by"), // user ID or "system"
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const paymentTransactions = pgTable("payment_transactions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  
  // Wompi transaction details
  wompiTransactionId: text("wompi_transaction_id").notNull().unique(),
  wompiReference: text("wompi_reference").notNull(),
  wompiStatus: text("wompi_status").notNull(), // PENDING, APPROVED, DECLINED, VOIDED, ERROR
  wompiPaymentMethod: text("wompi_payment_method"), // CARD, NEQUI, PSE, etc
  wompiPaymentMethodType: text("wompi_payment_method_type"), // CARD, BANK_TRANSFER, etc
  
  // Financial details
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("COP"),
  
  // Response data
  wompiResponseData: json("wompi_response_data"),
  wompiWebhookData: json("wompi_webhook_data"),
  
  // Error handling
  errorCode: text("error_code"),
  errorMessage: text("error_message"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  processedAt: timestamp("processed_at"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});