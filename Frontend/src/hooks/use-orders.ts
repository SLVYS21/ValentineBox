import { useState, useCallback, useRef, useEffect } from "react";
import { orderService } from "@/services/order.service";
import { Order, OrderStatus, OrderQueryParams } from "@/types/api.types";
import { useToast } from "@/hooks/use-toast";

interface UseOrdersReturn {
  orders: Order[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  totalOrders: number;
  currentPage: number;
  fetchOrders: () => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus, notes?: string) => Promise<boolean>;
  updatePaymentStatus: (orderId: string, status: Order["payment"]["status"]) => Promise<boolean>;
  getOrderById: (orderId: string) => Promise<Order | null>;
  cancelOrder: (orderId: string, reason?: string) => Promise<boolean>;
  refreshOrder: (orderId: string) => Promise<void>;
}

interface UseOrdersOptions {
  initialFilters?: OrderQueryParams;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useOrders(options: UseOrdersOptions = {}): UseOrdersReturn {
  const { initialFilters = { page: 1, limit: 10 }, autoRefresh = false, refreshInterval = 30000 } = options;
  const { toast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<OrderQueryParams>(initialFilters);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const response = await orderService.getOrders(filters);

      if (response.success && response.data) {
        setOrders(response.data);
        setTotalPages(response.totalPages || response.pages || 1);
        setTotalOrders(response.total || response.count || 0);
      } else {
        throw new Error(response.message || "Failed to fetch orders");
      }
    } catch (err: any) {
      if (err.name === "AbortError") return; // Ignore aborted requests
      
      const errorMessage = err?.response?.data?.message || err.message || "Failed to fetch orders";
      setError(errorMessage);
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [filters, toast]);

  // Update order status with optimistic update
  const updateOrderStatus = useCallback(
    async (orderId: string, status: OrderStatus, notes?: string): Promise<boolean> => {
      const previousOrders = [...orders];
      
      // Optimistic update
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status } : order
        )
      );

      try {
        const response = await orderService.updateOrderStatus(orderId, {
          status,
          notes,
          updatedBy: "Admin",
        });

        if (response.success) {
          toast({
            title: "Succès",
            description: "Statut mis à jour avec succès",
          });
          
          // Refresh to get the complete updated order
          await refreshOrder(orderId);
          return true;
        } else {
          throw new Error(response.message || "Update failed");
        }
      } catch (err: any) {
        // Rollback on error
        setOrders(previousOrders);
        
        toast({
          title: "Erreur",
          description: err?.response?.data?.message || "Impossible de mettre à jour le statut",
          variant: "destructive",
        });
        return false;
      }
    },
    [orders, toast]
  );

  // Update payment status
  const updatePaymentStatus = useCallback(
    async (orderId: string, paymentStatus: Order["payment"]["status"]): Promise<boolean> => {
      try {
        const response = await orderService.updatePaymentStatus(orderId, {
          paymentStatus,
        });

        if (response.success) {
          toast({
            title: "Succès",
            description: "Statut de paiement mis à jour",
          });
          
          await refreshOrder(orderId);
          return true;
        } else {
          throw new Error(response.message || "Update failed");
        }
      } catch (err: any) {
        toast({
          title: "Erreur",
          description: err?.response?.data?.message || "Impossible de mettre à jour le paiement",
          variant: "destructive",
        });
        return false;
      }
    },
    [toast]
  );

  // Get order by ID
  const getOrderById = useCallback(async (orderId: string): Promise<Order | null> => {
    try {
      const response = await orderService.getOrder(orderId);
      if (response.success && response.data) {
        return response.data;
      }
      return null;
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err?.response?.data?.message || "Impossible de charger la commande",
        variant: "destructive",
      });
      return null;
    }
  }, [toast]);

  // Cancel order
  const cancelOrder = useCallback(
    async (orderId: string, reason?: string): Promise<boolean> => {
      try {
        const response = await orderService.cancelOrder(orderId, reason, "Admin");

        if (response.success) {
          toast({
            title: "Succès",
            description: "Commande annulée",
          });
          
          await fetchOrders();
          return true;
        } else {
          throw new Error(response.message || "Cancellation failed");
        }
      } catch (err: any) {
        toast({
          title: "Erreur",
          description: err?.response?.data?.message || "Impossible d'annuler la commande",
          variant: "destructive",
        });
        return false;
      }
    },
    [toast, fetchOrders]
  );

  // Refresh single order
  const refreshOrder = useCallback(async (orderId: string) => {
    try {
      const response = await orderService.getOrder(orderId);
      if (response.success && response.data) {
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId ? response.data! : order
          )
        );
      }
    } catch (err) {
      // Silent fail for refresh
      console.error("Failed to refresh order:", err);
    }
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh) {
      refreshIntervalRef.current = setInterval(fetchOrders, refreshInterval);
      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval, fetchOrders]);

  // Initial fetch
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  return {
    orders,
    loading,
    error,
    totalPages,
    totalOrders,
    currentPage: filters.page || 1,
    fetchOrders,
    updateOrderStatus,
    updatePaymentStatus,
    getOrderById,
    cancelOrder,
    refreshOrder,
  };
}