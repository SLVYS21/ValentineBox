import { DollarSign, Clock, AlertTriangle, TrendingDown } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentOrdersTable } from "@/components/dashboard/RecentOrdersTable";
import { TopProductsList } from "@/components/dashboard/TopProductsList";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Chiffre d'Affaires"
          value="140 000 FCFA"
          subtitle="+12% vs hier"
          subtitleClassName="text-status-success"
          icon={DollarSign}
        />
        <StatCard
          title="Commandes en attente"
          value="1"
          subtitle="Action requise"
          subtitleClassName="text-blue-600"
          icon={Clock}
        />
        <StatCard
          title="Stock Critique"
          value="2 produits"
          subtitle="Ravitailler maintenant"
          subtitleClassName="text-orange-600"
          icon={AlertTriangle}
        />
        <StatCard
          title="Bénéfice Net"
          value="-35 000 FCFA"
          subtitle="Marge actuelle: -25%"
          subtitleClassName="text-destructive"
          icon={TrendingDown}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentOrdersTable />
        </div>
        <div>
          <TopProductsList />
        </div>
      </div>
    </div>
  );
}
