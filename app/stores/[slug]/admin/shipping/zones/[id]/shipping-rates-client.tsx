"use client";

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
import { MoreHorizontal, Edit, Trash, Package, Plus } from "lucide-react";
import Link from "next/link";
import { useAction } from "next-safe-action/hooks";
import { deleteShippingRateAction } from "../../actions";
import { toast } from "sonner";
import { SelectShippingRate } from "@/db/schemas";

interface ShippingRatesClientProps {
  rates: SelectShippingRate[];
  zoneId: string;
  slug: string;
}

export function ShippingRatesClient({ rates, zoneId, slug }: ShippingRatesClientProps) {
  const { execute: deleteRate } = useAction(deleteShippingRateAction, {
    onSuccess: () => {
      toast.success("Shipping rate deleted successfully");
    },
    onError: (error) => {
      toast.error(error.serverError || "Failed to delete shipping rate");
    }
  });

  const handleDelete = (rateId: string) => {
    if (confirm("Are you sure you want to delete this shipping rate?")) {
      deleteRate({ id: rateId });
    }
  };

  const formatRateType = (type: string) => {
    switch (type) {
      case "flat_rate":
        return "Flat Rate";
      case "weight_based":
        return "Weight Based";
      case "price_based":
        return "Price Based";
      case "free":
        return "Free Shipping";
      default:
        return type;
    }
  };

  const formatRateDetails = (rate: SelectShippingRate) => {
    if (rate.type === "free") {
      return "Free";
    }
    
    if (rate.type === "flat_rate") {
      return rate.price ? `$${rate.price}` : "-";
    }
    
    if (rate.type === "weight_based") {
      return `$${rate.price} (${rate.minWeight}-${rate.maxWeight} kg)`;
    }
    
    if (rate.type === "price_based") {
      return `$${rate.price} ($${rate.minPrice}-$${rate.maxPrice})`;
    }
    
    return "-";
  };

  if (rates.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No shipping rates yet
        </h3>
        <p className="text-gray-500 mb-4">
          Add shipping rates for customers in this zone
        </p>
        <Link href={`/stores/${slug}/admin/shipping/zones/${zoneId}/rates/new`}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Shipping Rate
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Rate Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Price/Conditions</TableHead>
          <TableHead>Estimated Days</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-[100px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rates.map((rate) => (
          <TableRow key={rate.id}>
            <TableCell className="font-medium">
              <div>
                <div>{rate.name}</div>
                {rate.description && (
                  <div className="text-sm text-gray-500">{rate.description}</div>
                )}
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline">{formatRateType(rate.type)}</Badge>
            </TableCell>
            <TableCell className="font-mono text-sm">
              {formatRateDetails(rate)}
            </TableCell>
            <TableCell>
              {rate.estimatedDays ? `${rate.estimatedDays} days` : "-"}
            </TableCell>
            <TableCell>
              <Badge variant={rate.isActive ? "success" : "secondary"}>
                {rate.isActive ? "Active" : "Inactive"}
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
                    <Link href={`/stores/${slug}/admin/shipping/zones/${zoneId}/rates/${rate.id}/edit`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDelete(rate.id)}
                    className="text-red-600"
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