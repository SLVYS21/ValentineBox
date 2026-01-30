// import { ShoppingCart, Check, Package } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { cn } from "@/lib/utils";

// const supplyHistory = [
//   {
//     id: 1,
//     supplier: "Fleurs d'Afrique Grossiste",
//     details: "100x Roses Rouges",
//     date: "01/02/2026",
//     cost: "-150 000 FCFA",
//     status: "received",
//     statusText: "Reçu en stock",
//   },
//   {
//     id: 2,
//     supplier: "ChocoDelice Import",
//     details: "50x Boîtes Cœur",
//     date: "10/02/2026",
//     cost: "-300 000 FCFA",
//     status: "pending",
//     statusText: "Confirmer Réception",
//   },
// ];

// export default function Sourcing() {
//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//       {/* New Supply Form */}
//       <div className="bg-card rounded-xl border border-border shadow-card p-6">
//         <div className="flex items-center gap-2 mb-6">
//           <ShoppingCart className="h-5 w-5 text-primary" />
//           <h2 className="font-semibold text-lg text-foreground font-sans">Nouveau Ravitaillement</h2>
//         </div>

//         <form className="space-y-4">
//           <div className="space-y-2">
//             <Label htmlFor="supplier" className="text-xs uppercase tracking-wider text-muted-foreground">
//               Fournisseur
//             </Label>
//             <Input id="supplier" placeholder="Ex: Grossiste Dakar" />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="details" className="text-xs uppercase tracking-wider text-muted-foreground">
//               Détails Commande
//             </Label>
//             <Textarea 
//               id="details" 
//               placeholder="Liste des produits..."
//               className="min-h-[100px] resize-y"
//             />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="cost" className="text-xs uppercase tracking-wider text-muted-foreground">
//               Coût Estimé (FCFA)
//             </Label>
//             <Input id="cost" type="number" placeholder="0" />
//           </div>

//           <Button className="w-full mt-2">
//             Lancer la commande
//           </Button>
//         </form>
//       </div>

//       {/* Supply History */}
//       <div className="bg-card rounded-xl border border-border shadow-card p-6">
//         <h2 className="font-semibold text-lg text-foreground mb-6 font-sans">Historique des Ravitaillements</h2>

//         <div className="space-y-4">
//           {supplyHistory.map((item) => (
//             <div
//               key={item.id}
//               className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors"
//             >
//               <div className={cn(
//                 "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
//                 item.status === "received" ? "bg-status-success-bg" : "bg-status-warning-bg"
//               )}>
//                 {item.status === "received" ? (
//                   <Check className="h-5 w-5 text-status-success" />
//                 ) : (
//                   <Package className="h-5 w-5 text-status-warning" />
//                 )}
//               </div>
              
//               <div className="flex-1 min-w-0">
//                 <p className="font-medium text-foreground">{item.supplier}</p>
//                 <p className="text-sm text-primary">{item.details}</p>
//                 <p className="text-xs text-muted-foreground mt-1">{item.date}</p>
//               </div>

//               <div className="text-right shrink-0">
//                 <p className="font-semibold text-foreground">{item.cost}</p>
//                 {item.status === "received" ? (
//                   <p className="text-xs text-status-success mt-1">{item.statusText}</p>
//                 ) : (
//                   <Button size="sm" className="text-xs h-7 mt-1">
//                     {item.statusText}
//                   </Button>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

import { useState, useEffect, useCallback } from "react";
import { 
  ShoppingCart, 
  Check, 
  Package, 
  Plus, 
  Trash2, 
  Calendar,
  DollarSign,
  Loader2,
  Search,
  Filter,
  MoreVertical,
  Edit,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { sourcingService } from "@/services/sourcing.service";
import { 
  Sourcing as SourcingType, 
  SourcingStatus,
  SourcingItem,
  Product 
} from "@/types/api.types";
import { useToast } from "@/hooks/use-toast";

interface SourcingFormData {
  supplier: {
    name: string;
    contact?: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  items: SourcingItem[];
  expectedDeliveryDate?: string;
  shippingCost: number;
  otherCosts: number;
  notes?: string;
}

const initialFormData: SourcingFormData = {
  supplier: {
    name: "",
    contact: "",
    phone: "",
    email: "",
  },
  items: [],
  shippingCost: 0,
  otherCosts: 0,
  notes: "",
};

const statusColors: Record<SourcingStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  ordered: "bg-status-info-bg text-status-info",
  partial: "bg-status-warning-bg text-status-warning",
  received: "bg-status-success-bg text-status-success",
  cancelled: "bg-status-error-bg text-status-error",
};

const statusLabels: Record<SourcingStatus, string> = {
  draft: "Brouillon",
  ordered: "Commandé",
  partial: "Partiel",
  received: "Reçu",
  cancelled: "Annulé",
};

export default function Sourcing() {
  const { toast } = useToast();
  const [sourcings, setSourcings] = useState<SourcingType[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isReceiveDialogOpen, setIsReceiveDialogOpen] = useState(false);
  const [selectedSourcing, setSelectedSourcing] = useState<SourcingType | null>(null);
  const [formData, setFormData] = useState<SourcingFormData>(initialFormData);
  const [currentItem, setCurrentItem] = useState({
    productName: "",
    quantity: 0,
    unitCost: 0,
  });
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<SourcingStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  // Fetch sourcings
  const fetchSourcings = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {};
      
      if (statusFilter !== "all") params.status = statusFilter;
      if (dateRange.start) params.startDate = dateRange.start;
      if (dateRange.end) params.endDate = dateRange.end;
      
      const response = await sourcingService.getSourcings(params);
      
      if (response.success && response.data) {
        let filtered = response.data;
        
        // Client-side search
        if (searchQuery) {
          filtered = filtered.filter(s => 
            s.supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.sourcingNumber.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        
        setSourcings(filtered);
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de charger les ravitaillements",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery, dateRange, toast]);

  useEffect(() => {
    fetchSourcings();
  }, [fetchSourcings]);

  // Add item to sourcing
  const addItem = () => {
    if (!currentItem.productName || currentItem.quantity <= 0 || currentItem.unitCost <= 0) {
      toast({
        title: "Validation",
        description: "Veuillez remplir tous les champs de l'article",
        variant: "destructive",
      });
      return;
    }

    const newItem: SourcingItem = {
      product: currentItem.productName, // In real scenario, this would be product ID
      name: currentItem.productName,
      quantity: currentItem.quantity,
      unitCost: currentItem.unitCost,
      totalCost: currentItem.quantity * currentItem.unitCost,
      receivedQuantity: 0,
    };

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem],
    }));

    setCurrentItem({ productName: "", quantity: 0, unitCost: 0 });
  };

  // Remove item from sourcing
  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  // Calculate total cost
  const calculateTotalCost = () => {
    const itemsTotal = formData.items.reduce((sum, item) => sum + item.totalCost, 0);
    return itemsTotal + formData.shippingCost + formData.otherCosts;
  };

  // Create sourcing
  const handleCreateSourcing = async () => {
    if (!formData.supplier.name) {
      toast({
        title: "Validation",
        description: "Le nom du fournisseur est requis",
        variant: "destructive",
      });
      return;
    }

    if (formData.items.length === 0) {
      toast({
        title: "Validation",
        description: "Veuillez ajouter au moins un article",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      
      const response = await sourcingService.createSourcing({
        supplier: formData.supplier,
        items: formData.items,
        expectedDeliveryDate: formData.expectedDeliveryDate ? new Date(formData.expectedDeliveryDate) : undefined,
        shippingCost: formData.shippingCost,
        otherCosts: formData.otherCosts,
        notes: formData.notes,
      });

      if (response.success) {
        toast({
          title: "Succès",
          description: "Ravitaillement créé avec succès",
        });
        setIsCreateDialogOpen(false);
        setFormData(initialFormData);
        fetchSourcings();
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer le ravitaillement",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Update sourcing status
  const handleUpdateStatus = async (id: string, status: SourcingStatus) => {
    try {
      const response = await sourcingService.updateStatus(id, { status });
      
      if (response.success) {
        toast({
          title: "Succès",
          description: "Statut mis à jour",
        });
        fetchSourcings();
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour le statut",
        variant: "destructive",
      });
    }
  };

  // Receive item
  const handleReceiveItem = async (sourcingId: string, itemId: string, receivedQty: number) => {
    try {
      const response = await sourcingService.receiveItem(sourcingId, itemId, receivedQty);
      
      if (response.success) {
        toast({
          title: "Succès",
          description: "Réception enregistrée",
        });
        setIsReceiveDialogOpen(false);
        fetchSourcings();
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'enregistrer la réception",
        variant: "destructive",
      });
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  // Format date
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sourcing</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gérez vos commandes fournisseurs et stocks
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nouveau Sourcing
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nouveau Sourcing</DialogTitle>
              <DialogDescription>
                Créer une nouvelle commande fournisseur
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Supplier Information */}
              <div className="space-y-4">
                <h3 className="font-medium text-sm text-foreground">Informations Fournisseur</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="supplierName">Nom *</Label>
                    <Input
                      id="supplierName"
                      placeholder="Ex: Fleurs d'Afrique"
                      value={formData.supplier.name}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        supplier: { ...prev.supplier, name: e.target.value }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supplierPhone">Téléphone</Label>
                    <Input
                      id="supplierPhone"
                      placeholder="+229 XX XX XX XX"
                      value={formData.supplier.phone}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        supplier: { ...prev.supplier, phone: e.target.value }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supplierEmail">Email</Label>
                    <Input
                      id="supplierEmail"
                      type="email"
                      placeholder="contact@fournisseur.com"
                      value={formData.supplier.email}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        supplier: { ...prev.supplier, email: e.target.value }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expectedDate">Date de livraison prévue</Label>
                    <Input
                      id="expectedDate"
                      type="date"
                      value={formData.expectedDeliveryDate}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        expectedDeliveryDate: e.target.value
                      }))}
                    />
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-4">
                <h3 className="font-medium text-sm text-foreground">Articles</h3>
                
                {/* Add Item Form */}
                <div className="grid grid-cols-12 gap-3 items-end p-4 bg-muted/30 rounded-lg">
                  <div className="col-span-5 space-y-2">
                    <Label htmlFor="itemName" className="text-xs">Produit</Label>
                    <Input
                      id="itemName"
                      placeholder="Nom du produit"
                      value={currentItem.productName}
                      onChange={(e) => setCurrentItem(prev => ({ ...prev, productName: e.target.value }))}
                    />
                  </div>
                  <div className="col-span-3 space-y-2">
                    <Label htmlFor="itemQty" className="text-xs">Quantité</Label>
                    <Input
                      id="itemQty"
                      type="number"
                      placeholder="0"
                      value={currentItem.quantity || ""}
                      onChange={(e) => setCurrentItem(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="col-span-3 space-y-2">
                    <Label htmlFor="itemCost" className="text-xs">Prix Unitaire</Label>
                    <Input
                      id="itemCost"
                      type="number"
                      placeholder="0"
                      value={currentItem.unitCost || ""}
                      onChange={(e) => setCurrentItem(prev => ({ ...prev, unitCost: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="col-span-1">
                    <Button type="button" size="icon" onClick={addItem}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Items List */}
                {formData.items.length > 0 && (
                  <div className="space-y-2">
                    {formData.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-card border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.quantity} × {formatCurrency(item.unitCost)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="font-semibold text-sm">{formatCurrency(item.totalCost)}</p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => removeItem(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Costs */}
              <div className="space-y-4">
                <h3 className="font-medium text-sm text-foreground">Frais Additionnels</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="shippingCost">Frais de livraison</Label>
                    <Input
                      id="shippingCost"
                      type="number"
                      placeholder="0"
                      value={formData.shippingCost || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, shippingCost: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="otherCosts">Autres frais</Label>
                    <Input
                      id="otherCosts"
                      type="number"
                      placeholder="0"
                      value={formData.otherCosts || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, otherCosts: Number(e.target.value) }))}
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Notes additionnelles..."
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>

              {/* Total */}
              {formData.items.length > 0 && (
                <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg">
                  <span className="font-medium">Coût Total</span>
                  <span className="text-xl font-bold text-primary">
                    {formatCurrency(calculateTotalCost())}
                  </span>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreateSourcing} disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enregistrer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher fournisseur, numéro..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        
        <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="draft">Brouillon</SelectItem>
            <SelectItem value="ordered">Commandé</SelectItem>
            <SelectItem value="partial">Partiel</SelectItem>
            <SelectItem value="received">Reçu</SelectItem>
            <SelectItem value="cancelled">Annulé</SelectItem>
          </SelectContent>
        </Select>

        <Input
          type="date"
          value={dateRange.start}
          onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
          className="w-[160px]"
        />
        <Input
          type="date"
          value={dateRange.end}
          onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
          className="w-[160px]"
        />
      </div>

      {/* Sourcing List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : sourcings.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-medium text-lg mb-2">Aucun produit sourcé</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Commencez par sourcer votre premier produit.
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Sourcer un produit
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {sourcings.map((sourcing) => (
            <div
              key={sourcing._id}
              className="bg-card rounded-xl border border-border shadow-card p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{sourcing.supplier.name}</h3>
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-full text-xs font-medium",
                      statusColors[sourcing.status]
                    )}>
                      {statusLabels[sourcing.status]}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="font-mono">{sourcing.sourcingNumber}</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(sourcing.orderDate)}
                    </span>
                    {sourcing.expectedDeliveryDate && (
                      <span className="flex items-center gap-1">
                        Livraison: {formatDate(sourcing.expectedDeliveryDate)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-foreground">
                      {formatCurrency(sourcing.finalCost)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {sourcing.items.length} article(s)
                    </p>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {sourcing.status === "draft" && (
                        <DropdownMenuItem onClick={() => handleUpdateStatus(sourcing._id, "ordered")}>
                          Marquer comme commandé
                        </DropdownMenuItem>
                      )}
                      {sourcing.status === "ordered" && (
                        <>
                          <DropdownMenuItem onClick={() => {
                            setSelectedSourcing(sourcing);
                            setIsReceiveDialogOpen(true);
                          }}>
                            Confirmer réception
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(sourcing._id, "partial")}>
                            Réception partielle
                          </DropdownMenuItem>
                        </>
                      )}
                      {sourcing.status !== "cancelled" && sourcing.status !== "received" && (
                        <DropdownMenuItem 
                          onClick={() => handleUpdateStatus(sourcing._id, "cancelled")}
                          className="text-destructive"
                        >
                          Annuler
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-2">
                {sourcing.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm p-2 rounded bg-muted/30">
                    <span className="font-medium">{typeof item.product === 'string' ? item.name : (item.product as Product).name}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">
                        {item.quantity} × {formatCurrency(item.unitCost)}
                      </span>
                      {item.receivedQuantity > 0 && (
                        <span className="text-status-success text-xs">
                          ({item.receivedQuantity} reçu)
                        </span>
                      )}
                      <span className="font-semibold">{formatCurrency(item.totalCost)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer info */}
              {(sourcing.shippingCost > 0 || sourcing.otherCosts > 0 || sourcing.notes) && (
                <div className="mt-4 pt-4 border-t border-border text-sm">
                  {sourcing.shippingCost > 0 && (
                    <p className="text-muted-foreground">
                      Frais de livraison: {formatCurrency(sourcing.shippingCost)}
                    </p>
                  )}
                  {sourcing.otherCosts > 0 && (
                    <p className="text-muted-foreground">
                      Autres frais: {formatCurrency(sourcing.otherCosts)}
                    </p>
                  )}
                  {sourcing.notes && (
                    <p className="text-muted-foreground mt-2">
                      <span className="font-medium">Note:</span> {sourcing.notes}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Receive Dialog */}
      {selectedSourcing && (
        <Dialog open={isReceiveDialogOpen} onOpenChange={setIsReceiveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmer Réception</DialogTitle>
              <DialogDescription>
                {selectedSourcing.supplier.name} - {selectedSourcing.sourcingNumber}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {selectedSourcing.items.map((item) => (
                <div key={item._id} className="space-y-2">
                  <Label>{typeof item.product === 'string' ? item.name : (item.product as Product).name}</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Quantité reçue"
                      max={item.quantity}
                      defaultValue={item.quantity}
                      id={`receive-${item._id}`}
                    />
                    <span className="text-sm text-muted-foreground">/ {item.quantity}</span>
                  </div>
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsReceiveDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={() => {
                // Handle receiving all items
                selectedSourcing.items.forEach(item => {
                  const input = document.getElementById(`receive-${item._id}`) as HTMLInputElement;
                  const receivedQty = Number(input?.value || item.quantity);
                  if (item._id) {
                    handleReceiveItem(selectedSourcing._id, item._id, receivedQty);
                  }
                });
              }}>
                Confirmer Réception
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}