"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function ZoneError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const params = useParams();
  const slug = params?.slug as string;

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <CardTitle>Error Loading Shipping Zone</CardTitle>
          </div>
          <CardDescription>
            We couldn&apos;t load the shipping zone details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              {error.message || "The shipping zone might not exist or you don&apos;t have permission to view it."}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={reset}>Try again</Button>
            <Link href={`/stores/${slug}/admin/shipping`}>
              <Button variant="outline">Back to Shipping</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}