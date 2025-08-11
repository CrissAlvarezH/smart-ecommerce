import { env } from "@/env";
import crypto from "crypto";

export interface WompiCustomer {
  email: string;
  full_name: string;
  phone_number: string;
  phone_number_prefix?: string;
  legal_id?: string;
  legal_id_type?: "CC" | "CE" | "NIT" | "PP" | "TI" | "DNI" | "RG" | "OTHER";
}

export interface WompiShippingAddress {
  address_line_1: string;
  city: string;
  region?: string;
  country: string;
  postal_code?: string;
  phone_number?: string;
  name?: string;
}

export interface WompiPaymentMethod {
  type: "CARD" | "NEQUI" | "PSE" | "BANCOLOMBIA_TRANSFER" | "BANCOLOMBIA_COLLECT" | "BANCOLOMBIA_QR";
  token?: string;
  installments?: number;
  payment_description?: string;
  pse_bank?: string;
  user_type?: "PERSON" | "COMPANY";
  user_legal_id?: string;
  user_legal_id_type?: string;
  financial_institution_code?: string;
}

export interface CreateTransactionParams {
  amount_in_cents: number;
  currency: "COP";
  signature?: string;
  customer_email: string;
  payment_method: WompiPaymentMethod;
  reference: string;
  customer_data?: WompiCustomer;
  shipping_address?: WompiShippingAddress;
  redirect_url?: string;
  payment_source_id?: number;
}

export interface WompiTransaction {
  id: string;
  created_at: string;
  amount_in_cents: number;
  reference: string;
  customer_email: string;
  currency: string;
  payment_method_type: string;
  payment_method: {
    type: string;
    extra?: {
      brand?: string;
      last_four?: string;
      card_holder?: string;
      bin?: string;
      name?: string;
      external_identifier?: string;
      processor_response_code?: string;
    };
  };
  status: "PENDING" | "APPROVED" | "DECLINED" | "VOIDED" | "ERROR";
  status_message?: string;
  billing_data?: {
    legal_id?: string;
    legal_id_type?: string;
  };
  shipping_address?: WompiShippingAddress;
  redirect_url?: string;
  payment_source_id?: number;
  payment_link_id?: string;
  finalized_at?: string;
  transaction_id?: string;
}

export interface WompiError {
  error: {
    type: string;
    messages: {
      [key: string]: string[];
    };
  };
}

export interface WompiWebhookEvent {
  event: "transaction.updated" | "nequi_token.ready";
  data: {
    transaction?: WompiTransaction;
    nequi_token?: {
      id: string;
      status: string;
    };
  };
  environment: "test" | "prod";
  signature: {
    properties: string[];
    checksum: string;
  };
  timestamp: number;
  sent_at: string;
}

export interface CreatePaymentLinkParams {
  name: string;
  description: string;
  single_use: boolean;
  collect_shipping?: boolean;
  currency: "COP";
  amount_in_cents?: number;
  redirect_url?: string;
  image_url?: string;
  sku?: string;
  customer_data?: {
    customer_email?: string;
    full_name?: string;
    phone_number?: string;
    phone_number_prefix?: string;
    legal_id?: string;
    legal_id_type?: string;
  };
}

export interface WompiPaymentLink {
  id: string;
  name: string;
  description: string;
  single_use: boolean;
  collect_shipping: boolean;
  currency: string;
  amount_in_cents?: number;
  redirect_url?: string;
  image_url?: string;
  sku?: string;
  public_url: string;
  created_at: string;
  updated_at: string;
}

export interface WompiAcceptanceToken {
  data: {
    presigned_acceptance: {
      acceptance_token: string;
      permalink: string;
      type: string;
    };
  };
}

class WompiService {
  private readonly baseUrl: string;
  private readonly publicKey: string;
  private readonly secretKey: string;
  private readonly webhookSecret: string;

  constructor() {
    const isProduction = env.ENVIRONMENT === "prod";
    this.baseUrl = isProduction 
      ? "https://production.wompi.co/v1" 
      : "https://sandbox.wompi.co/v1";
    this.publicKey = env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY;
    this.secretKey = env.WOMPI_SECRET_KEY;
    this.webhookSecret = env.WOMPI_WEBHOOK_SECRET;
  }

  /**
   * Generate signature for transaction integrity
   */
  generateSignature(reference: string, amountInCents: number, currency: string = "COP"): string {
    const message = `${reference}${amountInCents}${currency}${this.secretKey}`;
    return crypto.createHash("sha256").update(message).digest("hex");
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(event: WompiWebhookEvent): boolean {
    const { properties, checksum } = event.signature;
    
    // Build the string to hash based on the properties
    let toHash = "";
    properties.forEach((property) => {
      const keys = property.split(".");
      let value: any = event;
      
      keys.forEach((key) => {
        value = value?.[key as keyof typeof value];
      });
      
      toHash += value;
    });
    
    // Add the webhook secret
    toHash += this.webhookSecret;
    
    // Generate hash and compare
    const hash = crypto.createHash("sha256").update(toHash).digest("hex");
    return hash === checksum;
  }

  /**
   * Get acceptance token for terms and conditions
   */
  async getAcceptanceToken(): Promise<WompiAcceptanceToken> {
    const response = await fetch(`${this.baseUrl}/merchants/${this.publicKey}`, {
      method: "GET",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to get acceptance token: ${JSON.stringify(error)}`);
    }

    return response.json();
  }

  /**
   * Create a new transaction
   */
  async createTransaction(params: CreateTransactionParams): Promise<WompiTransaction> {
    // Add signature if not provided
    if (!params.signature) {
      params.signature = this.generateSignature(
        params.reference,
        params.amount_in_cents,
        params.currency
      );
    }

    const response = await fetch(`${this.baseUrl}/transactions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Transaction creation failed: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Get transaction by ID
   */
  async getTransaction(transactionId: string): Promise<WompiTransaction> {
    const response = await fetch(`${this.baseUrl}/transactions/${transactionId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${this.publicKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to get transaction: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Void a transaction
   */
  async voidTransaction(transactionId: string): Promise<WompiTransaction> {
    const response = await fetch(`${this.baseUrl}/transactions/${transactionId}/void`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.secretKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to void transaction: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Create payment link
   */
  async createPaymentLink(params: CreatePaymentLinkParams): Promise<WompiPaymentLink> {
    const response = await fetch(`${this.baseUrl}/payment_links`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to create payment link: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Get payment link by ID
   */
  async getPaymentLink(linkId: string): Promise<WompiPaymentLink> {
    const response = await fetch(`${this.baseUrl}/payment_links/${linkId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${this.publicKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to get payment link: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Get available payment methods
   */
  async getPaymentMethods() {
    const response = await fetch(`${this.baseUrl}/merchants/${this.publicKey}/payment_methods`, {
      method: "GET",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to get payment methods: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Create a tokenized payment source (for cards)
   */
  async createPaymentSource(cardData: {
    number: string;
    cvc: string;
    exp_month: string;
    exp_year: string;
    card_holder: string;
  }, customerEmail: string, acceptanceToken: string) {
    const response = await fetch(`${this.baseUrl}/payment_sources`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.publicKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "CARD",
        token: cardData,
        customer_email: customerEmail,
        acceptance_token: acceptanceToken,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to create payment source: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Get PSE banks list
   */
  async getPSEBanks() {
    const response = await fetch(`${this.baseUrl}/pse/financial_institutions`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${this.publicKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to get PSE banks: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    return data.data;
  }
}

export const wompiService = new WompiService();