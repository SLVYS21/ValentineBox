import { ShoppingCart, Check, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const supplyHistory = [
  {
    id: 1,
    supplier: "Fleurs d'Afrique Grossiste",
    details: "100x Roses Rouges",
    date: "01/02/2026",
    cost: "-150 000 FCFA",
    status: "received",
    statusText: "Reçu en stock",
  },
  {
    id: 2,
    supplier: "ChocoDelice Import",
    details: "50x Boîtes Cœur",
    date: "10/02/2026",
    cost: "-300 000 FCFA",
    status: "pending",
    statusText: "Confirmer Réception",
  },
];

export default function Sourcing() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* New Supply Form */}
      <div className="bg-card rounded-xl border border-border shadow-card p-6">
        <div className="flex items-center gap-2 mb-6">
          <ShoppingCart className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-lg text-foreground font-sans">Nouveau Ravitaillement</h2>
        </div>

        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="supplier" className="text-xs uppercase tracking-wider text-muted-foreground">
              Fournisseur
            </Label>
            <Input id="supplier" placeholder="Ex: Grossiste Dakar" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="details" className="text-xs uppercase tracking-wider text-muted-foreground">
              Détails Commande
            </Label>
            <Textarea 
              id="details" 
              placeholder="Liste des produits..."
              className="min-h-[100px] resize-y"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cost" className="text-xs uppercase tracking-wider text-muted-foreground">
              Coût Estimé (FCFA)
            </Label>
            <Input id="cost" type="number" placeholder="0" />
          </div>

          <Button className="w-full mt-2">
            Lancer la commande
          </Button>
        </form>
      </div>

      {/* Supply History */}
      <div className="bg-card rounded-xl border border-border shadow-card p-6">
        <h2 className="font-semibold text-lg text-foreground mb-6 font-sans">Historique des Ravitaillements</h2>

        <div className="space-y-4">
          {supplyHistory.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors"
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                item.status === "received" ? "bg-status-success-bg" : "bg-status-warning-bg"
              )}>
                {item.status === "received" ? (
                  <Check className="h-5 w-5 text-status-success" />
                ) : (
                  <Package className="h-5 w-5 text-status-warning" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">{item.supplier}</p>
                <p className="text-sm text-primary">{item.details}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.date}</p>
              </div>

              <div className="text-right shrink-0">
                <p className="font-semibold text-foreground">{item.cost}</p>
                {item.status === "received" ? (
                  <p className="text-xs text-status-success mt-1">{item.statusText}</p>
                ) : (
                  <Button size="sm" className="text-xs h-7 mt-1">
                    {item.statusText}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
