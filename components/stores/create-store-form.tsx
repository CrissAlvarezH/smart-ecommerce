"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { createStoreAction } from "@/app/actions";

const createStoreSchema = z.object({
  name: z.string().min(2, "Store name must be at least 2 characters"),
  description: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  currency: z.string().default("USD"),
  timezone: z.string().default("UTC"),
});

type CreateStoreFormData = z.infer<typeof createStoreSchema>;

interface CreateStoreFormProps {
  onSuccess?: (storeSlug: string) => void;
}

export function CreateStoreForm({ onSuccess }: CreateStoreFormProps) {
  const router = useRouter();

  const form = useForm<CreateStoreFormData>({
    resolver: zodResolver(createStoreSchema),
    defaultValues: {
      name: "",
      description: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
      currency: "USD",
      timezone: "UTC",
    },
  });

  const { execute, result, isExecuting, hasSucceeded, hasErrored } = useAction(createStoreAction, {
    onSuccess: (result) => {
      toast.success("Store created successfully!");
      form.reset();
      if (onSuccess && result.data?.store) {
        onSuccess(result.data.store.slug);
      } else if (result.data?.store) {
        router.push(`/stores/${result.data.store.slug}/admin`);
      }
    },
    onError: (result) => {
      toast.error(result.serverError || "Failed to create store. Please try again.");
    },
  });

  const onSubmit = (data: CreateStoreFormData) => {
    const cleanData = {
      ...data,
      email: data.email || undefined,
      phone: data.phone || undefined,
      address: data.address || undefined,
      city: data.city || undefined,
      state: data.state || undefined,
      country: data.country || undefined,
      postalCode: data.postalCode || undefined,
      description: data.description || undefined,
    };
    execute(cleanData);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create Your Store</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="name">Store Name *</Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="My Awesome Store"
                className="mt-1"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...form.register("description")}
                placeholder="Tell customers about your store..."
                className="mt-1"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...form.register("email")}
                placeholder="store@example.com"
                className="mt-1"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                {...form.register("phone")}
                placeholder="+1 (555) 123-4567"
                className="mt-1"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                {...form.register("address")}
                placeholder="123 Main St"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                {...form.register("city")}
                placeholder="New York"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="state">State/Province</Label>
              <Input
                id="state"
                {...form.register("state")}
                placeholder="NY"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                {...form.register("country")}
                placeholder="United States"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                {...form.register("postalCode")}
                placeholder="10001"
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isExecuting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isExecuting}>
              {isExecuting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Store"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}