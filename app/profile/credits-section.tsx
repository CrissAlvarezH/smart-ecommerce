"use client";

import { useEffect, useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { getCreditHistoryAction, getCreditPackagesAction } from "./credits-actions";
import { CreditPurchaseForm } from "./credit-purchase-form";
import { Button } from "@/components/ui/button";
import { CreditCard, Plus, Wallet } from "lucide-react";
import { DatabaseUserAttributes } from "@/lib/auth";
import { SelectCreditTransaction, SelectCreditPackage } from "@/db/schemas/credits";

interface CreditsSectionProps {
  user: DatabaseUserAttributes;
}

export function CreditsSection({ user }: CreditsSectionProps) {
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [transactions, setTransactions] = useState<SelectCreditTransaction[]>([]);
  const [packages, setPackages] = useState<SelectCreditPackage[]>([]);

  const { execute: getCreditHistory, isPending: isLoadingHistory } = useAction(
    getCreditHistoryAction,
    {
      onSuccess: (data) => {
        if (data.data) {
          setTransactions(data.data);
        }
      },
    }
  );

  const { execute: getCreditPackages, isPending: isLoadingPackages } = useAction(
    getCreditPackagesAction,
    {
      onSuccess: (data) => {
        if (data.data) {
          setPackages(data.data);
        }
      },
    }
  );

  useEffect(() => {
    getCreditHistory();
    getCreditPackages();
  }, [getCreditHistory, getCreditPackages]);

  const formatDate = (date: Date) => {
    // Use consistent formatting to avoid hydration issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}/${month}/${day} ${hours}:${minutes}`;
  };

  const formatAmount = (amount: number) => {
    return (amount / 100).toFixed(2);
  };

  return (
    <div className="space-y-6">
      {/* Current Credits */}
      <div className="p-4 rounded-lg border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-50 rounded-full">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <p>Créditos disponibles</p>
              <p className="text-lg font-bold">{user.credits}</p>
            </div>
          </div>
          <Button
            onClick={() => setShowPurchaseForm(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Comprar créditos
          </Button>
        </div>
      </div>

      {/* Purchase Form */}
      <CreditPurchaseForm
        packages={packages}
        open={showPurchaseForm}
        onClose={() => setShowPurchaseForm(false)}
        onSuccess={() => {
          setShowPurchaseForm(false);
          // Refresh the page to update credits
          window.location.reload();
        }}
      />

      {/* Credit History */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <CreditCard className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg">Historial de créditos</h3>
        </div>

        {isLoadingHistory ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600 mx-auto"></div>
            <p className="mt-2 text-sm">Cargando historial...</p>
          </div>
        ) : transactions.length === 0 ? (
          <p className="text-sm text-center py-8">No tienes transacciones aún</p>
        ) : (
          <div className="space-y-3">
            {transactions.slice(0, 10).map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">{transaction.description}</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(transaction.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`font-semibold ${
                      transaction.type === "purchase"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {transaction.type === "purchase" ? "+" : ""}
                    {transaction.amount} créditos
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {transaction.type}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}