import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Store, ArrowRight } from "lucide-react";

export default function StoreNotFound() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="text-center py-16">
        <Store className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Store Not Found</h2>
        <p className="text-gray-600 mb-6">
          The store you&apos;re looking for doesn&apos;t exist or may have been moved.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/">
            <Button variant="outline">
              Back to Home
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/debug-stores">
            <Button variant="outline">
              View All Stores
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}