import { Heart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCart } from "@/context/CartContext";

interface CartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CartDialog = ({ open, onOpenChange }: CartDialogProps) => {
  const { items, removeItem, totalPrice } = useCart();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <Heart className="w-5 h-5 text-primary fill-primary" />
            Votre Box d'Amour
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 max-h-[60vh] overflow-y-auto">
          {items.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Votre panier est vide
            </p>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 bg-secondary/30 rounded-xl"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground truncate">
                      {item.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {item.price.toLocaleString()} FCFA x{item.quantity}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-primary whitespace-nowrap">
                      {(item.price * item.quantity).toLocaleString()} FCFA
                    </span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-sm text-primary hover:underline"
                    >
                      Retirer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="mt-6 pt-4 border-t border-border">
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground">Total à payer</span>
              <span className="text-2xl font-bold text-primary">
                {totalPrice.toLocaleString()} FCFA
              </span>
            </div>
            <Button className="w-full gradient-button text-primary-foreground font-semibold py-6 rounded-xl">
              Commander Maintenant
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CartDialog;
