"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Tag } from "lucide-react";

export default function CategoryNotFound() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Category Not Found</h2>
          <p className="text-gray-600 mt-2">
            The category you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-gray-500">
            <Tag className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p>This category could not be found.</p>
            <p className="text-sm mt-2">
              It may have been deleted or moved to a different location.
            </p>
            <Button className="mt-4" onClick={() => window.history.back()}>
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}