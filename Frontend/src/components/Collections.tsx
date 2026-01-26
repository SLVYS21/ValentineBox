import { useState } from "react";
import PackageCard from "./PackageCard";
import FallingHearts from "./FallingHearts";
import { Button } from "@/components/ui/button";
import CustomBoxBuilderInline from "./CustomBoxBuilderInline";

const categories = [
  { id: "all", label: "Tous" },
  { id: "budget", label: "Petit Budget" },
  { id: "premium", label: "Premium" },
  { id: "luxe", label: "Luxe" },
];

const packages = [
  {
    id: 1,
    name: "Le Doux Baiser",
    description: "Un petit geste plein d'amour. Ours en peluche, rose unique et chocolats.",
    price: 15000,
    category: "budget",
    image: "/images/pack-doux-baiser.jpg",
    items: [
      { name: "Ours en peluche" },
      { name: "Rose Rouge Unique" },
      { name: "Chocolats Cœur (6pcs)" },
    ],
  },
  {
    id: 2,
    name: "Passion Rouge",
    description: "Le grand classique. Bouquet de 12 roses, boîte de truffes et bougie parfumée.",
    price: 45000,
    category: "premium",
    image: "/images/pack-passion-rouge.jpg",
    items: [
      { name: "Bouquet 12 Roses" },
      { name: "Boîte Truffes Luxe" },
      { name: "Bougie Parfumée" },
      { name: "Carte Personnalisée" },
    ],
  },
  {
    id: 3,
    name: "Soirée Cocooning",
    description: "Pour un moment de détente à deux. Huiles de massage, peignoirs et vin.",
    price: 55000,
    category: "luxe",
    image: "/images/pack-soiree-cocooning.jpg",
    items: [
      { name: "Kit Massage" },
      { name: "Vin Rouge" },
      { name: "2 Peignoirs" },
      { name: "Jeu pour Couple" },
    ],
  },
];

const Collections = () => {
  const [activeTab, setActiveTab] = useState("packs");
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredPackages = packages.filter(
    (pkg) => activeCategory === "all" || pkg.category === activeCategory
  );

  return (
    <section id="collections" className="relative py-16 md:py-24 bg-secondary/30 overflow-hidden">
      <FallingHearts />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Tab Toggle */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex bg-card rounded-full p-1 shadow-md">
            <Button
              variant={activeTab === "packs" ? "default" : "ghost"}
              className={`rounded-full px-6 py-2 text-sm font-medium transition-all ${
                activeTab === "packs"
                  ? "gradient-button text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab("packs")}
            >
              Packs Tout-Fait
            </Button>
            <Button
              variant={activeTab === "custom" ? "default" : "ghost"}
              className={`rounded-full px-6 py-2 text-sm font-medium transition-all ${
                activeTab === "custom"
                  ? "gradient-button text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab("custom")}
            >
              Sur Mesure
            </Button>
          </div>
        </div>

        {activeTab === "custom" ? (
          <CustomBoxBuilderInline />
        ) : (
          <>
            {/* Title */}
            <div className="text-center mb-10">
              <h2 className="font-script text-4xl sm:text-5xl md:text-6xl text-primary mb-4">
                Nos Collections
              </h2>
              <p className="text-muted-foreground text-base md:text-lg max-w-md mx-auto">
                Sélectionnés avec amour pour tous les budgets
              </p>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-3 mb-10">
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={activeCategory === cat.id ? "default" : "outline"}
                  size="sm"
                  className={`rounded-full px-5 transition-all ${
                    activeCategory === cat.id
                      ? "gradient-button text-primary-foreground border-0"
                      : "border-primary/30 text-foreground hover:border-primary hover:bg-primary/5"
                  }`}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  {cat.label}
                </Button>
              ))}
            </div>

            {/* Package Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {filteredPackages.map((pkg, index) => (
                <div
                  key={pkg.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <PackageCard {...pkg} />
                </div>
              ))}
            </div>

            {filteredPackages.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Aucun pack trouvé dans cette catégorie.</p>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default Collections;
