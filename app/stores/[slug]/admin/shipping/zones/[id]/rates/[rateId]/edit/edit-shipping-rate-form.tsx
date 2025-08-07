"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useAction } from "next-safe-action/hooks";
import { updateShippingRateAction } from "../../../../../actions";
import { toast } from "sonner";
import { Loader2, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SelectShippingRate } from "@/db/schemas";

const formSchema = z.object({
  name: z.string().min(1, "Rate name is required"),
  description: z.string().optional(),
  type: z.enum(["flat_rate", "weight_based", "price_based", "free"]),
  price: z.string().optional(),
  minWeight: z.string().optional(),
  maxWeight: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  estimatedDays: z.string().optional().transform((val) => val ? parseInt(val) : undefined),
  isActive: z.boolean().default(true),
});

type FormData = z.infer<typeof formSchema>;

interface EditShippingRateFormProps {
  rate: SelectShippingRate;
  zoneId: string;
  slug: string;
}

export function EditShippingRateForm({ rate, zoneId, slug }: EditShippingRateFormProps) {
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
      name: rate.name,
      description: rate.description || "",
      type: rate.type as any,
      price: rate.price || "",
      minWeight: rate.minWeight || "",
      maxWeight: rate.maxWeight || "",
      minPrice: rate.minPrice || "",
      maxPrice: rate.maxPrice || "",
      estimatedDays: rate.estimatedDays?.toString() || "",
      isActive: rate.isActive,
    },
  });

  const rateType = watch("type");
  const isActive = watch("isActive");

  const { execute } = useAction(updateShippingRateAction, {
    onSuccess: () => {
      toast.success("Shipping rate updated successfully");
      router.push(`/stores/${slug}/admin/shipping/zones/${zoneId}`);
    },
    onError: (error) => {
      toast.error(error.serverError || "Failed to update shipping rate");
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: FormData) => {
    setIsSubmitting(true);
    
    const processedData = {
      id: rate.id,
      name: data.name,
      description: data.description || null,
      type: data.type,
      price: data.price || null,
      minWeight: data.minWeight || null,
      maxWeight: data.maxWeight || null,
      minPrice: data.minPrice || null,
      maxPrice: data.maxPrice || null,
      estimatedDays: data.estimatedDays || null,
      isActive: data.isActive,
    };

    execute(processedData);
  };

  const renderRateTypeFields = () => {
    switch (rateType) {
      case "flat_rate":
        return (
          <div>
            <Label htmlFor="price">Price *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register("price")}
              className="mt-1"
            />
            <p className="text-sm text-gray-500 mt-1">
              Fixed shipping cost for all orders in this zone
            </p>
          </div>
        );
      
      case "weight_based":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minWeight">Min Weight (kg) *</Label>
                <Input
                  id="minWeight"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register("minWeight")}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="maxWeight">Max Weight (kg) *</Label>
                <Input
                  id="maxWeight"
                  type="number"
                  step="0.01"
                  placeholder="10.00"
                  {...register("maxWeight")}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register("price")}
                className="mt-1"
              />
            </div>
          </div>
        );
      
      case "price_based":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minPrice">Min Order Value *</Label>
                <Input
                  id="minPrice"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register("minPrice")}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="maxPrice">Max Order Value *</Label>
                <Input
                  id="maxPrice"
                  type="number"
                  step="0.01"
                  placeholder="100.00"
                  {...register("maxPrice")}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="price">Shipping Cost *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register("price")}
                className="mt-1"
              />
            </div>
          </div>
        );
      
      case "free":
        return (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Free shipping has no additional cost. You can still set weight or price conditions if needed.
            </AlertDescription>
          </Alert>
        );
      
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Rate Name *</Label>
          <Input
            id="name"
            placeholder="e.g., Standard Shipping, Express Delivery"
            {...register("name")}
            className="mt-1"
          />
          {errors.name && (
            <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Optional description for customers"
            {...register("description")}
            className="mt-1"
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="type">Rate Type *</Label>
          <Select value={rateType} onValueChange={(value) => setValue("type", value as any)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select rate type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="flat_rate">Flat Rate</SelectItem>
              <SelectItem value="weight_based">Weight Based</SelectItem>
              <SelectItem value="price_based">Price Based</SelectItem>
              <SelectItem value="free">Free Shipping</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {renderRateTypeFields()}

        <div>
          <Label htmlFor="estimatedDays">Estimated Delivery Days</Label>
          <Input
            id="estimatedDays"
            type="number"
            placeholder="e.g., 5"
            {...register("estimatedDays")}
            className="mt-1"
          />
          <p className="text-sm text-gray-500 mt-1">
            How many days delivery typically takes
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="isActive"
            checked={isActive}
            onCheckedChange={(checked) => setValue("isActive", checked)}
          />
          <Label htmlFor="isActive">Rate is active</Label>
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/stores/${slug}/admin/shipping/zones/${zoneId}`)}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Update Rate
        </Button>
      </div>
    </form>
  );
}