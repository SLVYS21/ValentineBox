// import { Eye } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { StatusBadge } from "@/components/dashboard/StatusBadge";
// import { cn } from "@/lib/utils";

// type OrderStatus = "delivered" | "validated" | "pending" | "in_progress" | "completed";

// const orders = [
//   {
//     id: "CMD-2825-001",
//     client: "Moussa Diop",
//     products: "1x Bouquet Royal 50 Roses, 1x Coffret Chocolats Cœur",
//     total: "50 000 FCFA",
//     date: "10/02/2026",
//     status: "delivered" as OrderStatus,
//   },
//   {
//     id: "CMD-2825-002",
//     client: "Amina Sow",
//     products: "1x Ours Géant 1m50",
//     total: "40 000 FCFA",
//     date: "09/02/2026",
//     status: "completed" as OrderStatus,
//   },
//   {
//     id: "CMD-2825-003",
//     client: "Jean Kouassi",
//     products: "2x Parfum 'Amour Éternel'",
//     total: "50 000 FCFA",
//     date: "08/02/2026",
//     status: "delivered" as OrderStatus,
//   },
//   {
//     id: "CMD-2825-004",
//     client: "Fatou Ndiaye",
//     products: "1x Pack Duo Montres",
//     total: "55 000 FCFA",
//     date: "11/02/2026",
//     status: "in_progress" as OrderStatus,
//   },
// ];

// const filters = [
//   { label: "Tout", value: "all" },
//   { label: "En attente", value: "pending" },
//   { label: "Livrées", value: "delivered" },
// ];

// export default function Orders() {
//   return (
//     <div className="space-y-6">
//       <div className="bg-card rounded-xl border border-border shadow-card">
//         <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border">
//           <h2 className="font-semibold text-lg text-foreground font-sans">Toutes les Commandes</h2>
//           <div className="flex gap-2">
//             {filters.map((filter) => (
//               <Button
//                 key={filter.value}
//                 variant={filter.value === "all" ? "secondary" : "ghost"}
//                 size="sm"
//                 className="text-xs"
//               >
//                 {filter.label}
//               </Button>
//             ))}
//           </div>
//         </div>

//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead>
//               <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider bg-muted/30">
//                 <th className="px-5 py-3 font-medium">Commande</th>
//                 <th className="px-5 py-3 font-medium">Produits</th>
//                 <th className="px-5 py-3 font-medium">Total</th>
//                 <th className="px-5 py-3 font-medium">Date</th>
//                 <th className="px-5 py-3 font-medium">Statut</th>
//                 <th className="px-5 py-3 font-medium">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-border">
//               {orders.map((order) => (
//                 <tr key={order.id} className="hover:bg-muted/50 transition-colors">
//                   <td className="px-5 py-4">
//                     <div>
//                       <p className="text-sm font-medium text-foreground">{order.client}</p>
//                       <p className="text-xs text-primary">{order.id}</p>
//                     </div>
//                   </td>
//                   <td className="px-5 py-4 text-sm text-primary max-w-xs truncate">
//                     {order.products}
//                   </td>
//                   <td className="px-5 py-4 text-sm font-semibold text-foreground">
//                     {order.total}
//                   </td>
//                   <td className="px-5 py-4 text-sm text-muted-foreground">
//                     {order.date}
//                   </td>
//                   <td className="px-5 py-4">
//                     <StatusBadge status={order.status} />
//                   </td>
//                   <td className="px-5 py-4">
//                     <div className="flex items-center gap-2">
//                       {order.status === "in_progress" && (
//                         <Button size="sm" className="text-xs h-7">
//                           Livrer
//                         </Button>
//                       )}
//                       <Button variant="ghost" size="icon" className="h-8 w-8">
//                         <Eye className="h-4 w-4" />
//                       </Button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useState, useEffect, useCallback } from "react";
import {
  Eye,
  Search,
  RefreshCw,
  X,
  Calendar,
  User,
  Package,
  CreditCard,
  Truck,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
// import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { cn } from "@/lib/utils";
import { orderService } from "@/services/order.service";
import {
  Order,
  OrderStatus,
  OrderQueryParams,
  Product,
} from "@/types/api.types";
import { OrderCreateDialog } from "@/components/dashboard/Ordercreatedialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { productService } from "@/services/product.service";

// Filter configuration
const statusFilters: { label: string; value: OrderStatus | "all" }[] = [
  { label: "Tout", value: "all" },
  { label: "En attente", value: "pending" },
  { label: "Confirmée", value: "confirmed" },
  { label: "En traitement", value: "processing" },
  { label: "Prête", value: "ready" },
  { label: "En livraison", value: "out_for_delivery" },
  { label: "Livrée", value: "delivered" },
  { label: "Annulée", value: "cancelled" },
];

const statusUpdateOptions: { label: string; value: OrderStatus }[] = [
  { label: "Confirmée", value: "confirmed" },
  { label: "En traitement", value: "processing" },
  { label: "Prête", value: "ready" },
  { label: "En livraison", value: "out_for_delivery" },
  { label: "Livrée", value: "delivered" },
];

type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
type Status = OrderStatus | PaymentStatus;

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusConfig: Record<Status, { label: string; className: string }> = {
  // Order statuses
  pending: {
    label: "En attente",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  confirmed: {
    label: "Confirmée",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  processing: {
    label: "En traitement",
    className: "bg-purple-100 text-purple-800 border-purple-200",
  },
  ready: {
    label: "Prête",
    className: "bg-indigo-100 text-indigo-800 border-indigo-200",
  },
  out_for_delivery: {
    label: "En livraison",
    className: "bg-cyan-100 text-cyan-800 border-cyan-200",
  },
  delivered: {
    label: "Livrée",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  cancelled: {
    label: "Annulée",
    className: "bg-red-100 text-red-800 border-red-200",
  },
  refunded: {
    label: "Remboursée",
    className: "bg-orange-100 text-orange-800 border-orange-200",
  },
  // Payment statuses
  paid: {
    label: "Payé",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  failed: {
    label: "Échoué",
    className: "bg-red-100 text-red-800 border-red-200",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    className: "bg-gray-100 text-gray-800 border-gray-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  );
}

export default function Orders() {
  const { toast } = useToast();

  // State management
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Filter and pagination state
  const [filters, setFilters] = useState<OrderQueryParams>({
    page: 1,
    limit: 10,
    status: undefined,
    search: "",
  });
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [searchInput, setSearchInput] = useState("");

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params: OrderQueryParams = {
        ...filters,
        search: filters.search || undefined,
      };

      const response = await orderService.getOrders(params);

      if (response.success && response.data) {
        setOrders(response.data);
        setTotalPages(response.totalPages || response.pages || 1);
        setTotalOrders(response.total || response.count || 0);
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description:
          error?.response?.data?.message ||
          "Impossible de charger les commandes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [filters, toast]);

  const fetchAllProducts = async () => {
      try {
        const response = await productService.getProducts({ limit: 1000 });
        if (response.success && response.data) {
          setProducts(response.data);
        }
      } catch (err) {
        console.error("Error fetching all products:", err);
      }
    };

  // Initial load and when filters change
  useEffect(() => {
    fetchOrders();
    fetchAllProducts();
  }, [fetchOrders]);

  // Handle filter change
  const handleStatusFilter = (status: OrderStatus | "all") => {
    setFilters((prev) => ({
      ...prev,
      status: status === "all" ? undefined : status,
      page: 1,
    }));
  };

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        search: searchInput,
        page: 1,
      }));
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // View order details
  const handleViewOrder = async (orderId: string) => {
    try {
      const response = await orderService.getOrder(orderId);
      if (response.success && response.data) {
        setSelectedOrder(response.data);
        setIsDetailOpen(true);
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description:
          error?.response?.data?.message || "Impossible de charger les détails",
        variant: "destructive",
      });
    }
  };

  // Update order status
  const handleUpdateStatus = async (
    orderId: string,
    newStatus: OrderStatus,
  ) => {
    setIsUpdating(true);
    try {
      const response = await orderService.updateOrderStatus(orderId, {
        status: newStatus,
        updatedBy: "Admin", // You should get this from auth context
      });

      if (response.success) {
        toast({
          title: "Succès",
          description: "Statut mis à jour avec succès",
        });

        // Update the order in the list
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId ? { ...order, status: newStatus } : order,
          ),
        );

        // Update selected order if open
        if (selectedOrder?._id === orderId) {
          setSelectedOrder((prev) =>
            prev ? { ...prev, status: newStatus } : null,
          );
        }
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description:
          error?.response?.data?.message ||
          "Impossible de mettre à jour le statut",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Update payment status
  const handleUpdatePaymentStatus = async (
    orderId: string,
    paymentStatus: Order["payment"]["status"],
  ) => {
    setIsUpdating(true);
    try {
      const response = await orderService.updatePaymentStatus(orderId, {
        paymentStatus,
      });

      if (response.success) {
        toast({
          title: "Succès",
          description: "Statut de paiement mis à jour",
        });

        // Refresh the selected order
        if (selectedOrder) {
          const updatedOrder = await orderService.getOrder(orderId);
          if (updatedOrder.success && updatedOrder.data) {
            setSelectedOrder(updatedOrder.data);
          }
        }

        // Refresh the list
        fetchOrders();
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description:
          error?.response?.data?.message ||
          "Impossible de mettre à jour le paiement",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle order creation success
  const handleOrderCreated = (newOrder: Order) => {
    fetchOrders(); // Refresh the list
    toast({
      title: "Succès",
      description: `Commande ${newOrder.orderNumber} créée`,
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (date: Date | string) => {
    return format(new Date(date), "dd/MM/yyyy", { locale: fr });
  };

  // Get next logical status
  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    const statusFlow: OrderStatus[] = [
      "pending",
      "confirmed",
      "processing",
      "ready",
      "out_for_delivery",
      "delivered",
    ];
    const currentIndex = statusFlow.indexOf(currentStatus);
    if (currentIndex >= 0 && currentIndex < statusFlow.length - 1) {
      return statusFlow[currentIndex + 1];
    }
    return null;
  };

  const getNextStatusLabel = (status: OrderStatus | null): string => {
    const labels: Record<OrderStatus, string> = {
      pending: "En attente",
      confirmed: "Confirmer",
      processing: "En traitement",
      ready: "Marquer prête",
      out_for_delivery: "En livraison",
      delivered: "Marquer livrée",
      cancelled: "Annulée",
      refunded: "Remboursée",
    };
    return status ? labels[status] : "";
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl border border-border shadow-card">
        {/* Header with filters and search */}
        <div className="p-5 space-y-4 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-semibold text-lg text-foreground font-sans">
                Toutes les Commandes
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {totalOrders} commande{totalOrders > 1 ? "s" : ""} au total
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Nouvelle commande
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchOrders}
                disabled={loading}
                className="gap-2"
              >
                <RefreshCw
                  className={cn("h-4 w-4", loading && "animate-spin")}
                />
                Actualiser
              </Button>
            </div>
          </div>

          {/* Search and filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par numéro, client, téléphone..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9"
              />
              {searchInput && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setSearchInput("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
              {statusFilters.map((filter) => (
                <Button
                  key={filter.value}
                  variant={
                    filters.status === filter.value ||
                    (filter.value === "all" && !filters.status)
                      ? "secondary"
                      : "ghost"
                  }
                  size="sm"
                  className="text-xs whitespace-nowrap"
                  onClick={() => handleStatusFilter(filter.value)}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {filters.search || filters.status
                  ? "Aucune commande trouvée"
                  : "Aucune commande pour le moment"}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider bg-muted/30">
                  <th className="px-5 py-3 font-medium">Commande</th>
                  <th className="px-5 py-3 font-medium">Produits</th>
                  <th className="px-5 py-3 font-medium">Total</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Statut</th>
                  <th className="px-5 py-3 font-medium">Paiement</th>
                  <th className="px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((order) => {
                  const nextStatus = getNextStatus(order.status);

                  return (
                    <tr
                      key={order._id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {order.customer.name}
                          </p>
                          <p className="text-xs text-primary">
                            {order.orderNumber}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {order.customer.phone}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-sm text-muted-foreground max-w-xs">
                          {order.items.slice(0, 2).map((item, idx) => (
                            <div key={idx} className="truncate">
                              {item.quantity}x {item.name}
                            </div>
                          ))}
                          {order.items.length > 2 && (
                            <div className="text-xs text-primary">
                              +{order.items.length - 2} autre(s)
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {formatCurrency(order.finalAmount)}
                          </p>
                          {order.discount > 0 && (
                            <p className="text-xs text-muted-foreground line-through">
                              {formatCurrency(order.totalAmount)}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={order.payment.status} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {nextStatus &&
                            order.status !== "delivered" &&
                            order.status !== "cancelled" && (
                              <Button
                                size="sm"
                                className="text-xs h-7"
                                onClick={() =>
                                  handleUpdateStatus(order._id, nextStatus)
                                }
                                disabled={isUpdating}
                              >
                                {getNextStatusLabel(nextStatus)}
                              </Button>
                            )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleViewOrder(order._id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="px-5 py-4 border-t border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {filters.page} sur {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    page: (prev.page || 1) - 1,
                  }))
                }
                disabled={filters.page === 1}
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    page: (prev.page || 1) + 1,
                  }))
                }
                disabled={filters.page === totalPages}
              >
                Suivant
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Order Create Dialog */}
      <OrderCreateDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={handleOrderCreated}
        products={products}
      />

      {/* Order Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de la commande</DialogTitle>
            <DialogDescription>{selectedOrder?.orderNumber}</DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6 mt-4">
              {/* Customer Info */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Informations client
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Nom</p>
                    <p className="font-medium">{selectedOrder.customer.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Téléphone</p>
                    <p className="font-medium">
                      {selectedOrder.customer.phone}
                    </p>
                  </div>
                  {selectedOrder.customer.email && (
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Email</p>
                      <p className="font-medium">
                        {selectedOrder.customer.email}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Delivery Info */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Livraison
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Type</p>
                    <p className="font-medium capitalize">
                      {selectedOrder.delivery.type === "delivery"
                        ? "Livraison"
                        : "Retrait"}
                    </p>
                  </div>
                  {selectedOrder.delivery.address && (
                    <div>
                      <p className="text-muted-foreground">Adresse</p>
                      <p className="font-medium">
                        {selectedOrder.delivery.address}
                      </p>
                    </div>
                  )}
                  {selectedOrder.delivery.date && (
                    <div>
                      <p className="text-muted-foreground">Date prévue</p>
                      <p className="font-medium">
                        {formatDate(selectedOrder.delivery.date)}
                        {selectedOrder.delivery.timeSlot &&
                          ` - ${selectedOrder.delivery.timeSlot}`}
                      </p>
                    </div>
                  )}
                  {selectedOrder.delivery.instructions && (
                    <div>
                      <p className="text-muted-foreground">Instructions</p>
                      <p className="font-medium">
                        {selectedOrder.delivery.instructions}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Articles
                </h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-start text-sm bg-background rounded p-3"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-muted-foreground text-xs">
                          Quantité: {item.quantity} ×{" "}
                          {formatCurrency(item.price)}
                        </p>
                      </div>
                      <p className="font-semibold">
                        {formatCurrency(item.subtotal)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment and Total */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Paiement
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Méthode</span>
                    <span className="font-medium capitalize">
                      {selectedOrder.payment.method === "momo"
                        ? "Mobile Money"
                        : selectedOrder.payment.method === "bank_transfer"
                          ? "Virement bancaire"
                          : selectedOrder.payment.method === "card"
                            ? "Carte bancaire"
                            : "Espèces"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Statut</span>
                    <Select
                      value={selectedOrder.payment.status}
                      onValueChange={(value) =>
                        handleUpdatePaymentStatus(
                          selectedOrder._id,
                          value as Order["payment"]["status"],
                        )
                      }
                      disabled={isUpdating}
                    >
                      <SelectTrigger className="w-32 h-7">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">En attente</SelectItem>
                        <SelectItem value="paid">Payé</SelectItem>
                        <SelectItem value="failed">Échoué</SelectItem>
                        <SelectItem value="refunded">Remboursé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="pt-2 border-t border-border space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sous-total</span>
                      <span>{formatCurrency(selectedOrder.totalAmount)}</span>
                    </div>
                    {selectedOrder.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Réduction</span>
                        <span>-{formatCurrency(selectedOrder.discount)}</span>
                      </div>
                    )}
                    {selectedOrder.delivery.fee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Frais de livraison
                        </span>
                        <span>
                          {formatCurrency(selectedOrder.delivery.fee)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold text-base pt-2 border-t border-border">
                      <span>Total</span>
                      <span>{formatCurrency(selectedOrder.finalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Update */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-sm">Statut de la commande</h3>
                <div className="flex items-center gap-3">
                  <Select
                    value={selectedOrder.status}
                    onValueChange={(value) =>
                      handleUpdateStatus(
                        selectedOrder._id,
                        value as OrderStatus,
                      )
                    }
                    disabled={isUpdating}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusUpdateOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <h3 className="font-semibold text-sm">Notes</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedOrder.notes}
                  </p>
                </div>
              )}

              {/* Status History */}
              {selectedOrder.statusHistory &&
                selectedOrder.statusHistory.length > 0 && (
                  <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Historique
                    </h3>
                    <div className="space-y-2">
                      {selectedOrder.statusHistory
                        .slice()
                        .reverse()
                        .map((history, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-start text-sm bg-background rounded p-2"
                          >
                            <div>
                              <p className="font-medium capitalize">
                                {history.status}
                              </p>
                              {history.notes && (
                                <p className="text-xs text-muted-foreground">
                                  {history.notes}
                                </p>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(history.timestamp)}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
