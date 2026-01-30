import { Heart, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pack, Product } from "@/types/api.types";

interface PackageItem {
  name: string;
}

interface PackageCardProps {
  pack: Pack;
}

function isProduct(product: string | Product): product is Product {
  return typeof product === "object" && product !== null && "_id" in product;
}

const PackageCard = ({ pack }: PackageCardProps) => {
  const { name, description, packPrice: price, image, items } = pack;
  return (
    <div className="group bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={image?.url || "https://img.icons8.com/deco/96/image.png"}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
        <h3 className="absolute bottom-4 left-4 font-script text-3xl text-primary-foreground">
          {name}
        </h3>
      </div>

      {/* Content */}
      <div className="p-5">
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {description}
        </p>

        {/* Items list */}
        <ul className="space-y-2 mb-5">
          {items.map((item, index) => (
            <li
              key={index}
              className="flex items-center gap-2 text-sm text-foreground/80"
            >
              <Heart className="w-3 h-3 text-primary fill-primary flex-shrink-0" />
              <span>
                {isProduct(item.product)
                  ? item.product.name
                  : "Produit supprimé"}
              </span>
            </li>
          ))}
        </ul>

        {/* Price and CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <span className="text-xl font-bold text-primary">
            {price.toLocaleString()} FCFA
          </span>
          <Button
            size="icon"
            className="gradient-button hover:opacity-90 rounded-full w-10 h-10 shadow-lg"
          >
            <ShoppingBag className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PackageCard;
