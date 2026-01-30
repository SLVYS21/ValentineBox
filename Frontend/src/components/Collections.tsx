import { useCallback, useEffect, useState } from "react";
import { Loader2, Search, Sparkles } from "lucide-react";
import PackageCard from "./PackageCard";
import FallingHearts from "./FallingHearts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CustomBoxBuilderInline from "./CustomBoxBuilderInline";
import { packService } from "@/services/pack.service";
import { Pack, PackCategory, PackOccasion } from "@/types/api.types";
import { useToast } from "@/hooks/use-toast";

// const categories = [
//   { id: "all", label: "Tous" },
//   { id: "budget", label: "Petit Budget" },
//   { id: "premium", label: "Premium" },
//   { id: "luxe", label: "Luxe" },
// ];

const categories = [
  { id: "all", label: "Tous", value: null },
  { id: "petit_budget", label: "Petit Budget", value: "petit_budget" as PackCategory },
  { id: "budget_moyen", label: "Budget Moyen", value: "budget_moyen" as PackCategory },
  { id: "budget_confortable", label: "Confortable", value: "budget_confortable" as PackCategory },
  { id: "budget_premium", label: "Premium", value: "budget_premium" as PackCategory },
  { id: "budget_luxe", label: "Luxe", value: "budget_luxe" as PackCategory },
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
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("packs");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeOccasion, setActiveOccasion] = useState<PackOccasion | null>(null);
  const [packs, setPacks] = useState<Pack[]>([]);
  const [packCurrentPage, setPackCurrentPage] = useState(1);
  const [packTotalPages, setPackTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Fetch packs
  const fetchPacks = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {
        page: 1,
        limit: 12,
      };

       if (activeCategory !== "all") params.category = activeCategory;
      if (activeOccasion !== null) params.occasion = activeOccasion;

      // if (activeCategory) {
      //   params.category = activeCategory;
      // }

      // if (activeOccasion) {
      //   params.occasion = activeOccasion;
      // }

      const response = await packService.getPacks(params);

      if (response.success && response.data) {
        setPacks(response.data);
        setPackTotalPages(response.totalPages || 1);
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de charger les packs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [activeCategory, activeOccasion, toast]);

  // Initial fetch
  useEffect(() => {
    fetchPacks();
  }, []);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  // const filteredPackages = packages.filter(
  //   (pkg) => activeCategory === "all" || pkg.category === activeCategory
  // );

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
              {packs.map((pkg, index) => (
                <div
                  key={pkg._id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <PackageCard pack={pkg} />
                </div>
              ))}
            </div>

            {packs.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Aucun pack disponible.</p>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default Collections;
