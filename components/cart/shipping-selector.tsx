"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Loader2, MapPin, Truck, Plus, Edit3, Trash2, ChevronDown, Check } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { getAvailableShippingRatesAction, updateCartShippingAction } from "@/app/stores/[slug]/client/cart/actions";
import { toast } from "sonner";
import { COLOMBIAN_CITIES, COLOMBIAN_DEPARTMENTS } from "@/lib/colombian-shipping";

// Country codes with phone prefixes
const COUNTRY_CODES = [
  { code: "CO", name: "Colombia", prefix: "+57", flag: "🇨🇴" },
  { code: "US", name: "United States", prefix: "+1", flag: "🇺🇸" },
  { code: "CA", name: "Canada", prefix: "+1", flag: "🇨🇦" },
  { code: "MX", name: "Mexico", prefix: "+52", flag: "🇲🇽" },
  { code: "AR", name: "Argentina", prefix: "+54", flag: "🇦🇷" },
  { code: "BR", name: "Brazil", prefix: "+55", flag: "🇧🇷" },
  { code: "CL", name: "Chile", prefix: "+56", flag: "🇨🇱" },
  { code: "PE", name: "Peru", prefix: "+51", flag: "🇵🇪" },
  { code: "EC", name: "Ecuador", prefix: "+593", flag: "🇪🇨" },
  { code: "VE", name: "Venezuela", prefix: "+58", flag: "🇻🇪" },
  { code: "UY", name: "Uruguay", prefix: "+598", flag: "🇺🇾" },
  { code: "PY", name: "Paraguay", prefix: "+595", flag: "🇵🇾" },
  { code: "BO", name: "Bolivia", prefix: "+591", flag: "🇧🇴" },
  { code: "CR", name: "Costa Rica", prefix: "+506", flag: "🇨🇷" },
  { code: "PA", name: "Panama", prefix: "+507", flag: "🇵🇦" },
  { code: "GT", name: "Guatemala", prefix: "+502", flag: "🇬🇹" },
  { code: "HN", name: "Honduras", prefix: "+504", flag: "🇭🇳" },
  { code: "SV", name: "El Salvador", prefix: "+503", flag: "🇸🇻" },
  { code: "NI", name: "Nicaragua", prefix: "+505", flag: "🇳🇮" },
  { code: "DO", name: "Dominican Republic", prefix: "+1-809", flag: "🇩🇴" },
  { code: "CU", name: "Cuba", prefix: "+53", flag: "🇨🇺" },
  { code: "ES", name: "Spain", prefix: "+34", flag: "🇪🇸" },
  { code: "FR", name: "France", prefix: "+33", flag: "🇫🇷" },
  { code: "IT", name: "Italy", prefix: "+39", flag: "🇮🇹" },
  { code: "DE", name: "Germany", prefix: "+49", flag: "🇩🇪" },
  { code: "GB", name: "United Kingdom", prefix: "+44", flag: "🇬🇧" },
  { code: "JP", name: "Japan", prefix: "+81", flag: "🇯🇵" },
  { code: "KR", name: "South Korea", prefix: "+82", flag: "🇰🇷" },
  { code: "CN", name: "China", prefix: "+86", flag: "🇨🇳" },
  { code: "IN", name: "India", prefix: "+91", flag: "🇮🇳" },
  { code: "AU", name: "Australia", prefix: "+61", flag: "🇦🇺" },
  { code: "NZ", name: "New Zealand", prefix: "+64", flag: "🇳🇿" },
].sort((a, b) => a.name.localeCompare(b.name));

interface Address {
  id?: string;
  state: string;
  city: string;
  address: string;
  additionalInfo?: string;
  postalCode: string;
  countryCode: string;
  phone: string;
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
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [selectedRateId, setSelectedRateId] = useState<string>(currentShippingRate?.id || "");
  const [shippingOptions, setShippingOptions] = useState<any[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [countryPickerOpen, setCountryPickerOpen] = useState(false);
  const [formAddress, setFormAddress] = useState<Address>({
    state: "",
    city: "",
    address: "",
    additionalInfo: "",
    postalCode: "",
    countryCode: "CO", // Default to Colombia
    phone: ""
  });

  // Load addresses from localStorage
  useEffect(() => {
    const savedAddresses = localStorage.getItem(`addresses_${storeSlug}`);
    if (savedAddresses) {
      const parsed = JSON.parse(savedAddresses);
      setAddresses(parsed);
      if (parsed.length > 0 && !selectedAddressId) {
        setSelectedAddressId(parsed[0].id);
      }
    } else {
      setShowAddressForm(true); // Show form if no addresses exist
    }
  }, [storeSlug]);

  // Save addresses to localStorage
  const saveAddresses = (newAddresses: Address[]) => {
    setAddresses(newAddresses);
    localStorage.setItem(`addresses_${storeSlug}`, JSON.stringify(newAddresses));
  };

  // Get cities for selected state
  const getCitiesForState = (state: string) => {
    return COLOMBIAN_CITIES.filter(city => city.department === state);
  };

  const { execute: getShippingRates, isExecuting: loadingRates } = useAction(getAvailableShippingRatesAction, {
    onSuccess: (result) => {
      const options = result.data?.shippingOptions || [];
      setShippingOptions(options);
      
      // Auto-select the cheapest option when rates are loaded
      if (options.length > 0 && !selectedRateId) {
        let cheapestRate: any = null;
        let cheapestPrice = Infinity;
        
        options.forEach((option: any) => {
          option.rates.forEach((rate: any) => {
            const price = parseFloat(rate.calculatedCost);
            if (price < cheapestPrice) {
              cheapestPrice = price;
              cheapestRate = rate;
            }
          });
        });
        
        if (cheapestRate) {
          handleShippingSelection(cheapestRate.rateId);
        }
      }
    },
    onError: (error) => {
      toast.error(error.serverError || "Failed to load shipping options");
    }
  });

  const { execute: updateShipping, isExecuting: updatingShipping } = useAction(updateCartShippingAction, {
    onSuccess: (result) => {
      toast.success("Shipping method updated");
    },
    onError: (error) => {
      toast.error(error.serverError || "Failed to update shipping method");
    }
  });

  const handleShippingSelection = (rateId: string) => {
    setSelectedRateId(rateId);
    const selectedRate = findSelectedRate(rateId);
    const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);
    
    if (selectedRate && selectedAddress) {
      // Update the UI immediately
      if (onShippingUpdate) {
        onShippingUpdate(selectedRate.calculatedCost);
      }
      
      // Then update the backend
      updateShipping({
        storeSlug,
        shippingRateId: rateId,
        shippingCost: selectedRate.calculatedCost,
        shippingAddress: selectedAddress.address,
        shippingCity: selectedAddress.city,
        shippingState: selectedAddress.state,
        shippingCountry: "Colombia",
        shippingPostalCode: selectedAddress.postalCode,
      });
    }
  };

  const findSelectedRate = (rateId: string) => {
    for (const option of shippingOptions) {
      const rate = option.rates.find((r: any) => r.rateId === rateId);
      if (rate) return rate;
    }
    return null;
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formAddress.state || !formAddress.city || !formAddress.address || !formAddress.phone || !formAddress.countryCode) {
      toast.error("Please fill all required fields");
      return;
    }

    const newAddress: Address = {
      ...formAddress,
      id: editingAddressId || Date.now().toString()
    };

    let updatedAddresses: Address[];
    if (editingAddressId) {
      updatedAddresses = addresses.map(addr => 
        addr.id === editingAddressId ? newAddress : addr
      );
    } else {
      updatedAddresses = [...addresses, newAddress];
    }

    saveAddresses(updatedAddresses);
    setSelectedAddressId(newAddress.id!);
    setShowAddressForm(false);
    setEditingAddressId(null);
    resetForm();

    // Load shipping rates for new address
    loadShippingRates(newAddress);
  };

  const loadShippingRates = (address: Address) => {
    getShippingRates({
      storeId,
      storeSlug,
      address: {
        country: "Colombia",
        state: address.state,
        postalCode: address.city // Using city as identifier for Colombian shipping
      }
    });
  };

  const handleEditAddress = (address: Address) => {
    setFormAddress({ ...address });
    setEditingAddressId(address.id!);
    setShowAddressForm(true);
  };

  const handleDeleteAddress = (addressId: string) => {
    const updatedAddresses = addresses.filter(addr => addr.id !== addressId);
    saveAddresses(updatedAddresses);
    
    if (selectedAddressId === addressId) {
      if (updatedAddresses.length > 0) {
        setSelectedAddressId(updatedAddresses[0].id!);
        loadShippingRates(updatedAddresses[0]);
      } else {
        setSelectedAddressId("");
        setShippingOptions([]);
        setShowAddressForm(true);
      }
    }
  };

  const resetForm = () => {
    setFormAddress({
      state: "",
      city: "",
      address: "",
      additionalInfo: "",
      postalCode: "",
      countryCode: "CO", // Default to Colombia
      phone: ""
    });
  };

  const handleCancelForm = () => {
    setShowAddressForm(false);
    setEditingAddressId(null);
    resetForm();
  };

  // Load shipping rates when address changes
  useEffect(() => {
    if (selectedAddressId && addresses.length > 0) {
      const address = addresses.find(addr => addr.id === selectedAddressId);
      if (address) {
        loadShippingRates(address);
      }
    }
  }, [selectedAddressId]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          <CardTitle>Shipping</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Address Selection */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Delivery Address</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddressForm(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Address
            </Button>
          </div>

          {addresses.length > 0 && !showAddressForm && (
            <RadioGroup 
              value={selectedAddressId} 
              onValueChange={setSelectedAddressId}
              className="space-y-3"
            >
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className={`relative border rounded-lg p-4 ${
                    selectedAddressId === address.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <RadioGroupItem value={address.id!} className="mt-1" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{address.city}, {address.state}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{address.address}</p>
                      {address.additionalInfo && (
                        <p className="text-sm text-gray-500">{address.additionalInfo}</p>
                      )}
                      <p className="text-sm text-gray-500">
                        Phone: {COUNTRY_CODES.find(c => c.code === address.countryCode)?.prefix || ''} {address.phone} | Postal: {address.postalCode}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditAddress(address)}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      {addresses.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAddress(address.id!)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </RadioGroup>
          )}
        </div>

        {/* Address Form */}
        {showAddressForm && (
          <>
            <Separator />
            <form onSubmit={handleAddressSubmit} className="space-y-4">
              <h3 className="font-semibold">
                {editingAddressId ? 'Edit Address' : 'Add New Address'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="state">State/Department *</Label>
                  <Select 
                    value={formAddress.state} 
                    onValueChange={(value) => {
                      setFormAddress(prev => ({ ...prev, state: value, city: "" }));
                    }}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {COLOMBIAN_DEPARTMENTS.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="city">City *</Label>
                  <Select 
                    value={formAddress.city} 
                    onValueChange={(value) => {
                      setFormAddress(prev => ({ ...prev, city: value }));
                    }}
                    disabled={!formAddress.state}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {getCitiesForState(formAddress.state).map((city) => (
                        <SelectItem key={city.code} value={city.name}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  value={formAddress.address}
                  onChange={(e) => setFormAddress(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Street, number, neighborhood"
                  required
                />
              </div>

              <div>
                <Label htmlFor="additionalInfo">Additional Information</Label>
                <Textarea
                  id="additionalInfo"
                  value={formAddress.additionalInfo}
                  onChange={(e) => setFormAddress(prev => ({ ...prev, additionalInfo: e.target.value }))}
                  placeholder="Apartment, floor, building references, etc."
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="postalCode">Postal Code *</Label>
                <Input
                  id="postalCode"
                  value={formAddress.postalCode}
                  onChange={(e) => setFormAddress(prev => ({ ...prev, postalCode: e.target.value }))}
                  placeholder="110111"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone *</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Popover open={countryPickerOpen} onOpenChange={setCountryPickerOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={countryPickerOpen}
                        className="w-full justify-between"
                      >
                        {formAddress.countryCode ? (
                          <div className="flex items-center gap-2">
                            <span>{COUNTRY_CODES.find(c => c.code === formAddress.countryCode)?.flag}</span>
                            <span className="font-mono text-sm">
                              {COUNTRY_CODES.find(c => c.code === formAddress.countryCode)?.prefix}
                            </span>
                          </div>
                        ) : (
                          "Country..."
                        )}
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                      <Command>
                        <CommandInput placeholder="Search country..." />
                        <CommandEmpty>No country found.</CommandEmpty>
                        <CommandList>
                          <CommandGroup>
                            {COUNTRY_CODES.map((country) => (
                              <CommandItem
                                key={country.code}
                                value={`${country.name} ${country.prefix}`}
                                onSelect={() => {
                                  setFormAddress(prev => ({ ...prev, countryCode: country.code }));
                                  setCountryPickerOpen(false);
                                }}
                              >
                                <div className="flex items-center gap-2 w-full">
                                  <span>{country.flag}</span>
                                  <span className="flex-1">{country.name}</span>
                                  <span className="font-mono text-sm text-gray-500">
                                    {country.prefix}
                                  </span>
                                  <Check
                                    className={`ml-2 h-4 w-4 ${
                                      country.code === formAddress.countryCode ? "opacity-100" : "opacity-0"
                                    }`}
                                  />
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <Input
                    id="phone"
                    value={formAddress.phone}
                    onChange={(e) => setFormAddress(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="300 123 4567"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={loadingRates}>
                  {loadingRates && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingAddressId ? 'Update Address' : 'Save Address'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCancelForm}
                  disabled={loadingRates}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </>
        )}

        {/* Shipping Options */}
        {selectedAddressId && shippingOptions.length > 0 && (
          <>
            <Separator />
            <div>
              <h3 className="font-semibold mb-4">Shipping Methods</h3>
              
              {loadingRates ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  Loading shipping options...
                </div>
              ) : (
                <RadioGroup value={selectedRateId} onValueChange={handleShippingSelection}>
                  <div className="space-y-3">
                    {shippingOptions.flatMap(option => 
                      option.rates.map((rate: any) => (
                        <label
                          key={rate.rateId}
                          htmlFor={rate.rateId}
                          className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                            selectedRateId === rate.rateId 
                              ? 'border-blue-500 bg-blue-50 shadow-sm' 
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <RadioGroupItem value={rate.rateId} id={rate.rateId} />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium">{rate.name}</div>
                                {rate.description && (
                                  <div className="text-sm text-gray-600">{rate.description}</div>
                                )}
                                <div className="text-sm text-gray-500">
                                  Delivery: {rate.estimatedDays === 0 ? "Same day" : 
                                           rate.estimatedDays === 1 ? "1 business day" : 
                                           `${rate.estimatedDays} business days`}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-lg">
                                  ${parseFloat(rate.calculatedCost).toLocaleString('es-CO')}
                                </div>
                                <div className="text-sm text-gray-500">COP</div>
                              </div>
                            </div>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                </RadioGroup>
              )}
            </div>
          </>
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