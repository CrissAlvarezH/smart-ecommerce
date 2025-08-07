"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAction } from "next-safe-action/hooks";
import { updateShippingMethodAction } from "../../../actions";
import { toast } from "sonner";
import { Loader2, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SelectShippingMethod } from "@/db/schemas";

const formSchema = z.object({
  name: z.string().min(1, "Method name is required"),
  carrier: z.string().optional(),
  code: z.string().optional(),
  trackingUrlTemplate: z.string().optional(),
  isActive: z.boolean().default(true),
});

type FormData = z.infer<typeof formSchema>;

interface EditShippingMethodFormProps {
  method: SelectShippingMethod;
  storeId: string;
  slug: string;
}

export function EditShippingMethodForm({ method, storeId, slug }: EditShippingMethodFormProps) {
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
      name: method.name,
      carrier: method.carrier || "",
      code: method.code || "",
      trackingUrlTemplate: method.trackingUrlTemplate || "",
      isActive: method.isActive,
    },
  });

  const isActive = watch("isActive");

  const { execute } = useAction(updateShippingMethodAction, {
    onSuccess: () => {
      toast.success("Shipping method updated successfully");
      router.push(`/stores/${slug}/admin/shipping`);
    },
    onError: (error) => {
      toast.error(error.serverError || "Failed to update shipping method");
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: FormData) => {
    setIsSubmitting(true);
    
    const processedData = {
      id: method.id,
      storeId,
      name: data.name,
      carrier: data.carrier || null,
      code: data.code || null,
      trackingUrlTemplate: data.trackingUrlTemplate || null,
      isActive: data.isActive,
    };

    execute(processedData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Method Name *</Label>
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
          <Label htmlFor="carrier">Carrier</Label>
          <Input
            id="carrier"
            placeholder="e.g., USPS, FedEx, UPS, DHL"
            {...register("carrier")}
            className="mt-1"
          />
          <p className="text-sm text-gray-500 mt-1">
            The shipping carrier or company handling deliveries
          </p>
        </div>

        <div>
          <Label htmlFor="code">Method Code</Label>
          <Input
            id="code"
            placeholder="e.g., STANDARD, EXPRESS, OVERNIGHT"
            {...register("code")}
            className="mt-1"
          />
          <p className="text-sm text-gray-500 mt-1">
            A unique code to identify this method in your system
          </p>
        </div>

        <div>
          <Label htmlFor="trackingUrlTemplate">Tracking URL Template</Label>
          <Input
            id="trackingUrlTemplate"
            placeholder="e.g., https://tracking.carrier.com/track?id={tracking_number}"
            {...register("trackingUrlTemplate")}
            className="mt-1"
          />
          <p className="text-sm text-gray-500 mt-1">
            Use {"{tracking_number}"} as a placeholder for the tracking ID
          </p>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Example tracking URLs:
            <ul className="mt-2 space-y-1 text-sm">
              <li>• USPS: https://tools.usps.com/go/TrackConfirmAction?qtc_tLabels1={"{tracking_number}"}</li>
              <li>• FedEx: https://www.fedex.com/fedextrack/?trknbr={"{tracking_number}"}</li>
              <li>• UPS: https://www.ups.com/track?tracknum={"{tracking_number}"}</li>
            </ul>
          </AlertDescription>
        </Alert>

        <div className="flex items-center space-x-2">
          <Switch
            id="isActive"
            checked={isActive}
            onCheckedChange={(checked) => setValue("isActive", checked)}
          />
          <Label htmlFor="isActive">Method is active</Label>
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
          Update Method
        </Button>
      </div>
    </form>
  );
}