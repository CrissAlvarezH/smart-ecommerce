"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, MapPin, Truck } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { getAvailableShippingRatesAction, updateCartShippingAction } from "@/app/stores/[slug]/client/cart/actions";
import { toast } from "sonner";

interface ShippingAddress {
  country: string;
  state: string;
  postalCode: string;
}

interface ShippingSelectorProps {
  storeId: string;
  storeSlug: string;
  currentShippingRate?: {
    id: string;
    name: string;
    cost: string;
  } | null;
  onShippingUpdate?: (shippingCost: string) => void;
}

export function ShippingSelector({ 
  storeId, 
  storeSlug, 
  currentShippingRate,
  onShippingUpdate 
}: ShippingSelectorProps) {
  const [address, setAddress] = useState<ShippingAddress>({
    country: "US",
    state: "",
    postalCode: ""
  });
  const [selectedRateId, setSelectedRateId] = useState<string>(currentShippingRate?.id || "");
  const [shippingOptions, setShippingOptions] = useState<any[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);

  const { execute: getShippingRates, isExecuting: loadingRates } = useAction(getAvailableShippingRatesAction, {
    onSuccess: (result) => {
      setShippingOptions(result.data?.shippingOptions || []);
    },
    onError: (error) => {
      toast.error(error.serverError || "Failed to load shipping options");
    }
  });

  const { execute: updateShipping, isExecuting: updatingShipping } = useAction(updateCartShippingAction, {
    onSuccess: (result) => {
      toast.success("Shipping method updated");
      const selectedRate = findSelectedRate(selectedRateId);
      if (selectedRate && onShippingUpdate) {
        onShippingUpdate(selectedRate.calculatedCost);
      }
    },
    onError: (error) => {
      toast.error(error.serverError || "Failed to update shipping method");
    }
  });

  const findSelectedRate = (rateId: string) => {
    for (const option of shippingOptions) {
      const rate = option.rates.find((r: any) => r.rateId === rateId);
      if (rate) return rate;
    }
    return null;
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    getShippingRates({
      storeId,
      storeSlug,
      address: address.postalCode ? address : undefined
    });
  };

  const handleShippingSelection = (rateId: string) => {
    setSelectedRateId(rateId);
    const selectedRate = findSelectedRate(rateId);
    
    if (selectedRate) {
      updateShipping({
        storeSlug,
        shippingRateId: rateId,
        shippingCost: selectedRate.calculatedCost,
        shippingAddress: `${address.state} ${address.postalCode}`.trim() || undefined,
        shippingCity: undefined,
        shippingState: address.state || undefined,
        shippingCountry: address.country || undefined,
        shippingPostalCode: address.postalCode || undefined,
      });
    }
  };

  useEffect(() => {
    // Load initial shipping options
    getShippingRates({
      storeId,
      storeSlug,
      address: undefined
    });
  }, [storeId, storeSlug]);

  if (shippingOptions.length === 0 && !loadingRates) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            <CardTitle>Shipping</CardTitle>
          </div>
          <CardDescription>
            No shipping options available for this store
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          <CardTitle>Shipping Options</CardTitle>
        </div>
        <CardDescription>
          Select your preferred shipping method
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!showAddressForm && (
          <Button 
            variant="outline" 
            onClick={() => setShowAddressForm(true)}
            className="w-full"
          >
            <MapPin className="h-4 w-4 mr-2" />
            Enter Address for Accurate Rates
          </Button>
        )}

        {showAddressForm && (
          <form onSubmit={handleAddressSubmit} className="space-y-3 p-4 border rounded-lg bg-gray-50">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={address.country}
                  onChange={(e) => setAddress(prev => ({ ...prev, country: e.target.value }))}
                  placeholder="US"
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={address.state}
                  onChange={(e) => setAddress(prev => ({ ...prev, state: e.target.value }))}
                  placeholder="CA"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="postalCode">ZIP/Postal Code</Label>
              <Input
                id="postalCode"
                value={address.postalCode}
                onChange={(e) => setAddress(prev => ({ ...prev, postalCode: e.target.value }))}
                placeholder="90210"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loadingRates}>
                {loadingRates && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Update Rates
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowAddressForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        {loadingRates ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Loading shipping options...
          </div>
        ) : (
          <RadioGroup value={selectedRateId} onValueChange={handleShippingSelection}>
            {shippingOptions.map((option) => 
              option.rates.map((rate: any) => (
                <div key={rate.rateId} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value={rate.rateId} id={rate.rateId} />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <Label htmlFor={rate.rateId} className="font-medium cursor-pointer">
                          {rate.name}
                        </Label>
                        {rate.description && (
                          <p className="text-sm text-gray-600">{rate.description}</p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <span className="capitalize">{rate.type.replace('_', ' ')}</span>
                          {rate.estimatedDays && (
                            <>
                              <span>•</span>
                              <span>{rate.estimatedDays} days</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {rate.calculatedCost === "0.00" ? "Free" : `$${rate.calculatedCost}`}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </RadioGroup>
        )}

        {updatingShipping && (
          <div className="flex items-center justify-center py-2 text-sm text-gray-600">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Updating shipping method...
          </div>
        )}
      </CardContent>
    </Card>
  );
}