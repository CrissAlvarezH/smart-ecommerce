"use client";

import { Button } from "@/components/ui/button";
import { Edit, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import Link from "next/link";
import { useAction } from "next-safe-action/hooks";
import { deleteShippingZoneAction, toggleShippingZoneStatusAction } from "./actions";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { type SelectShippingZone } from "@/db/schemas";

interface ShippingZoneActionsProps {
  zone: SelectShippingZone;
  storeSlug: string;
  storeId: string;
}

export default function ShippingZoneActions({ zone, storeSlug, storeId }: ShippingZoneActionsProps) {
  const { execute: deleteZone, isExecuting: isDeleting } = useAction(deleteShippingZoneAction, {
    onSuccess: () => {
      toast.success("Shipping zone deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete shipping zone");
    },
  });

  const { execute: toggleStatus, isExecuting: isToggling } = useAction(toggleShippingZoneStatusAction, {
    onSuccess: () => {
      toast.success(`Shipping zone ${zone.isActive ? 'deactivated' : 'activated'} successfully`);
    },
    onError: () => {
      toast.error("Failed to update shipping zone status");
    },
  });

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => toggleStatus({ id: zone.id, storeId, storeSlug })}
        disabled={isToggling}
      >
        {zone.isActive ? (
          <ToggleRight className="h-4 w-4" />
        ) : (
          <ToggleLeft className="h-4 w-4" />
        )}
      </Button>
      
      <Link href={`/stores/${storeSlug}/admin/shipping/${zone.id}/edit`}>
        <Button variant="ghost" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      </Link>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="sm" disabled={isDeleting}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Shipping Zone</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{zone.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteZone({ id: zone.id, storeId, storeSlug })}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}