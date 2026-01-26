import { Plus, Package, Search, Edit, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const products = [
  {
    id: 1,
    name: "Bouquet Royal 50 Roses",
    description: "Roses rouges fraîches importées.",
    price: "35 000 FCFA",
    stock: 12,
    emoji: "🌹",
  },
  {
    id: 2,
    name: "Coffret Chocolats Cœur",
    description: "Assortiment praliné fin.",
    price: "15 000 FCFA",
    stock: 45,
    emoji: "🍫",
  },
  {
    id: 3,
    name: "Ours Géant 1m50",
    description: "Peluche ultra douce premium.",
    price: "40 000 FCFA",
    stock: 5,
    emoji: "🧸",
  },
  {
    id: 4,
    name: "Collier Or & Rubis",
    description: "Plaque or 18 carats.",
    price: "65 000 FCFA",
    stock: 8,
    emoji: "💎",
  },
  {
    id: 5,
    name: "Pack Duo Montres",
    description: "Pour lui et pour elle.",
    price: "55 000 FCFA",
    stock: 10,
    emoji: "⌚",
  },
  {
    id: 6,
    name: "Parfum 'Amour Éternel'",
    description: "Eau de parfum florale.",
    price: "25 000 FCFA",
    stock: 20,
    emoji: "🌸",
  },
];

export default function Products() {
  return (
    <div className="space-y-6">
      {/* Header with search and actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Rechercher un produit..." 
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nouveau Produit
          </Button>
          <Button variant="outline" className="gap-2">
            <Package className="h-4 w-4" />
            Créer un Pack
          </Button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-card rounded-xl border border-border shadow-card overflow-hidden card-hover"
          >
            <div className="h-40 bg-gradient-to-br from-secondary to-accent flex items-center justify-center text-6xl">
              {product.emoji}
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-foreground text-sm leading-tight font-sans">
                  {product.name}
                </h3>
                <p className="text-sm font-bold text-primary whitespace-nowrap">
                  {product.price}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">{product.description}</p>
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Stock: <span className="font-semibold text-foreground">{product.stock} unités</span>
                </p>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <History className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Add New Product Card */}
        <button className="bg-card rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-secondary/50 transition-colors min-h-[280px] flex flex-col items-center justify-center gap-3 text-muted-foreground hover:text-primary">
          <div className="w-12 h-12 rounded-full border-2 border-current flex items-center justify-center">
            <Plus className="h-6 w-6" />
          </div>
          <span className="font-medium">Ajouter un produit</span>
        </button>
      </div>
    </div>
  );
}
