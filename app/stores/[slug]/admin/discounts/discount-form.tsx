"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAction } from "next-safe-action/hooks";
import { createDiscountAction, updateDiscountAction } from "./actions";
import { toast } from "@/hooks/use-toast";

interface Discount {
  id: string;
  name: string;
  percentage: string;
  endDate: Date;
  storeId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface DiscountFormProps {
  discount?: Discount;
  isEditing?: boolean;
  slug: string;
  storeId: string;
}

export function DiscountForm({ discount, isEditing = false, slug, storeId }: DiscountFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: discount?.name || "",
    percentage: discount?.percentage || "",
    endDate: discount?.endDate ? new Date(discount.endDate).toISOString().split('T')[0] : "",
    isActive: discount?.isActive ?? true,
  });

  const { execute: createDiscount, isExecuting: isCreating } = useAction(createDiscountAction, {
    onSuccess: () => {
      toast({
        title: "Discount created",
        description: "The discount has been successfully created.",
      });
      router.push(`/stores/${slug}/admin/discounts`);
    },
    onError: (error) => {
      toast({
        title: "Error creating discount",
        description: error.error.serverError || "An unexpected error occurred.",
        variant: "destructive",
      });
    },
  });

  const { execute: updateDiscount, isExecuting: isUpdating } = useAction(updateDiscountAction, {
    onSuccess: () => {
      toast({
        title: "Discount updated",
        description: "The discount has been successfully updated.",
      });
      router.push(`/stores/${slug}/admin/discounts`);
    },
    onError: (error) => {
      toast({
        title: "Error updating discount",
        description: error.error.serverError || "An unexpected error occurred.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing && discount) {
      updateDiscount({
        id: discount.id,
        ...formData,
      });
    } else {
      createDiscount({
        ...formData,
        storeId,
      });
    }
  };

  const isLoading = isCreating || isUpdating;

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Discount" : "Create New Discount"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Discount Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Summer Sale, Holiday Discount"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="percentage">Discount Percentage</Label>
            <div className="relative">
              <Input
                id="percentage"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.percentage}
                onChange={(e) => setFormData({ ...formData, percentage: e.target.value })}
                placeholder="e.g., 25"
                className="pr-8"
                required
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                %
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
            <Label htmlFor="isActive">Active</Label>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : isEditing ? "Update Discount" : "Create Discount"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/stores/${slug}/admin/discounts`)}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}