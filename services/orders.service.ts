import { ordersRepository } from "@/repositories/orders.repository";
import { cartRepository } from "@/repositories/cart";
import { adminProductsRepository } from "@/repositories/admin/products";
import { wompiService, WompiTransaction, WompiWebhookEvent } from "./wompi.service";
import { env } from "@/env";

export interface CreateOrderFromCartParams {
  storeId: string;
  cartId: string;
  userId?: string;
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
  notes?: string;
}

export interface ProcessPaymentParams {
  orderId: string;
  paymentMethod: "CARD" | "NEQUI" | "PSE" | "BANCOLOMBIA_TRANSFER";
  paymentToken?: string;
  installments?: number;
  pseBank?: string;
  userType?: "PERSON" | "COMPANY";
  userLegalId?: string;
  userLegalIdType?: string;
}

class OrdersService {
  async createOrderFromCart(params: CreateOrderFromCartParams) {
    // Get cart info with shipping details
    const cartWithShipping = await cartRepository.getCartWithShippingDetails(params.cartId);
    if (!cartWithShipping?.cart) {
      throw new Error("Cart not found");
    }
    
    const cart = cartWithShipping.cart;
    
    // Get cart items directly (getCartWithItems returns an array)
    const cartItems = await cartRepository.getCartWithItems(params.cartId);
    if (!cartItems || cartItems.length === 0) {
      throw new Error("Cart is empty or not found");
    }

    // Calculate totals
    let subtotal = 0;
    const orderItemsData = [];

    for (const cartItem of cartItems) {
      const product = await adminProductsRepository.getProductById(cartItem.product.id);
      if (!product) {
        throw new Error(`Product ${cartItem.product.id} not found`);
      }

      const itemSubtotal = parseFloat(product.price) * cartItem.quantity;
      subtotal += itemSubtotal;

      orderItemsData.push({
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        productImage: product.mainImage,
        productSku: product.sku || undefined,
        price: product.price,
        compareAtPrice: product.compareAtPrice || undefined,
        quantity: cartItem.quantity,
        subtotal: itemSubtotal.toFixed(2),
      });
    }

    // Calculate tax (19% VAT included in Colombian prices)
    const tax = "0.00"; // Tax is already included in prices
    const discount = "0.00"; // TODO: Implement discount calculation
    const shipping = parseFloat(params.shippingCost);
    const total = subtotal + shipping;

    // Create order
    const order = await ordersRepository.createOrder({
      storeId: params.storeId,
      userId: params.userId,
      sessionId: cart.sessionId || undefined,
      customerEmail: params.customerEmail,
      customerName: params.customerName,
      customerPhone: params.customerPhone,
      customerDocument: params.customerDocument,
      shippingAddress: params.shippingAddress,
      shippingMethod: params.shippingMethod,
      shippingCost: params.shippingCost,
      billingAddress: params.billingAddress,
      subtotal: subtotal.toFixed(2),
      tax,
      discount,
      total: total.toFixed(2),
      currency: "COP",
      notes: params.notes,
    });

    // Create order items
    const orderItems = await ordersRepository.createOrderItems(
      orderItemsData.map(item => ({
        ...item,
        orderId: order.id,
      }))
    );

    // Clear the cart after order creation
    await cartRepository.clearCart(params.cartId);

    return {
      order,
      items: orderItems,
    };
  }

  async processPayment(params: ProcessPaymentParams) {
    // Get order details
    const order = await ordersRepository.getOrderById(params.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    if (order.paymentStatus === "paid") {
      throw new Error("Order is already paid");
    }

    // Generate payment reference
    const paymentReference = `ORDER-${order.id}-${Date.now()}`;

    // Prepare Wompi payment method
    const paymentMethod: any = {
      type: params.paymentMethod,
    };

    if (params.paymentMethod === "CARD" && params.paymentToken) {
      paymentMethod.token = params.paymentToken;
      if (params.installments) {
        paymentMethod.installments = params.installments;
      }
    } else if (params.paymentMethod === "PSE") {
      paymentMethod.user_type = params.userType || "PERSON";
      paymentMethod.user_legal_id = params.userLegalId;
      paymentMethod.user_legal_id_type = params.userLegalIdType;
      paymentMethod.financial_institution_code = params.pseBank;
      paymentMethod.payment_description = `Pago orden ${order.id}`;
    } else if (params.paymentMethod === "NEQUI" && params.paymentToken) {
      paymentMethod.phone_number = params.paymentToken; // For Nequi, token is the phone number
    }

    // Create Wompi transaction
    const amountInCents = Math.round(parseFloat(order.total) * 100);
    const redirectUrl = `${env.HOST_NAME}/stores/${order.storeId}/payment-confirmation/${order.id}`;

    try {
      const transaction = await wompiService.createTransaction({
        amount_in_cents: amountInCents,
        currency: "COP",
        customer_email: order.customerEmail,
        payment_method: paymentMethod,
        reference: paymentReference,
        customer_data: {
          email: order.customerEmail,
          full_name: order.customerName,
          phone_number: order.customerPhone,
          legal_id: order.customerDocument || undefined,
          legal_id_type: order.customerDocument ? "CC" : undefined,
        },
        shipping_address: order.shippingAddress ? {
          address_line_1: order.shippingAddress.street,
          city: order.shippingAddress.city,
          region: order.shippingAddress.department,
          country: order.shippingAddress.country,
          postal_code: order.shippingAddress.postalCode,
          name: order.customerName,
        } : undefined,
        redirect_url: redirectUrl,
      });

      // Save payment transaction
      await ordersRepository.createPaymentTransaction({
        orderId: order.id,
        wompiTransactionId: transaction.id,
        wompiReference: paymentReference,
        wompiStatus: transaction.status,
        wompiPaymentMethod: transaction.payment_method.type,
        wompiPaymentMethodType: transaction.payment_method_type,
        amount: order.total,
        currency: "COP",
        wompiResponseData: transaction,
      });

      // Update order with payment information
      await ordersRepository.updateOrderPaymentStatus(order.id, "pending", {
        paymentMethod: params.paymentMethod,
        paymentTransactionId: transaction.id,
        paymentReference: paymentReference,
      });

      return {
        transaction,
        redirectUrl,
        paymentReference,
      };
    } catch (error) {
      // Save failed transaction
      await ordersRepository.createPaymentTransaction({
        orderId: order.id,
        wompiTransactionId: `FAILED-${Date.now()}`,
        wompiReference: paymentReference,
        wompiStatus: "ERROR",
        amount: order.total,
        currency: "COP",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      });

      throw error;
    }
  }

  async handleWebhook(event: WompiWebhookEvent) {
    // Verify webhook signature
    if (!wompiService.verifyWebhookSignature(event)) {
      throw new Error("Invalid webhook signature");
    }

    if (event.event === "transaction.updated" && event.data.transaction) {
      const transaction = event.data.transaction;
      
      // Get payment transaction
      const paymentTx = await ordersRepository.getPaymentTransactionByWompiId(transaction.id);
      if (!paymentTx) {
        console.error(`Payment transaction not found for Wompi ID: ${transaction.id}`);
        return;
      }

      // Update payment transaction
      await ordersRepository.updatePaymentTransaction(transaction.id, {
        wompiStatus: transaction.status,
        wompiWebhookData: event.data,
        processedAt: new Date(),
      });

      // Update order based on transaction status
      if (transaction.status === "APPROVED") {
        await ordersRepository.updateOrderPaymentStatus(paymentTx.orderId, "paid", {
          paymentData: transaction,
        });
        await ordersRepository.updateOrderStatus(paymentTx.orderId, "processing", "system");
        
        // TODO: Send confirmation email
        // TODO: Notify store owner
      } else if (transaction.status === "DECLINED" || transaction.status === "ERROR") {
        await ordersRepository.updateOrderPaymentStatus(paymentTx.orderId, "failed");
        
        // TODO: Send failure email
      } else if (transaction.status === "VOIDED") {
        await ordersRepository.updateOrderPaymentStatus(paymentTx.orderId, "refunded");
        await ordersRepository.updateOrderStatus(paymentTx.orderId, "cancelled", "system");
      }
    }
  }

  async getOrderStatus(orderId: string) {
    const order = await ordersRepository.getOrderWithItems(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    // Get payment transaction if exists
    let paymentTransaction = null;
    if (order.paymentTransactionId) {
      paymentTransaction = await ordersRepository.getPaymentTransactionByWompiId(
        order.paymentTransactionId
      );
    }

    return {
      order,
      paymentTransaction,
    };
  }

  async createPaymentLink(orderId: string) {
    const order = await ordersRepository.getOrderById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    const amountInCents = Math.round(parseFloat(order.total) * 100);
    const redirectUrl = `${env.HOST_NAME}/stores/${order.storeId}/payment-confirmation/${order.id}`;

    const paymentLink = await wompiService.createPaymentLink({
      name: `Order ${order.id}`,
      description: `Payment for order ${order.id}`,
      single_use: true,
      collect_shipping: false,
      currency: "COP",
      amount_in_cents: amountInCents,
      redirect_url: redirectUrl,
      customer_data: {
        customer_email: order.customerEmail,
        full_name: order.customerName,
        phone_number: order.customerPhone,
        legal_id: order.customerDocument || undefined,
        legal_id_type: order.customerDocument ? "CC" : undefined,
      },
    });

    // Update order with payment link
    await ordersRepository.updateOrderPaymentStatus(order.id, "pending", {
      paymentMethod: "payment_link",
      paymentReference: paymentLink.id,
    });

    return paymentLink;
  }

  async getUserOrders(userId: string) {
    return ordersRepository.getOrdersByUser(userId);
  }

  async getStoreOrders(storeId: string) {
    return ordersRepository.getOrdersByStore(storeId);
  }
}

export const ordersService = new OrdersService();