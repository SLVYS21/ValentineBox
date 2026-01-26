import { useState } from "react";
import {
  Flower2,
  Cookie,
  Gem,
  PartyPopper,
  Sparkles,
  LayoutGrid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useCart } from "@/context/CartContext";

const categories = [
  { id: "all", label: "Tous", icon: LayoutGrid },
  { id: "fleurs", label: "Fleurs", icon: Flower2 },
  { id: "gourmandises", label: "Gourmandises", icon: Cookie },
  { id: "bijoux", label: "Bijoux", icon: Gem },
  { id: "fun", label: "Fun & Déco", icon: PartyPopper },
  { id: "bienetre", label: "Bien-être", icon: Sparkles },
];

const products = [
  {
    id: 101,
    name: "Rose Unique",
    price: 2000,
    category: "fleurs",
    image: "/images/pack-doux-baiser.jpg",
  },
  {
    id: 102,
    name: "Bouquet (12)",
    price: 15000,
    category: "fleurs",
    image: "/images/pack-passion-rouge.jpg",
  },
  {
    id: 103,
    name: "Boîte Chocolats",
    price: 8000,
    category: "gourmandises",
    image: "/images/pack-doux-baiser.jpg",
  },
  {
    id: 104,
    name: "Truffes Luxe",
    price: 12000,
    category: "gourmandises",
    image: "/images/pack-passion-rouge.jpg",
  },
  {
    id: 105,
    name: "Collier Cœur",
    price: 25000,
    category: "bijoux",
    image: "/images/pack-soiree-cocooning.jpg",
  },
  {
    id: 106,
    name: "Bracelet Amour",
    price: 18000,
    category: "bijoux",
    image: "/images/pack-passion-rouge.jpg",
  },
  {
    id: 107,
    name: "Bougie Parfumée",
    price: 6000,
    category: "fun",
    image: "/images/pack-soiree-cocooning.jpg",
  },
  {
    id: 108,
    name: "Jeu pour Couple",
    price: 10000,
    category: "fun",
    image: "/images/pack-doux-baiser.jpg",
  },
  {
    id: 109,
    name: "Parfum",
    price: 40000,
    category: "bienetre",
    image: "/images/pack-passion-rouge.jpg",
  },
  {
    id: 110,
    name: "Kit Spa",
    price: 18000,
    category: "bienetre",
    image: "/images/pack-soiree-cocooning.jpg",
  },
  {
    id: 111,
    name: "Huile Massage",
    price: 8000,
    category: "bienetre",
    image: "/images/pack-soiree-cocooning.jpg",
  },
  {
    id: 112,
    name: "Peluche Ours",
    price: 5000,
    category: "fun",
    image: "/images/pack-doux-baiser.jpg",
  },
];

const CustomBoxBuilderInline = () => {
  const [budget, setBudget] = useState([50000]);
  const [activeCategory, setActiveCategory] = useState("all");
  const { items, addItem, totalPrice, removeItemQuantity } = useCart();

  const maxBudget = budget[0];
  const remaining = maxBudget - totalPrice;
  const usedPercent = (totalPrice / maxBudget) * 100;

  const filteredProducts = products.filter(
    (p) => activeCategory === "all" || p.category === activeCategory,
  );

  const canAdd = (price: number) => remaining >= price;
  const isOverBudget = totalPrice > maxBudget;

  const getQuantity = (id: number) =>
    items.find((i) => i.id === id)?.quantity ?? 0;

  return (
    <>
      {/* Title */}
      <div className="text-center mb-10">
        <h2 className="font-script text-4xl sm:text-5xl md:text-6xl text-primary mb-4">
          L'Atelier de Cupidon
        </h2>
        <p className="text-muted-foreground text-base md:text-lg max-w-md mx-auto">
          Composez votre coffret unique étape par étape
        </p>
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-8">
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Budget Slider */}
          <div className="bg-card rounded-2xl p-5 shadow-card">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="font-medium">Votre Budget Max</span>
            </div>
            <Slider
              value={budget}
              onValueChange={setBudget}
              max={200000}
              min={10000}
              step={5000}
              className="mb-3"
            />
            <span className="text-xl font-bold text-primary">
              {budget[0].toLocaleString()} FCFA
            </span>
          </div>

          {/* Categories */}
          <div className="bg-card rounded-2xl p-5 shadow-card">
            <h3 className="font-semibold mb-4">Catégories</h3>
            <div className="space-y-1">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition-all ${
                      activeCategory === cat.id
                        ? "bg-accent text-primary font-medium"
                        : "hover:bg-secondary text-foreground/80"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div>
          {/* Budget Progress Bar */}
          <div className="bg-card rounded-2xl p-5 shadow-card mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-foreground">
                Utilisé:{" "}
                <strong className="text-primary">
                  {totalPrice.toLocaleString()} FCFA
                </strong>
              </span>
              <span className="text-foreground">
                Restant:{" "}
                <strong
                  className={isOverBudget ? "text-red-600" : "text-primary"}
                >
                  {Math.max(0, remaining).toLocaleString()} FCFA
                </strong>
              </span>
            </div>
            <div className="h-3 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full gradient-button transition-all duration-300"
                style={{ width: `${Math.min(usedPercent, 100)}%` }}
              />
            </div>
            {isOverBudget && (
              <div className="mt-3 flex items-center gap-2 text-sm text-red-600 px-3 py-2">
                ⚠️ <span>Attention, vous dépassez votre budget !</span>
              </div>
            )}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredProducts.map((product) => {
              const quantity = getQuantity(product.id);
              const isAdded = quantity > 0;
              // const isAdded = items.some((i) => i.id === product.id);
              // const canAddThis = canAdd(product.price);

              return (
                <div
                  key={product.id}
                  className="bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {quantity > 0 && (
                      <span className="absolute top-3 right-3 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">
                        {quantity}
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-foreground">
                      {product.name}
                    </h4>
                    <p className="text-primary font-bold mb-3">
                      {product.price.toLocaleString()} FCFA
                    </p>
                     <div className="flex items-center justify-between gap-3">
                    {isAdded && (
                      <Button
                        onClick={() => removeItemQuantity(product.id)}
                        variant="outline"
                        className="bg-gray-100 border-gray-200 w-9 h-9 rounded-full"
                      >
                        −
                      </Button>
                    )}
                    <Button
                      onClick={() => addItem(product)}
                      // disabled={!canAddThis || isAdded}
                      variant="outline"
                      className="w-full rounded-xl border-primary/5 text-primary hover:bg-primary hover:text-primary-foreground"
                      
                    >
                      Ajouter
                    </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomBoxBuilderInline;
