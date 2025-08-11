"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/format-price";
import { ArrowLeft, CreditCard, Smartphone, Building, Loader2 } from "lucide-react";
import { 
  createOrderAction, 
  processPaymentAction, 
  getWompiAcceptanceTokenAction,
  getPSEBanksAction,
  createPaymentLinkAction
} from "./actions";
import { WompiCheckout } from "./wompi-checkout";

interface CheckoutClientProps {
  store: {
    id: string;
    name: string;
    slug: string;
  };
  cartItems: any[];
  subtotal: number;
  shippingCost: number;
  total: number;
  shippingCity: string;
  shippingDepartment: string;
  user?: {
    id: string;
    email: string;
    name: string;
  } | null;
}

export function CheckoutClient({ 
  store, 
  cartItems, 
  subtotal, 
  shippingCost, 
  total,
  shippingCity,
  shippingDepartment,
  user 
}: CheckoutClientProps) {
  const router = useRouter();
  const [step, setStep] = useState<"info" | "payment">("info");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [acceptanceToken, setAcceptanceToken] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"CARD" | "NEQUI" | "PSE">("CARD");
  const [pseBanks, setPseBanks] = useState<any[]>([]);
  
  // Form data
  const [formData, setFormData] = useState({
    customerEmail: user?.email || "",
    customerName: user?.name || "",
    customerPhone: "",
    customerDocument: "",
    street: "",
    city: shippingCity,
    department: shippingDepartment,
    postalCode: "",
    additionalInfo: "",
    sameAsShipping: true,
    billingStreet: "",
    billingCity: "",
    billingDepartment: "",
    billingPostalCode: "",
    billingAdditionalInfo: "",
    notes: "",
    acceptTerms: false,
  });

  // Load Wompi acceptance token
  const { execute: getAcceptanceToken } = useAction(getWompiAcceptanceTokenAction, {
    onSuccess: (result) => {
      if (result.data) {
        setAcceptanceToken(result.data.acceptanceToken);
      }
    },
  });

  // Load PSE banks
  const { execute: loadPSEBanks } = useAction(getPSEBanksAction, {
    onSuccess: (result) => {
      if (result.data) {
        setPseBanks(result.data.banks);
      }
    },
  });

  useEffect(() => {
    getAcceptanceToken({});
    loadPSEBanks({});
  }, [getAcceptanceToken, loadPSEBanks]);

  // Create order action
  const { execute: createOrder, isExecuting: isCreatingOrder } = useAction(createOrderAction, {
    onSuccess: (result) => {
      if (result.data) {
        setOrderId(result.data.orderId);
        setStep("payment");
        toast({
          title: "Order created",
          description: "Please complete your payment to confirm the order.",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.serverError || "Failed to create order",
        variant: "destructive",
      });
    },
  });

  // Process payment action
  const { execute: processPayment, isExecuting: isProcessingPayment } = useAction(processPaymentAction, {
    onSuccess: (result) => {
      if (result.data) {
        toast({
          title: "Processing payment",
          description: "Redirecting to payment confirmation...",
        });
        
        // Check if we need to redirect (for PSE)
        if (result.data.transaction.status === "PENDING" && result.data.redirectUrl) {
          window.location.href = result.data.redirectUrl;
        } else {
          // For card payments, redirect to confirmation page
          router.push(`/stores/${store.slug}/client/payment-confirmation/${orderId}`);
        }
      }
    },
    onError: (error) => {
      toast({
        title: "Payment failed",
        description: error.serverError || "Failed to process payment",
        variant: "destructive",
      });
    },
  });

  // Create payment link action (fallback)
  const { execute: createPaymentLink, isExecuting: isCreatingPaymentLink } = useAction(createPaymentLinkAction, {
    onSuccess: (result) => {
      if (result.data?.paymentLink) {
        window.location.href = result.data.paymentLink.public_url;
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.serverError || "Failed to create payment link",
        variant: "destructive",
      });
    },
  });

  const handleSubmitInfo = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.acceptTerms) {
      toast({
        title: "Error",
        description: "Please accept the terms and conditions",
        variant: "destructive",
      });
      return;
    }

    createOrder({
      storeSlug: store.slug,
      customerEmail: formData.customerEmail,
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      customerDocument: formData.customerDocument,
      shippingAddress: {
        street: formData.street,
        city: formData.city,
        department: formData.department,
        postalCode: formData.postalCode,
        country: "Colombia",
        additionalInfo: formData.additionalInfo,
      },
      shippingMethod: "standard",
      shippingCost: shippingCost.toFixed(2),
      sameAsShipping: formData.sameAsShipping,
      billingAddress: formData.sameAsShipping ? undefined : {
        street: formData.billingStreet,
        city: formData.billingCity,
        department: formData.billingDepartment,
        postalCode: formData.billingPostalCode,
        country: "Colombia",
        additionalInfo: formData.billingAdditionalInfo,
      },
      notes: formData.notes,
    });
  };

  const handlePaymentSubmit = async (paymentData: any) => {
    if (!orderId) return;

    if (paymentMethod === "CARD") {
      processPayment({
        orderId,
        paymentMethod: "CARD",
        cardToken: paymentData.token,
        installments: paymentData.installments,
      });
    } else if (paymentMethod === "NEQUI") {
      processPayment({
        orderId,
        paymentMethod: "NEQUI",
        nequiPhoneNumber: paymentData.phoneNumber,
      });
    } else if (paymentMethod === "PSE") {
      processPayment({
        orderId,
        paymentMethod: "PSE",
        pseBank: paymentData.bank,
        userType: paymentData.userType,
        userLegalId: paymentData.userLegalId,
        userLegalIdType: paymentData.userLegalIdType,
      });
    }
  };

  const handlePaymentLinkFallback = () => {
    if (orderId) {
      createPaymentLink({ orderId });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <a 
            href={`/stores/${store.slug}/client/cart`} 
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Cart
          </a>
          <h1 className="text-3xl font-bold">{store.name} - Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === "info" ? (
              <Card>
                <CardHeader>
                  <CardTitle>Customer Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitInfo} className="space-y-6">
                    {/* Contact Information */}
                    <div className="space-y-4">
                      <h3 className="font-semibold">Contact Information</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            required
                            value={formData.customerEmail}
                            onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="name">Full Name *</Label>
                          <Input
                            id="name"
                            required
                            value={formData.customerName}
                            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="phone">Phone Number *</Label>
                          <Input
                            id="phone"
                            type="tel"
                            required
                            placeholder="3001234567"
                            value={formData.customerPhone}
                            onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="document">ID Number (CC/NIT)</Label>
                          <Input
                            id="document"
                            placeholder="Optional"
                            value={formData.customerDocument}
                            onChange={(e) => setFormData({ ...formData, customerDocument: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="space-y-4">
                      <h3 className="font-semibold">Shipping Address</h3>
                      
                      <div>
                        <Label htmlFor="street">Street Address *</Label>
                        <Input
                          id="street"
                          required
                          placeholder="Calle 123 #45-67"
                          value={formData.street}
                          onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="city">City *</Label>
                          <Input
                            id="city"
                            required
                            value={formData.city}
                            readOnly
                            className="bg-gray-50"
                          />
                        </div>
                        <div>
                          <Label htmlFor="department">Department *</Label>
                          <Input
                            id="department"
                            required
                            value={formData.department}
                            readOnly
                            className="bg-gray-50"
                          />
                        </div>
                        <div>
                          <Label htmlFor="postalCode">Postal Code</Label>
                          <Input
                            id="postalCode"
                            placeholder="Optional"
                            value={formData.postalCode}
                            onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="additionalInfo">Additional Information</Label>
                        <Textarea
                          id="additionalInfo"
                          placeholder="Apartment, suite, unit, building, floor, etc."
                          value={formData.additionalInfo}
                          onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Billing Address */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="sameAsShipping"
                          checked={formData.sameAsShipping}
                          onCheckedChange={(checked) => 
                            setFormData({ ...formData, sameAsShipping: checked as boolean })
                          }
                        />
                        <Label htmlFor="sameAsShipping">
                          Billing address same as shipping
                        </Label>
                      </div>

                      {!formData.sameAsShipping && (
                        <>
                          <h3 className="font-semibold">Billing Address</h3>
                          
                          <div>
                            <Label htmlFor="billingStreet">Street Address *</Label>
                            <Input
                              id="billingStreet"
                              required={!formData.sameAsShipping}
                              value={formData.billingStreet}
                              onChange={(e) => setFormData({ ...formData, billingStreet: e.target.value })}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="billingCity">City *</Label>
                              <Input
                                id="billingCity"
                                required={!formData.sameAsShipping}
                                value={formData.billingCity}
                                onChange={(e) => setFormData({ ...formData, billingCity: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label htmlFor="billingDepartment">Department *</Label>
                              <Input
                                id="billingDepartment"
                                required={!formData.sameAsShipping}
                                value={formData.billingDepartment}
                                onChange={(e) => setFormData({ ...formData, billingDepartment: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label htmlFor="billingPostalCode">Postal Code</Label>
                              <Input
                                id="billingPostalCode"
                                value={formData.billingPostalCode}
                                onChange={(e) => setFormData({ ...formData, billingPostalCode: e.target.value })}
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Order Notes */}
                    <div>
                      <Label htmlFor="notes">Order Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        placeholder="Special instructions for your order"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      />
                    </div>

                    {/* Terms and Conditions */}
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="acceptTerms"
                        checked={formData.acceptTerms}
                        onCheckedChange={(checked) => 
                          setFormData({ ...formData, acceptTerms: checked as boolean })
                        }
                      />
                      <Label htmlFor="acceptTerms" className="text-sm">
                        I accept the terms and conditions and privacy policy
                      </Label>
                    </div>

                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full"
                      disabled={isCreatingOrder}
                    >
                      {isCreatingOrder ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Order...
                        </>
                      ) : (
                        "Continue to Payment"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Payment Method Selection */}
                  <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <RadioGroupItem value="CARD" id="card" />
                        <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer">
                          <CreditCard className="h-5 w-5" />
                          Credit/Debit Card
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <RadioGroupItem value="NEQUI" id="nequi" />
                        <Label htmlFor="nequi" className="flex items-center gap-2 cursor-pointer">
                          <Smartphone className="h-5 w-5" />
                          Nequi
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <RadioGroupItem value="PSE" id="pse" />
                        <Label htmlFor="pse" className="flex items-center gap-2 cursor-pointer">
                          <Building className="h-5 w-5" />
                          PSE - Bank Transfer
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>

                  {/* Wompi Checkout Component */}
                  <WompiCheckout
                    paymentMethod={paymentMethod}
                    total={total}
                    acceptanceToken={acceptanceToken}
                    pseBanks={pseBanks}
                    customerEmail={formData.customerEmail}
                    onSubmit={handlePaymentSubmit}
                    isProcessing={isProcessingPayment}
                  />

                  {/* Fallback Payment Link Option */}
                  <div className="mt-6 pt-6 border-t">
                    <p className="text-sm text-gray-600 mb-4">
                      Having trouble? You can also complete your payment using our secure payment link.
                    </p>
                    <Button
                      variant="outline"
                      onClick={handlePaymentLinkFallback}
                      disabled={isCreatingPaymentLink}
                      className="w-full"
                    >
                      {isCreatingPaymentLink ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Payment Link...
                        </>
                      ) : (
                        "Pay with Payment Link"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cart Items */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <div className="flex-1">
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium">
                        {formatPrice(parseFloat(item.product.price) * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                <hr />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span>{formatPrice(shippingCost)}</span>
                  </div>
                  
                  <hr />
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    * Prices include VAT (19%)
                  </div>
                </div>

                {/* Security Badge */}
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-xs text-green-800 text-center">
                    🔒 Secure payment powered by Wompi
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}