"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, MapPin, Truck, Package, Clock } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { getAvailableShippingRatesAction, updateCartShippingAction } from "@/app/stores/[slug]/client/cart/actions";
import { toast } from "sonner";
import { COLOMBIAN_CITIES } from "@/lib/colombian-shipping";

interface ShippingAddress {
  country: string;
  state: string;
  postalCode: string;
  city: string;
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
    country: "Colombia",
    state: "",
    postalCode: "",
    city: ""
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
      address: address.city ? { 
        country: address.country,
        state: address.state,
        postalCode: address.city // Using city as identifier for Colombian shipping
      } : undefined
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
            Calcular Envío a Tu Ciudad
          </Button>
        )}

        {showAddressForm && (
          <form onSubmit={handleAddressSubmit} className="space-y-4 p-4 border rounded-lg bg-blue-50 border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-5 w-5 text-blue-600" />
              <h3 className="font-medium text-blue-900">Dirección de Entrega en Colombia</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              <div>
                <Label htmlFor="city">Ciudad de Destino</Label>
                <Select 
                  value={address.city} 
                  onValueChange={(value) => {
                    const selectedCity = COLOMBIAN_CITIES.find(city => city.code === value);
                    setAddress(prev => ({ 
                      ...prev, 
                      city: value,
                      state: selectedCity?.department || ""
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tu ciudad" />
                  </SelectTrigger>
                  <SelectContent>
                    {COLOMBIAN_CITIES.map((city) => (
                      <SelectItem key={city.code} value={city.code}>
                        {city.name} ({city.department})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="postalCode">Código Postal (Opcional)</Label>
                <Input
                  id="postalCode"
                  value={address.postalCode}
                  onChange={(e) => setAddress(prev => ({ ...prev, postalCode: e.target.value }))}
                  placeholder="110111"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button type="submit" disabled={loadingRates || !address.city}>
                {loadingRates && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Calcular Envíos
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowAddressForm(false)}
              >
                Cancelar
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
              option.rates.map((rate: any) => {
                const companyName = rate.name.split(' - ')[0]; // Extract company name
                const serviceName = rate.name.split(' - ')[1] || rate.name;
                const isExpress = rate.estimatedDays <= 1;
                const isSameDay = rate.estimatedDays === 0;
                
                return (
                  <div key={rate.rateId} className="flex items-center space-x-3 p-4 border-2 rounded-lg hover:bg-gray-50 hover:border-blue-200 transition-all">
                    <RadioGroupItem value={rate.rateId} id={rate.rateId} />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Label htmlFor={rate.rateId} className="font-semibold cursor-pointer text-gray-900">
                              {companyName}
                            </Label>
                            {isExpress && (
                              <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full font-medium">
                                {isSameDay ? "HOY MISMO" : "EXPRESS"}
                              </span>
                            )}
                          </div>
                          
                          <div className="text-sm font-medium text-gray-700 mb-1">
                            {serviceName}
                          </div>
                          
                          {rate.description && (
                            <p className="text-sm text-gray-600 mb-2">{rate.description}</p>
                          )}
                          
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>
                                {rate.estimatedDays === 0 ? "Hoy mismo" : 
                                 rate.estimatedDays === 1 ? "1 día" : 
                                 `${rate.estimatedDays} días`}
                              </span>
                            </div>
                            
                            {rate.type === "weight_based" && (
                              <div className="flex items-center gap-1">
                                <Package className="h-3 w-3" />
                                <span>Por peso</span>
                              </div>
                            )}
                            
                            {rate.name.includes("Recaudo") || rate.name.includes("Contra") && (
                              <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs">
                                Contra entrega
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right ml-4">
                          <div className="font-bold text-lg text-gray-900">
                            {rate.calculatedCost === "0.00" ? "Gratis" : `$${parseFloat(rate.calculatedCost).toLocaleString('es-CO')}`}
                          </div>
                          {rate.calculatedCost !== "0.00" && (
                            <div className="text-xs text-gray-500">COP</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
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