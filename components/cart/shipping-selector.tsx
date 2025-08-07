"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Loader2, MapPin, Truck, Package, Clock, ChevronRight, Zap, Shield, Info } from "lucide-react";
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

  // Group shipping options by company
  const groupedShippingOptions = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    
    shippingOptions.forEach(option => {
      option.rates.forEach((rate: any) => {
        const companyName = rate.name.split(' - ')[0];
        if (!grouped[companyName]) {
          grouped[companyName] = [];
        }
        grouped[companyName].push(rate);
      });
    });

    // Sort rates within each company by price
    Object.keys(grouped).forEach(company => {
      grouped[company].sort((a, b) => 
        parseFloat(a.calculatedCost) - parseFloat(b.calculatedCost)
      );
    });

    return grouped;
  }, [shippingOptions]);

  // Get company metadata with brand colors
  const getCompanyInfo = (companyName: string) => {
    const info: Record<string, { color: string; icon: any; textColor: string }> = {
      'Envia': { 
        color: 'bg-red-50 border-red-200 hover:bg-red-100',
        textColor: 'text-red-900',
        icon: Package
      },
      'Servientrega': { 
        color: 'bg-green-50 border-green-200 hover:bg-green-100',
        textColor: 'text-green-900',
        icon: Zap
      },
      'Coordinadora': { 
        color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
        textColor: 'text-blue-900',
        icon: Shield
      },
      'Interrapidisimo': { 
        color: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
        textColor: 'text-orange-900',
        icon: Truck
      },
    };
    return info[companyName] || { 
      color: 'bg-gray-50 border-gray-200 hover:bg-gray-100',
      textColor: 'text-gray-900',
      icon: Truck
    };
  };

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
            Cargando opciones de envío...
          </div>
        ) : (
          <RadioGroup value={selectedRateId} onValueChange={handleShippingSelection}>
            <Accordion type="single" collapsible className="w-full">
              {Object.entries(groupedShippingOptions).map(([companyName, rates]) => {
                const companyInfo = getCompanyInfo(companyName);
                const CompanyIcon = companyInfo.icon;
                const cheapestRate = rates[0]; // Already sorted by price
                const hasExpress = rates.some((r: any) => r.estimatedDays <= 1);
                const hasCOD = rates.some((r: any) => r.name.includes("Recaudo") || r.name.includes("Contra"));
                
                return (
                  <AccordionItem 
                    key={companyName} 
                    value={companyName}
                    className={`border-2 rounded-lg mb-2 overflow-hidden transition-all ${companyInfo.color}`}
                  >
                    <AccordionTrigger className="px-3 py-2 hover:no-underline">
                      <div className="flex items-center justify-between w-full pr-2">
                        <div className="flex items-center gap-2">
                          <CompanyIcon className={`h-4 w-4 flex-shrink-0 ${companyInfo.textColor}`} />
                          <div className={`font-semibold text-sm ${companyInfo.textColor}`}>{companyName}</div>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          <div className="hidden sm:flex gap-1">
                            {hasExpress && (
                              <span className="bg-red-100 text-red-700 text-xs px-1.5 py-0.5 rounded-full font-medium">
                                EXPRESS
                              </span>
                            )}
                            {hasCOD && (
                              <span className="bg-green-100 text-green-700 text-xs px-1.5 py-0.5 rounded-full font-medium">
                                COD
                              </span>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-500">Desde</div>
                            <div className={`font-bold text-sm ${companyInfo.textColor}`}>
                              ${parseFloat(cheapestRate.calculatedCost).toLocaleString('es-CO')}
                            </div>
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-3 pb-3 pt-1">
                      <TooltipProvider>
                        <div className="space-y-1.5">
                          {rates.map((rate: any) => {
                            const serviceName = rate.name.split(' - ')[1] || 'Estándar';
                            const isExpress = rate.estimatedDays <= 1;
                            const isSameDay = rate.estimatedDays === 0;
                            const isCOD = rate.name.includes("Recaudo") || rate.name.includes("Contra");
                            
                            return (
                              <label
                                key={rate.rateId}
                                htmlFor={rate.rateId}
                                className={`flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-all
                                  ${selectedRateId === rate.rateId 
                                    ? `bg-white ${
                                      companyName === 'Envia' ? 'border-red-500' :
                                      companyName === 'Servientrega' ? 'border-green-500' :
                                      companyName === 'Coordinadora' ? 'border-blue-500' :
                                      companyName === 'Interrapidisimo' ? 'border-orange-500' :
                                      'border-gray-500'
                                    } shadow-sm` 
                                    : 'bg-white/50 border-gray-200 hover:bg-white hover:border-gray-300'}`}
                              >
                                <RadioGroupItem value={rate.rateId} id={rate.rateId} className="flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-medium text-sm text-gray-900">{serviceName}</span>
                                    {rate.description && (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Info className="h-3 w-3 text-gray-400 hover:text-gray-600 cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p className="text-xs">{rate.description}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    )}
                                    {isSameDay && (
                                      <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
                                        HOY
                                      </span>
                                    )}
                                    {isExpress && !isSameDay && (
                                      <span className="bg-orange-100 text-orange-800 text-xs px-1.5 py-0.5 rounded-full font-medium">
                                        EXPRESS
                                      </span>
                                    )}
                                    {isCOD && (
                                      <span className="bg-green-100 text-green-800 text-xs px-1.5 py-0.5 rounded-full font-medium">
                                        COD
                                      </span>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      <span>
                                        {rate.estimatedDays === 0 ? "Hoy" : 
                                         rate.estimatedDays === 1 ? "1 día" : 
                                         `${rate.estimatedDays} días`}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="text-right flex-shrink-0">
                                  <div className="font-bold text-sm text-gray-900">
                                    ${parseFloat(rate.calculatedCost).toLocaleString('es-CO')}
                                  </div>
                                  <div className="text-xs text-gray-500">COP</div>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </TooltipProvider>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
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