import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const topProducts = [
  { 
    name: "Bouquet Royal 50 Roses", 
    stock: 12, 
    price: "35 000 FCFA",
    image: "🌹"
  },
  { 
    name: "Coffret Chocolats Cœur", 
    stock: 45, 
    price: "15 000 FCFA",
    image: "🍫"
  },
  { 
    name: "Ours Géant 1m50", 
    stock: 5, 
    price: "40 000 FCFA",
    image: "🧸"
  },
];

export function TopProductsList() {
  return (
    <div className="bg-white rounded-xl">
      <div className="p-5 border-b border-border">
        <h3 className="font-semibold text-foreground font-sans">Top Produits</h3>
      </div>
      
      <div className="p-3 space-y-2">
        {topProducts.map((product) => (
          <div 
            key={product.name}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center text-2xl">
              {product.image}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
              <p className="text-xs text-muted-foreground">{product.stock} en stock</p>
            </div>
            <p className="text-sm font-semibold text-primary">{product.price}</p>
          </div>
        ))}
      </div>
      
      <div className="p-3 border-t border-gray-200">
        <Button variant="outline" className="w-full bg-gray-50 hover:bg-gray-100 text-gray-900 hover:text-gray-900 border-none" asChild>
          <Link to="/products">Gérer le stock</Link>
        </Button>
      </div>
    </div>
  );
}
