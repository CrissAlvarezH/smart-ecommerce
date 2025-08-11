"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { updateShippingZoneAction } from "../../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { COLOMBIAN_DEPARTMENTS, getCitiesByDepartment, getMainCitiesFromSelectedDepartments, type ColombianDepartment } from "@/lib/colombia-data";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EditShippingZoneFormProps {
  storeId: string;
  storeSlug: string;
  initialData: {
    id: string;
    name: string;
    departments: string[];
    cities: string[];
    price: string;
    isActive: boolean;
  };
}

export default function EditShippingZoneForm({ storeId, storeSlug, initialData }: EditShippingZoneFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialData.name);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>(initialData.departments);
  const [selectedCities, setSelectedCities] = useState<string[]>(initialData.cities);
  const [price, setPrice] = useState(initialData.price);
  const [isActive, setIsActive] = useState(initialData.isActive);
  const [departmentSearch, setDepartmentSearch] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  const { execute: updateZone, isExecuting } = useAction(updateShippingZoneAction, {
    onSuccess: () => {
      toast.success("Shipping zone updated successfully");
      router.push(`/stores/${storeSlug}/admin/shipping`);
    },
    onError: (error) => {
      toast.error(error.serverError || "Failed to update shipping zone");
    },
  });

  // Get available cities based on selected departments
  const availableCities = Array.from(new Set(
    selectedDepartments.flatMap(dept => 
      getCitiesByDepartment(dept as ColombianDepartment)
    )
  ));

  // Filter departments based on search
  const filteredDepartments = COLOMBIAN_DEPARTMENTS.filter(dept =>
    dept.toLowerCase().includes(departmentSearch.toLowerCase()) &&
    !selectedDepartments.includes(dept)
  );

  // Filter cities based on search
  const filteredCities = availableCities.filter(city =>
    city.toLowerCase().includes(citySearch.toLowerCase()) &&
    !selectedCities.includes(city)
  );

  const handleAddDepartment = (department: string) => {
    setSelectedDepartments([...selectedDepartments, department]);
    setDepartmentSearch("");
    setShowDepartmentDropdown(false);
  };

  const handleRemoveDepartment = (department: string) => {
    setSelectedDepartments(selectedDepartments.filter(d => d !== department));
    // Remove cities from the removed department
    const citiesFromDepartment = getCitiesByDepartment(department as ColombianDepartment);
    setSelectedCities(selectedCities.filter(city => !citiesFromDepartment.includes(city)));
  };

  const handleAddCity = (city: string) => {
    setSelectedCities([...selectedCities, city]);
    setCitySearch("");
    setShowCityDropdown(false);
  };

  const handleRemoveCity = (city: string) => {
    setSelectedCities(selectedCities.filter(c => c !== city));
  };

  const handleSelectAllDepartments = () => {
    if (selectedDepartments.length === COLOMBIAN_DEPARTMENTS.length) {
      // Deselect all
      setSelectedDepartments([]);
      setSelectedCities([]); // Clear cities when deselecting all departments
    } else {
      // Select all
      setSelectedDepartments([...COLOMBIAN_DEPARTMENTS]);
    }
  };

  const handleSelectAllCities = () => {
    if (selectedCities.length === availableCities.length) {
      setSelectedCities([]);
    } else {
      setSelectedCities(availableCities);
    }
  };

  const handleSelectMainCities = () => {
    // Get main cities from selected departments based on population ranking
    const mainCities = getMainCitiesFromSelectedDepartments(selectedDepartments);
    setSelectedCities(mainCities);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || selectedDepartments.length === 0 || selectedCities.length === 0 || !price) {
      toast.error("Please fill in all required fields");
      return;
    }

    updateZone({
      id: initialData.id,
      name,
      storeId,
      storeSlug,
      departments: selectedDepartments,
      cities: selectedCities,
      price,
      isActive,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Zone Name *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Bogotá Metropolitan Area"
          required
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Departments * ({COLOMBIAN_DEPARTMENTS.length} total)</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleSelectAllDepartments}
          >
            {selectedDepartments.length === COLOMBIAN_DEPARTMENTS.length ? "Deselect All" : "Select All"}
          </Button>
        </div>
        <div className="relative">
          <Input
            value={departmentSearch}
            onChange={(e) => setDepartmentSearch(e.target.value)}
            onFocus={() => {
              setShowDepartmentDropdown(true);
              setShowCityDropdown(false);
            }}
            onBlur={() => setTimeout(() => setShowDepartmentDropdown(false), 200)}
            placeholder="Search and select departments..."
          />
          {showDepartmentDropdown && filteredDepartments.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
              {filteredDepartments.map((dept) => (
                <button
                  key={dept}
                  type="button"
                  className="w-full px-3 py-2 text-left hover:bg-gray-100"
                  onClick={() => handleAddDepartment(dept)}
                >
                  {dept}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedDepartments.map((dept) => (
            <Badge key={dept} variant="secondary" className="gap-1">
              {dept}
              <button
                type="button"
                onClick={() => handleRemoveDepartment(dept)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {selectedDepartments.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Cities * ({availableCities.length} available)</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleSelectMainCities}
              >
                Select Main Cities
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleSelectAllCities}
              >
                {selectedCities.length === availableCities.length ? "Deselect All" : "Select All"}
              </Button>
            </div>
          </div>
          <div className="relative">
            <Input
              value={citySearch}
              onChange={(e) => setCitySearch(e.target.value)}
              onFocus={() => {
                setShowCityDropdown(true);
                setShowDepartmentDropdown(false);
              }}
              onBlur={() => setTimeout(() => setShowCityDropdown(false), 200)}
              placeholder="Search cities from selected departments..."
            />
            {showCityDropdown && filteredCities.length > 0 && (
              <ScrollArea className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg h-60">
                {filteredCities.map((city, index) => (
                  <button
                    key={`${city}-${index}`}
                    type="button"
                    className="w-full px-3 py-2 text-left hover:bg-gray-100"
                    onClick={() => handleAddCity(city)}
                  >
                    {city}
                  </button>
                ))}
              </ScrollArea>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-2 max-h-40 overflow-y-auto">
            {selectedCities.map((city, index) => (
              <Badge key={`selected-${city}-${index}`} variant="outline" className="gap-1">
                {city}
                <button
                  type="button"
                  onClick={() => handleRemoveCity(city)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="price">Shipping Price (COP) *</Label>
        <Input
          id="price"
          type="number"
          step="0.01"
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="e.g., 15000"
          required
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={isActive}
          onCheckedChange={setIsActive}
        />
        <Label htmlFor="isActive">Active</Label>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isExecuting}>
          {isExecuting ? "Updating..." : "Update Shipping Zone"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/stores/${storeSlug}/admin/shipping`)}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}