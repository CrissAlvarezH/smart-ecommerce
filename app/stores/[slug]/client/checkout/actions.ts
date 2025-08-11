"use server";

import { authenticatedAction, unauthenticatedAction } from "@/lib/server-actions";
import { z } from "zod";
import { ordersService } from "@/services/orders.service";
import { cartRepository } from "@/repositories/cart";
import { wompiService } from "@/services/wompi.service";
import { cookies } from "next/headers";
import { storesRepository } from "@/repositories/stores";

const createOrderSchema = z.object({
  storeSlug: z.string(),
  customerEmail: z.string().email(),
  customerName: z.string().min(2),
  customerPhone: z.string().min(10),
  customerDocument: z.string().optional(),
  shippingAddress: z.object({
    street: z.string().min(5),
    city: z.string().min(2),
    department: z.string().min(2),
    postalCode: z.string().optional(),
    country: z.string().default("Colombia"),
    additionalInfo: z.string().optional(),
  }),
  shippingMethod: z.string(),
  shippingCost: z.string(),
  billingAddress: z.object({
    street: z.string().min(5),
    city: z.string().min(2),
    department: z.string().min(2),
    postalCode: z.string().optional(),
    country: z.string().default("Colombia"),
    additionalInfo: z.string().optional(),
  }).optional(),
  sameAsShipping: z.boolean().default(true),
  notes: z.string().optional(),
});

export const createOrderAction = unauthenticatedAction
  .inputSchema(createOrderSchema)
  .action(async ({ parsedInput, ctx }) => {
    const store = await storesRepository.getStoreBySlug(parsedInput.storeSlug);
    if (!store) {
      throw new Error("Store not found");
    }

    // Get cart from session
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(`cart_session_${parsedInput.storeSlug}`)?.value;
    
    if (!sessionId) {
      throw new Error("No cart found");
    }

    const cart = await cartRepository.getCartBySessionAndStore(sessionId, store.id);
    if (!cart) {
      throw new Error("Cart not found");
    }

    // Create order
    const orderData = await ordersService.createOrderFromCart({
      storeId: store.id,
      cartId: cart.id,
      userId: ctx.user?.id,
      customerEmail: parsedInput.customerEmail,
      customerName: parsedInput.customerName,
      customerPhone: parsedInput.customerPhone,
      customerDocument: parsedInput.customerDocument,
      shippingAddress: parsedInput.shippingAddress,
      shippingMethod: parsedInput.shippingMethod,
      shippingCost: parsedInput.shippingCost,
      billingAddress: parsedInput.sameAsShipping ? parsedInput.shippingAddress : parsedInput.billingAddress,
      notes: parsedInput.notes,
    });

    // Clear cart session
    cookieStore.set(`cart_session_${parsedInput.storeSlug}`, "", { maxAge: 0 });

    return {
      orderId: orderData.order.id,
      order: orderData.order,
    };
  });

const processPaymentSchema = z.object({
  orderId: z.string(),
  paymentMethod: z.enum(["CARD", "NEQUI", "PSE", "BANCOLOMBIA_TRANSFER"]),
  cardToken: z.string().optional(),
  installments: z.number().optional(),
  pseBank: z.string().optional(),
  userType: z.enum(["PERSON", "COMPANY"]).optional(),
  userLegalId: z.string().optional(),
  userLegalIdType: z.string().optional(),
  nequiPhoneNumber: z.string().optional(),
});

export const processPaymentAction = unauthenticatedAction
  .inputSchema(processPaymentSchema)
  .action(async ({ parsedInput }) => {
    const result = await ordersService.processPayment({
      orderId: parsedInput.orderId,
      paymentMethod: parsedInput.paymentMethod,
      paymentToken: parsedInput.cardToken || parsedInput.nequiPhoneNumber,
      installments: parsedInput.installments,
      pseBank: parsedInput.pseBank,
      userType: parsedInput.userType,
      userLegalId: parsedInput.userLegalId,
      userLegalIdType: parsedInput.userLegalIdType,
    });

    return {
      transaction: result.transaction,
      redirectUrl: result.redirectUrl,
      paymentReference: result.paymentReference,
    };
  });

export const getWompiAcceptanceTokenAction = unauthenticatedAction
  .action(async () => {
    const acceptanceToken = await wompiService.getAcceptanceToken();
    return {
      acceptanceToken: acceptanceToken.data.presigned_acceptance.acceptance_token,
      permalink: acceptanceToken.data.presigned_acceptance.permalink,
    };
  });

export const getPaymentMethodsAction = unauthenticatedAction
  .action(async () => {
    const paymentMethods = await wompiService.getPaymentMethods();
    return {
      paymentMethods,
    };
  });

export const getPSEBanksAction = unauthenticatedAction
  .action(async () => {
    const banks = await wompiService.getPSEBanks();
    return {
      banks,
    };
  });

export const createPaymentLinkAction = unauthenticatedAction
  .inputSchema(z.object({
    orderId: z.string(),
  }))
  .action(async ({ parsedInput }) => {
    const paymentLink = await ordersService.createPaymentLink(parsedInput.orderId);
    return {
      paymentLink,
    };
  });