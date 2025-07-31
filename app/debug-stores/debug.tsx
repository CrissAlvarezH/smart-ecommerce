"use client";

import { useAction } from "next-safe-action/hooks";
import { debugStoresAction } from "../actions";
import { Button } from "@/components/ui/button";

export function DebugStores() {
  const { execute, result, isExecuting } = useAction(debugStoresAction, {
    onSuccess: (result) => {
      console.log("Debug result:", result);
    },
    onError: (error) => {
      console.error("Debug error:", error);
    }
  });

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Debug Stores</h2>
      <Button onClick={() => execute({})} disabled={isExecuting}>
        {isExecuting ? "Debugging..." : "Debug Stores"}
      </Button>
      
      {result?.data && (
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <h3 className="font-bold mb-2">Debug Results:</h3>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(result.data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}