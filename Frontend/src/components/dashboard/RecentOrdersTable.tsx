import { StatusBadge } from "./StatusBadge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const recentOrders = [
  { id: "#001", client: "Moussa Diop", total: "50 000 FCFA", status: "delivered" as const },
  { id: "#002", client: "Amina Sow", total: "40 000 FCFA", status: "validated" as const },
  { id: "#003", client: "Jean Kouassi", total: "50 000 FCFA", status: "delivered" as const },
  { id: "#004", client: "Fatou Ndiaye", total: "55 000 FCFA", status: "pending" as const },
];

export function RecentOrdersTable() {
  return (
    <div className="bg-white rounded-xl">
      <div className="p-5 flex items-center justify-between border-b border-gray-200">
        <h3 className="font-semibold font-sans">Commandes Récentes</h3>
        <Button variant="link" className="text-primary p-0 h-auto" asChild>
          <Link to="/orders">Voir tout</Link>
        </Button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider">
              <th className="px-5 py-3 font-medium">ID</th>
              <th className="px-5 py-3 font-medium">Client</th>
              <th className="px-5 py-3 font-medium">Total</th>
              <th className="px-5 py-3 font-medium">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {recentOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-100/50 transition-colors">
                <td className="px-5 py-4 text-sm text-muted-foreground">{order.id}</td>
                <td className="px-5 py-4 text-sm font-medium text-foreground">{order.client}</td>
                <td className="px-5 py-4 text-sm text-foreground">{order.total}</td>
                <td className="px-5 py-4">
                  <StatusBadge status={order.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
