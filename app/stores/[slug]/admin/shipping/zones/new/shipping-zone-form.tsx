"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useAction } from "next-safe-action/hooks";
import { createShippingZoneAction } from "../../actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, "Zone name is required"),
  countries: z.string().optional(),
  states: z.string().optional(),
  postalCodes: z.string().optional(),
  isActive: z.boolean().default(true),
});

type FormData = z.infer<typeof formSchema>;

interface ShippingZoneFormProps {
  storeId: string;
  slug: string;
}

export function ShippingZoneForm({ storeId, slug }: ShippingZoneFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      countries: "",
      states: "",
      postalCodes: "",
      isActive: true,
    },
  });

  const isActive = watch("isActive");

  const { execute } = useAction(createShippingZoneAction, {
    onSuccess: (result) => {
      toast.success("Shipping zone created successfully");
      router.push(`/stores/${slug}/admin/shipping/zones/${result.data?.zone.id}`);
    },
    onError: (error) => {
      toast.error(error.serverError || "Failed to create shipping zone");
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: FormData) => {
    setIsSubmitting(true);
    
    const processedData = {
      name: data.name,
      storeId,
      countries: data.countries ? data.countries.split(",").map(c => c.trim()).filter(Boolean) : null,
      states: data.states ? data.states.split(",").map(s => s.trim()).filter(Boolean) : null,
      postalCodes: data.postalCodes ? data.postalCodes.split(",").map(p => p.trim()).filter(Boolean) : null,
      isActive: data.isActive,
    };

    execute(processedData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Zone Name *</Label>
          <Input
            id="name"
            placeholder="e.g., United States, Europe, Asia"
            {...register("name")}
            className="mt-1"
          />
          {errors.name && (
            <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="countries">Countries</Label>
          <Textarea
            id="countries"
            placeholder="Enter country codes separated by commas (e.g., US, CA, MX)"
            {...register("countries")}
            className="mt-1"
            rows={2}
          />
          <p className="text-sm text-gray-500 mt-1">
            Leave empty to include all countries
          </p>
        </div>

        <div>
          <Label htmlFor="states">States/Provinces</Label>
          <Textarea
            id="states"
            placeholder="Enter state/province codes separated by commas (e.g., CA, NY, TX)"
            {...register("states")}
            className="mt-1"
            rows={2}
          />
          <p className="text-sm text-gray-500 mt-1">
            Leave empty to include all states/provinces
          </p>
        </div>

        <div>
          <Label htmlFor="postalCodes">Postal/ZIP Codes</Label>
          <Textarea
            id="postalCodes"
            placeholder="Enter postal codes separated by commas (e.g., 90210, 10001)"
            {...register("postalCodes")}
            className="mt-1"
            rows={2}
          />
          <p className="text-sm text-gray-500 mt-1">
            You can use wildcards like 9021* to match ranges
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="isActive"
            checked={isActive}
            onCheckedChange={(checked) => setValue("isActive", checked)}
          />
          <Label htmlFor="isActive">Zone is active</Label>
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/stores/${slug}/admin/shipping`)}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Create Zone
        </Button>
      </div>
    </form>
  );
}