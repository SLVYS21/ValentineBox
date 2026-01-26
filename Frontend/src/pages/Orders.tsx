import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { cn } from "@/lib/utils";

type OrderStatus = "delivered" | "validated" | "pending" | "in_progress" | "completed";

const orders = [
  {
    id: "CMD-2825-001",
    client: "Moussa Diop",
    products: "1x Bouquet Royal 50 Roses, 1x Coffret Chocolats Cœur",
    total: "50 000 FCFA",
    date: "10/02/2026",
    status: "delivered" as OrderStatus,
  },
  {
    id: "CMD-2825-002",
    client: "Amina Sow",
    products: "1x Ours Géant 1m50",
    total: "40 000 FCFA",
    date: "09/02/2026",
    status: "completed" as OrderStatus,
  },
  {
    id: "CMD-2825-003",
    client: "Jean Kouassi",
    products: "2x Parfum 'Amour Éternel'",
    total: "50 000 FCFA",
    date: "08/02/2026",
    status: "delivered" as OrderStatus,
  },
  {
    id: "CMD-2825-004",
    client: "Fatou Ndiaye",
    products: "1x Pack Duo Montres",
    total: "55 000 FCFA",
    date: "11/02/2026",
    status: "in_progress" as OrderStatus,
  },
];

const filters = [
  { label: "Tout", value: "all" },
  { label: "En attente", value: "pending" },
  { label: "Livrées", value: "delivered" },
];

export default function Orders() {
  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl border border-border shadow-card">
        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border">
          <h2 className="font-semibold text-lg text-foreground font-sans">Toutes les Commandes</h2>
          <div className="flex gap-2">
            {filters.map((filter) => (
              <Button
                key={filter.value}
                variant={filter.value === "all" ? "secondary" : "ghost"}
                size="sm"
                className="text-xs"
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider bg-muted/30">
                <th className="px-5 py-3 font-medium">Commande</th>
                <th className="px-5 py-3 font-medium">Produits</th>
                <th className="px-5 py-3 font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Statut</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-5 py-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">{order.client}</p>
                      <p className="text-xs text-primary">{order.id}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-primary max-w-xs truncate">
                    {order.products}
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-foreground">
                    {order.total}
                  </td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">
                    {order.date}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      {order.status === "in_progress" && (
                        <Button size="sm" className="text-xs h-7">
                          Livrer
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
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
