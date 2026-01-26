import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TransactionType = "income" | "expense";

const transactions = [
  {
    id: 1,
    date: "09/02/2026",
    description: "Commande Amina Sow",
    type: "income" as TransactionType,
    amount: "+40 000 FCFA",
  },
  {
    id: 2,
    date: "08/02/2026",
    description: "Commande Jean Kouassi",
    type: "income" as TransactionType,
    amount: "+50 000 FCFA",
  },
  {
    id: 3,
    date: "05/02/2026",
    description: "Publicité Facebook Ads",
    type: "expense" as TransactionType,
    amount: "-25 000 FCFA",
  },
  {
    id: 4,
    date: "01/02/2026",
    description: "Sourcing Fleurs d'Afrique",
    type: "expense" as TransactionType,
    amount: "-150 000 FCFA",
  },
  {
    id: 5,
    date: "23/01/2026",
    description: "Paiement CMD-2025-001",
    type: "income" as TransactionType,
    amount: "+50 000 FCFA",
  },
];

export default function Transactions() {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-income rounded-xl p-6 text-white">
          <p className="text-sm opacity-90 mb-1">Total Recettes</p>
          <p className="text-3xl font-bold">140 000 FCFA</p>
          <div className="mt-4 h-1 bg-white/30 rounded-full overflow-hidden">
            <div className="h-full w-[45%] bg-white rounded-full" />
          </div>
        </div>
        <div className="bg-expense rounded-xl p-6 text-white">
          <p className="text-sm opacity-90 mb-1">Total Dépenses</p>
          <p className="text-3xl font-bold">175 000 FCFA</p>
          <div className="mt-4 h-1 bg-white/30 rounded-full overflow-hidden">
            <div className="h-full w-[55%] bg-white rounded-full" />
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-card rounded-xl border border-border shadow-card">
        <div className="p-5 flex items-center justify-between border-b border-border">
          <h2 className="font-semibold text-lg text-foreground font-sans">Journal des Transactions</h2>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Ajouter Manuellement
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider bg-muted/30">
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Description</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium text-right">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-5 py-4 text-sm text-muted-foreground">{tx.date}</td>
                  <td className="px-5 py-4 text-sm font-medium text-foreground">{tx.description}</td>
                  <td className="px-5 py-4">
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase",
                      tx.type === "income" 
                        ? "bg-income-bg text-income" 
                        : "bg-expense-bg text-expense"
                    )}>
                      {tx.type === "income" ? "Entrée" : "Sortie"}
                    </span>
                  </td>
                  <td className={cn(
                    "px-5 py-4 text-sm font-semibold text-right",
                    tx.type === "income" ? "text-income" : "text-expense"
                  )}>
                    {tx.amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
