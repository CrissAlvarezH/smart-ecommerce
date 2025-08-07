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
import { MoreHorizontal, Edit, Trash, Truck, Plus } from "lucide-react";
import Link from "next/link";
import { useAction } from "next-safe-action/hooks";
import { deleteShippingMethodAction } from "./actions";
import { toast } from "sonner";
import { SelectShippingMethod } from "@/db/schemas";

interface ShippingMethodsClientProps {
  methods: SelectShippingMethod[];
  storeId: string;
  slug: string;
}

export function ShippingMethodsClient({ methods, storeId, slug }: ShippingMethodsClientProps) {
  const { execute: deleteMethod } = useAction(deleteShippingMethodAction, {
    onSuccess: () => {
      toast.success("Shipping method deleted successfully");
    },
    onError: (error) => {
      toast.error(error.serverError || "Failed to delete shipping method");
    }
  });

  const handleDelete = (methodId: string) => {
    if (confirm("Are you sure you want to delete this shipping method?")) {
      deleteMethod({ id: methodId, storeId });
    }
  };

  if (methods.length === 0) {
    return (
      <div className="text-center py-12">
        <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No shipping methods yet
        </h3>
        <p className="text-gray-500 mb-4">
          Add carriers and tracking methods for your shipments
        </p>
        <Link href={`/stores/${slug}/admin/shipping/methods/new`}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Shipping Method
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Method Name</TableHead>
          <TableHead>Carrier</TableHead>
          <TableHead>Code</TableHead>
          <TableHead>Tracking</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-[100px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {methods.map((method) => (
          <TableRow key={method.id}>
            <TableCell className="font-medium">{method.name}</TableCell>
            <TableCell>{method.carrier || "-"}</TableCell>
            <TableCell>
              {method.code ? (
                <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {method.code}
                </code>
              ) : (
                "-"
              )}
            </TableCell>
            <TableCell>
              {method.trackingUrlTemplate ? (
                <Badge variant="outline">Enabled</Badge>
              ) : (
                <span className="text-gray-400">-</span>
              )}
            </TableCell>
            <TableCell>
              <Badge variant={method.isActive ? "success" : "secondary"}>
                {method.isActive ? "Active" : "Inactive"}
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
                    <Link href={`/stores/${slug}/admin/shipping/methods/${method.id}/edit`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDelete(method.id)}
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