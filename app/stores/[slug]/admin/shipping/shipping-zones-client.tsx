"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash, Settings, Globe, MapPin, Plus } from "lucide-react";
import Link from "next/link";
import { useAction } from "next-safe-action/hooks";
import { deleteShippingZoneAction } from "./actions";
import { toast } from "sonner";
import { SelectShippingZone } from "@/db/schemas";

interface ShippingZonesClientProps {
  zones: (SelectShippingZone & { rateCount: number })[];
  storeId: string;
  slug: string;
}

export function ShippingZonesClient({ zones, storeId, slug }: ShippingZonesClientProps) {
  const { execute: deleteZone } = useAction(deleteShippingZoneAction, {
    onSuccess: () => {
      toast.success("Shipping zone deleted successfully");
    },
    onError: (error) => {
      toast.error(error.serverError || "Failed to delete shipping zone");
    }
  });

  const handleDelete = (zoneId: string) => {
    if (confirm("Are you sure you want to delete this shipping zone? All associated rates will be deleted.")) {
      deleteZone({ id: zoneId, storeId });
    }
  };

  const formatLocations = (zone: SelectShippingZone) => {
    const parts = [];
    if (zone.countries?.length) parts.push(`${zone.countries.length} countries`);
    if (zone.states?.length) parts.push(`${zone.states.length} states`);
    if (zone.postalCodes?.length) parts.push(`${zone.postalCodes.length} postal codes`);
    
    if (parts.length === 0) return "Worldwide";
    return parts.join(", ");
  };

  if (zones.length === 0) {
    return (
      <div className="text-center py-12">
        <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No shipping zones yet
        </h3>
        <p className="text-gray-500 mb-4">
          Create your first shipping zone to start defining rates
        </p>
        <Link href={`/stores/${slug}/admin/shipping/zones/new`}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Shipping Zone
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Zone Name</TableHead>
          <TableHead>Coverage</TableHead>
          <TableHead>Rates</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-[100px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {zones.map((zone) => (
          <TableRow key={zone.id}>
            <TableCell className="font-medium">{zone.name}</TableCell>
            <TableCell className="text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {formatLocations(zone)}
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="secondary">
                {zone.rateCount} {zone.rateCount === 1 ? 'rate' : 'rates'}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant={zone.isActive ? "success" : "secondary"}>
                {zone.isActive ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/stores/${slug}/admin/shipping/zones/${zone.id}`}>
                      <Settings className="h-4 w-4 mr-2" />
                      Manage Rates
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/stores/${slug}/admin/shipping/zones/${zone.id}/edit`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Zone
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDelete(zone.id)}
                    className="text-red-600"
                    disabled={zone.rateCount > 0}
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}