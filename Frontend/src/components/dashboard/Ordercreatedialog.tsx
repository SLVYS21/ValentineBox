import { useState, useEffect } from "react";
import { Plus, X, Search, Minus, Trash2, User, Package, Truck, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { orderService } from "@/services/order.service";
import { Product, Order, OrderItem } from "@/types/api.types";
import { cn } from "@/lib/utils";

interface OrderCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (order: Order) => void;
  products?: Product[]; // Pass products from parent or fetch internally
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface FormData {
  // Customer info
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  
  // Delivery info
  deliveryType: "pickup" | "delivery";
  deliveryAddress: string;
  deliveryDate: string;
  deliveryTimeSlot: string;
  deliveryInstructions: string;
  deliveryFee: number;
  
  // Payment info
  paymentMethod: "cash" | "momo" | "bank_transfer" | "card";
  paymentStatus: "pending" | "paid";
  
  // Other
  notes: string;
  discount: number;
}

const initialFormData: FormData = {
  customerName: "",
  customerPhone: "",
  customerEmail: "",
  deliveryType: "delivery",
  deliveryAddress: "",
  deliveryDate: "",
  deliveryTimeSlot: "",
  deliveryInstructions: "",
  deliveryFee: 0,
  paymentMethod: "cash",
  paymentStatus: "pending",
  notes: "",
  discount: 0,
};

const timeSlots = [
  "08:00 - 10:00",
  "10:00 - 12:00",
  "12:00 - 14:00",
  "14:00 - 16:00",
  "16:00 - 18:00",
  "18:00 - 20:00",
];

export function OrderCreateDialog({
  open,
  onOpenChange,
  onSuccess,
  products = [],
}: OrderCreateDialogProps) {
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [productSearch, setProductSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  // Filter products based on search
  const filteredProducts = products.filter((product) =>
    product.isActive &&
    product.stock.status !== "out_of_stock" &&
    (product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      product.description.toLowerCase().includes(productSearch.toLowerCase()))
  );

  // Add product to cart
  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.product._id === product._id);
    
    if (existingItem) {
      updateQuantity(product._id, existingItem.quantity + 1);
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
    
    toast({
      title: "Produit ajouté",
      description: `${product.name} ajouté au panier`,
    });
  };

  // Update quantity
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }

    const item = cart.find((item) => item.product._id === productId);
    if (item && quantity > item.product.stock.available) {
      toast({
        title: "Stock insuffisant",
        description: `Seulement ${item.product.stock.available} disponible(s)`,
        variant: "destructive",
      });
      return;
    }

    setCart(
      cart.map((item) =>
        item.product._id === productId ? { ...item, quantity } : item
      )
    );
  };

  // Remove from cart
  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.product._id !== productId));
  };

  // Calculate totals
  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const discountAmount = formData.discount || 0;
  const deliveryFee = formData.deliveryType === "delivery" ? formData.deliveryFee : 0;
  const total = subtotal - discountAmount + deliveryFee;

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Validate current step
  const validateStep = (step: number): boolean => {
    const newErrors: Partial<FormData> = {};

    if (step === 1) {
      if (cart.length === 0) {
        toast({
          title: "Panier vide",
          description: "Veuillez ajouter au moins un produit",
          variant: "destructive",
        });
        return false;
      }
    }

    if (step === 2) {
      if (!formData.customerName.trim()) newErrors.customerName = "Nom requis";
      if (!formData.customerPhone.trim()) newErrors.customerPhone = "Téléphone requis";
      
      if (formData.deliveryType === "delivery" && !formData.deliveryAddress.trim()) {
        newErrors.deliveryAddress = "Adresse requise pour la livraison";
      }
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      toast({
        title: "Champs requis manquants",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  // Handle next step
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  // Submit order
  const handleSubmit = async () => {
    if (!validateStep(2)) return;

    setIsSubmitting(true);

    try {
      // Prepare order items
      const items: Partial<OrderItem>[] = cart.map((item) => ({
        product: item.product._id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        subtotal: item.product.price * item.quantity,
        image: item.product.images.find((img) => img.is_primary),
      }));

      // Prepare order data
      const orderData = {
        items,
        customer: {
          name: formData.customerName,
          phone: formData.customerPhone,
          email: formData.customerEmail || undefined,
        },
        delivery: {
          type: formData.deliveryType,
          address: formData.deliveryType === "delivery" ? formData.deliveryAddress : undefined,
          date: formData.deliveryDate ? new Date(formData.deliveryDate) : undefined,
          timeSlot: formData.deliveryTimeSlot || undefined,
          instructions: formData.deliveryInstructions || undefined,
          fee: deliveryFee,
        },
        payment: {
          method: formData.paymentMethod,
          status: formData.paymentStatus,
        },
        notes: formData.notes || undefined,
        discount: discountAmount,
      };

      const response = await orderService.createOrder(orderData);

      if (response.success && response.data) {
        toast({
          title: "Succès",
          description: `Commande ${response.data.orderNumber} créée avec succès`,
        });

        // Reset form
        setCart([]);
        setFormData(initialFormData);
        setCurrentStep(1);
        onOpenChange(false);

        // Call success callback
        if (onSuccess) {
          onSuccess(response.data);
        }
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error?.response?.data?.message || "Impossible de créer la commande",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset on close
  const handleClose = () => {
    if (!isSubmitting) {
      setCart([]);
      setFormData(initialFormData);
      setCurrentStep(1);
      setErrors({});
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouvelle Commande</DialogTitle>
          <DialogDescription>
            Étape {currentStep} sur 3 - {
              currentStep === 1 ? "Sélection des produits" :
              currentStep === 2 ? "Informations client et livraison" :
              "Révision et confirmation"
            }
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="flex gap-2 mb-4">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={cn(
                "flex-1 h-2 rounded-full transition-colors",
                step <= currentStep ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>

        {/* Step 1: Product Selection */}
        {currentStep === 1 && (
          <div className="space-y-4">
            {/* Product Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un produit..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Product List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto border rounded-lg p-3">
              {filteredProducts.length === 0 ? (
                <p className="text-muted-foreground text-center col-span-2 py-8">
                  Aucun produit trouvé
                </p>
              ) : (
                filteredProducts.map((product) => (
                  <div
                    key={product._id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(product.price)} • Stock: {product.stock.available}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addToCart(product)}
                      disabled={product.stock.available === 0}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>

            {/* Cart */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Package className="h-4 w-4" />
                Panier ({cart.length} article{cart.length > 1 ? "s" : ""})
              </h3>

              {cart.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Le panier est vide
                </p>
              ) : (
                <>
                  {cart.map((item) => (
                    <div
                      key={item.product._id}
                      className="flex items-center gap-3 bg-background rounded p-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(item.product.price)} × {item.quantity} = {formatCurrency(item.product.price * item.quantity)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-8 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock.available}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive"
                          onClick={() => removeFromCart(item.product._id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  <div className="pt-3 border-t space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Sous-total</span>
                      <span className="font-semibold">{formatCurrency(subtotal)}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Customer & Delivery Info */}
        {currentStep === 2 && (
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <User className="h-4 w-4" />
                Informations Client
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">
                    Nom complet <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) =>
                      setFormData({ ...formData, customerName: e.target.value })
                    }
                    placeholder="Ex: Jean Dupont"
                    className={errors.customerName ? "border-destructive" : ""}
                  />
                  {errors.customerName && (
                    <p className="text-xs text-destructive">{errors.customerName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerPhone">
                    Téléphone <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="customerPhone"
                    value={formData.customerPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, customerPhone: e.target.value })
                    }
                    placeholder="Ex: +229 XX XX XX XX"
                    className={errors.customerPhone ? "border-destructive" : ""}
                  />
                  {errors.customerPhone && (
                    <p className="text-xs text-destructive">{errors.customerPhone}</p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="customerEmail">Email (optionnel)</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, customerEmail: e.target.value })
                    }
                    placeholder="client@email.com"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Livraison
              </h3>

              <RadioGroup
                value={formData.deliveryType}
                onValueChange={(value: "pickup" | "delivery") =>
                  setFormData({ ...formData, deliveryType: value })
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="delivery" id="delivery" />
                  <Label htmlFor="delivery">Livraison à domicile</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pickup" id="pickup" />
                  <Label htmlFor="pickup">Retrait en magasin</Label>
                </div>
              </RadioGroup>

              {formData.deliveryType === "delivery" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="deliveryAddress">
                      Adresse de livraison <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="deliveryAddress"
                      value={formData.deliveryAddress}
                      onChange={(e) =>
                        setFormData({ ...formData, deliveryAddress: e.target.value })
                      }
                      placeholder="Rue, quartier, ville..."
                      rows={3}
                      className={errors.deliveryAddress ? "border-destructive" : ""}
                    />
                    {errors.deliveryAddress && (
                      <p className="text-xs text-destructive">{errors.deliveryAddress}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deliveryFee">Frais de livraison (FCFA)</Label>
                    <Input
                      id="deliveryFee"
                      type="number"
                      value={formData.deliveryFee}
                      onChange={(e) =>
                        setFormData({ ...formData, deliveryFee: parseFloat(e.target.value) || 0 })
                      }
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deliveryDate">Date de livraison (optionnel)</Label>
                  <Input
                    id="deliveryDate"
                    type="date"
                    value={formData.deliveryDate}
                    onChange={(e) =>
                      setFormData({ ...formData, deliveryDate: e.target.value })
                    }
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deliveryTimeSlot">Créneau horaire (optionnel)</Label>
                  <Select
                    value={formData.deliveryTimeSlot}
                    onValueChange={(value) =>
                      setFormData({ ...formData, deliveryTimeSlot: value })
                    }
                  >
                    <SelectTrigger id="deliveryTimeSlot">
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((slot) => (
                        <SelectItem key={slot} value={slot}>
                          {slot}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deliveryInstructions">Instructions de livraison (optionnel)</Label>
                <Textarea
                  id="deliveryInstructions"
                  value={formData.deliveryInstructions}
                  onChange={(e) =>
                    setFormData({ ...formData, deliveryInstructions: e.target.value })
                  }
                  placeholder="Indications spéciales, code d'accès, etc."
                  rows={2}
                />
              </div>
            </div>

            {/* Payment Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Paiement
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Méthode de paiement</Label>
                  <Select
                    value={formData.paymentMethod}
                    onValueChange={(value: FormData["paymentMethod"]) =>
                      setFormData({ ...formData, paymentMethod: value })
                    }
                  >
                    <SelectTrigger id="paymentMethod">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Espèces</SelectItem>
                      <SelectItem value="momo">Mobile Money</SelectItem>
                      <SelectItem value="bank_transfer">Virement bancaire</SelectItem>
                      <SelectItem value="card">Carte bancaire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentStatus">Statut du paiement</Label>
                  <Select
                    value={formData.paymentStatus}
                    onValueChange={(value: FormData["paymentStatus"]) =>
                      setFormData({ ...formData, paymentStatus: value })
                    }
                  >
                    <SelectTrigger id="paymentStatus">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="paid">Payé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount">Réduction (FCFA)</Label>
                <Input
                  id="discount"
                  type="number"
                  value={formData.discount}
                  onChange={(e) =>
                    setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="0"
                  min="0"
                  max={subtotal}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optionnel)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Notes internes sur la commande..."
                  rows={2}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 space-y-4">
              {/* Cart Summary */}
              <div>
                <h3 className="font-semibold text-sm mb-3">Produits</h3>
                {cart.map((item) => (
                  <div key={item.product._id} className="flex justify-between text-sm mb-2">
                    <span>
                      {item.quantity}x {item.product.name}
                    </span>
                    <span className="font-medium">
                      {formatCurrency(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Customer Info */}
              <div className="pt-4 border-t">
                <h3 className="font-semibold text-sm mb-3">Client</h3>
                <p className="text-sm">
                  <strong>{formData.customerName}</strong>
                </p>
                <p className="text-sm text-muted-foreground">{formData.customerPhone}</p>
                {formData.customerEmail && (
                  <p className="text-sm text-muted-foreground">{formData.customerEmail}</p>
                )}
              </div>

              {/* Delivery Info */}
              <div className="pt-4 border-t">
                <h3 className="font-semibold text-sm mb-3">Livraison</h3>
                <p className="text-sm capitalize">
                  {formData.deliveryType === "delivery" ? "Livraison à domicile" : "Retrait en magasin"}
                </p>
                {formData.deliveryType === "delivery" && formData.deliveryAddress && (
                  <p className="text-sm text-muted-foreground mt-1">{formData.deliveryAddress}</p>
                )}
                {formData.deliveryDate && (
                  <p className="text-sm text-muted-foreground">
                    {new Date(formData.deliveryDate).toLocaleDateString("fr-FR")}
                    {formData.deliveryTimeSlot && ` - ${formData.deliveryTimeSlot}`}
                  </p>
                )}
              </div>

              {/* Payment Summary */}
              <div className="pt-4 border-t space-y-2">
                <h3 className="font-semibold text-sm mb-3">Récapitulatif</h3>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sous-total</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Réduction</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                {deliveryFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Frais de livraison</span>
                    <span>{formatCurrency(deliveryFee)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-base pt-2 border-t">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between text-sm pt-2">
                  <span className="text-muted-foreground">Méthode de paiement</span>
                  <span className="capitalize">
                    {formData.paymentMethod === "momo"
                      ? "Mobile Money"
                      : formData.paymentMethod === "bank_transfer"
                      ? "Virement bancaire"
                      : formData.paymentMethod === "card"
                      ? "Carte bancaire"
                      : "Espèces"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Statut du paiement</span>
                  <span className={formData.paymentStatus === "paid" ? "text-green-600" : ""}>
                    {formData.paymentStatus === "paid" ? "Payé" : "En attente"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          {currentStep > 1 && (
            <Button variant="outline" onClick={handlePrevious} disabled={isSubmitting}>
              Précédent
            </Button>
          )}
          {currentStep < 3 ? (
            <Button onClick={handleNext}>Suivant</Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Création..." : "Créer la commande"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}