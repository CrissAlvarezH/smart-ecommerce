"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CreditCard, Smartphone, Building } from "lucide-react";
import { formatPrice } from "@/lib/format-price";

interface WompiCheckoutProps {
  paymentMethod: "CARD" | "NEQUI" | "PSE";
  total: number;
  acceptanceToken: string;
  pseBanks: Array<{
    financial_institution_code: string;
    financial_institution_name: string;
  }>;
  customerEmail: string;
  onSubmit: (paymentData: any) => void;
  isProcessing: boolean;
}

declare global {
  interface Window {
    WidgetCheckout: any;
  }
}

export function WompiCheckout({
  paymentMethod,
  total,
  acceptanceToken,
  pseBanks,
  customerEmail,
  onSubmit,
  isProcessing
}: WompiCheckoutProps) {
  const [cardData, setCardData] = useState({
    number: "",
    cvc: "",
    exp_month: "",
    exp_year: "",
    card_holder: "",
    installments: 1,
  });

  const [nequiData, setNequiData] = useState({
    phoneNumber: "",
  });

  const [pseData, setPseData] = useState({
    bank: "",
    userType: "PERSON" as "PERSON" | "COMPANY",
    userLegalId: "",
    userLegalIdType: "CC",
  });

  const [widgetCheckout, setWidgetCheckout] = useState<any>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Load Wompi Widget script
  useEffect(() => {
    if (typeof window !== 'undefined' && paymentMethod === "CARD") {
      const script = document.createElement('script');
      script.src = 'https://checkout.wompi.co/widget.js';
      script.async = true;
      script.onload = () => {
        if (window.WidgetCheckout) {
          const widget = new window.WidgetCheckout({
            currency: 'COP',
            amountInCents: Math.round(total * 100),
            reference: `ORDER-${Date.now()}`,
            publicKey: process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY,
            redirectUrl: window.location.href,
            renderPaymentMethods: ['CARD'],
            acceptPersonalAuth: 'required',
            acceptDataAuth: 'required',
          });
          setWidgetCheckout(widget);
        }
      };
      document.head.appendChild(script);

      return () => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };
    }
  }, [paymentMethod, total]);

  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cardData.number || !cardData.cvc || !cardData.exp_month || !cardData.exp_year || !cardData.card_holder) {
      return;
    }

    // Create card token using Wompi Widget
    if (widgetCheckout) {
      const tokenData = {
        number: cardData.number.replace(/\s/g, ''),
        cvc: cardData.cvc,
        exp_month: cardData.exp_month,
        exp_year: cardData.exp_year,
        card_holder: cardData.card_holder,
      };

      // This would typically use Wompi's tokenization
      // For now, we'll pass the data directly (in production, this should be tokenized)
      onSubmit({
        token: tokenData,
        installments: cardData.installments,
      });
    }
  };

  const handleNequiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nequiData.phoneNumber) {
      return;
    }

    onSubmit({
      phoneNumber: nequiData.phoneNumber,
    });
  };

  const handlePSESubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pseData.bank || !pseData.userLegalId) {
      return;
    }

    onSubmit({
      bank: pseData.bank,
      userType: pseData.userType,
      userLegalId: pseData.userLegalId,
      userLegalIdType: pseData.userLegalIdType,
    });
  };

  const formatCardNumber = (value: string) => {
    return value
      .replace(/\s/g, '')
      .replace(/(.{4})/g, '$1 ')
      .trim()
      .substring(0, 19);
  };

  if (paymentMethod === "CARD") {
    return (
      <div>
        <form ref={formRef} onSubmit={handleCardSubmit} className="space-y-4">
          <div>
            <Label htmlFor="cardNumber">Card Number *</Label>
            <Input
              id="cardNumber"
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              value={cardData.number}
              onChange={(e) => setCardData({ 
                ...cardData, 
                number: formatCardNumber(e.target.value) 
              })}
              required
            />
          </div>

          <div>
            <Label htmlFor="cardHolder">Card Holder Name *</Label>
            <Input
              id="cardHolder"
              placeholder="JUAN PEREZ"
              value={cardData.card_holder}
              onChange={(e) => setCardData({ 
                ...cardData, 
                card_holder: e.target.value.toUpperCase() 
              })}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="expMonth">Month *</Label>
              <Select 
                value={cardData.exp_month} 
                onValueChange={(value) => setCardData({ ...cardData, exp_month: value })}
              >
                <SelectTrigger id="expMonth">
                  <SelectValue placeholder="MM" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => {
                    const month = (i + 1).toString().padStart(2, '0');
                    return (
                      <SelectItem key={month} value={month}>
                        {month}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="expYear">Year *</Label>
              <Select 
                value={cardData.exp_year} 
                onValueChange={(value) => setCardData({ ...cardData, exp_year: value })}
              >
                <SelectTrigger id="expYear">
                  <SelectValue placeholder="YY" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = (new Date().getFullYear() + i).toString().slice(-2);
                    return (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="cvc">CVC *</Label>
              <Input
                id="cvc"
                placeholder="123"
                maxLength={4}
                value={cardData.cvc}
                onChange={(e) => setCardData({ 
                  ...cardData, 
                  cvc: e.target.value.replace(/\D/g, '') 
                })}
                required
              />
            </div>
          </div>

          <div>
            <Label>Installments</Label>
            <RadioGroup 
              value={cardData.installments.toString()} 
              onValueChange={(value) => setCardData({ ...cardData, installments: parseInt(value) })}
              className="flex flex-wrap gap-4 mt-2"
            >
              {[1, 3, 6, 12, 24].map((installments) => (
                <div key={installments} className="flex items-center space-x-2">
                  <RadioGroupItem value={installments.toString()} id={`installments-${installments}`} />
                  <Label htmlFor={`installments-${installments}`} className="text-sm">
                    {installments}x {formatPrice(total / installments)}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <Button 
            type="submit" 
            size="lg" 
            className="w-full"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing Payment...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Pay {formatPrice(total)}
              </>
            )}
          </Button>
        </form>
      </div>
    );
  }

  if (paymentMethod === "NEQUI") {
    return (
      <div>
        <Card className="mb-4">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-purple-600 mb-2">
              <Smartphone className="h-5 w-5" />
              <span className="font-medium">Pay with Nequi</span>
            </div>
            <p className="text-sm text-gray-600">
              You will receive a notification in your Nequi app to complete the payment.
            </p>
          </CardContent>
        </Card>

        <form onSubmit={handleNequiSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nequiPhone">Phone Number *</Label>
            <Input
              id="nequiPhone"
              placeholder="3001234567"
              maxLength={10}
              value={nequiData.phoneNumber}
              onChange={(e) => setNequiData({ 
                ...nequiData, 
                phoneNumber: e.target.value.replace(/\D/g, '') 
              })}
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Enter the phone number associated with your Nequi account
            </p>
          </div>

          <Button 
            type="submit" 
            size="lg" 
            className="w-full bg-purple-600 hover:bg-purple-700"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing Payment...
              </>
            ) : (
              <>
                <Smartphone className="mr-2 h-4 w-4" />
                Pay with Nequi {formatPrice(total)}
              </>
            )}
          </Button>
        </form>
      </div>
    );
  }

  if (paymentMethod === "PSE") {
    return (
      <div>
        <Card className="mb-4">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-blue-600 mb-2">
              <Building className="h-5 w-5" />
              <span className="font-medium">PSE Bank Transfer</span>
            </div>
            <p className="text-sm text-gray-600">
              You will be redirected to your bank&apos;s website to complete the payment.
            </p>
          </CardContent>
        </Card>

        <form onSubmit={handlePSESubmit} className="space-y-4">
          <div>
            <Label>Account Type *</Label>
            <RadioGroup 
              value={pseData.userType} 
              onValueChange={(value: "PERSON" | "COMPANY") => setPseData({ ...pseData, userType: value })}
              className="flex gap-4 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="PERSON" id="person" />
                <Label htmlFor="person">Personal</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="COMPANY" id="company" />
                <Label htmlFor="company">Company</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="pseBank">Select Your Bank *</Label>
            <Select value={pseData.bank} onValueChange={(value) => setPseData({ ...pseData, bank: value })}>
              <SelectTrigger id="pseBank">
                <SelectValue placeholder="Choose your bank" />
              </SelectTrigger>
              <SelectContent>
                {pseBanks.map((bank) => (
                  <SelectItem key={bank.financial_institution_code} value={bank.financial_institution_code}>
                    {bank.financial_institution_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pseIdType">ID Type *</Label>
              <Select 
                value={pseData.userLegalIdType} 
                onValueChange={(value) => setPseData({ ...pseData, userLegalIdType: value })}
              >
                <SelectTrigger id="pseIdType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                  <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                  <SelectItem value="NIT">NIT</SelectItem>
                  <SelectItem value="PP">Pasaporte</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="pseId">ID Number *</Label>
              <Input
                id="pseId"
                placeholder="12345678"
                value={pseData.userLegalId}
                onChange={(e) => setPseData({ 
                  ...pseData, 
                  userLegalId: e.target.value.replace(/\D/g, '') 
                })}
                required
              />
            </div>
          </div>

          <Button 
            type="submit" 
            size="lg" 
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Redirecting to Bank...
              </>
            ) : (
              <>
                <Building className="mr-2 h-4 w-4" />
                Pay with PSE {formatPrice(total)}
              </>
            )}
          </Button>
        </form>
      </div>
    );
  }

  return null;
}