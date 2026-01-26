import axiosInstance from '../utils/axios.config';
import { Order, OrderQueryParams, OrderItem, ApiResponse } from '../types/api.types';

interface CreateOrderData {
  items: Partial<OrderItem>[];
  customer: Order['customer'];
  delivery: Order['delivery'];
  payment: Partial<Order['payment']>;
  notes?: string;
  discount?: number;
}

interface UpdateOrderStatusData {
  status: Order['status'];
  notes?: string;
  updatedBy?: string;
}

interface UpdatePaymentStatusData {
  paymentStatus: Order['payment']['status'];
  transactionId?: string;
}

class OrderService {
  private readonly baseUrl = '/orders';

  /**
   * Get all orders with filters and pagination (admin)
   */
  async getOrders(params?: OrderQueryParams): Promise<ApiResponse<Order[]>> {
    const response = await axiosInstance.get<ApiResponse<Order[]>>(
      this.baseUrl,
      { params }
    );
    return response.data;
  }

  /**
   * Get single order by ID (admin)
   */
  async getOrder(id: string): Promise<ApiResponse<Order>> {
    const response = await axiosInstance.get<ApiResponse<Order>>(
      `${this.baseUrl}/${id}`
    );
    return response.data;
  }

  /**
   * Create new order (public)
   */
  async createOrder(data: CreateOrderData): Promise<ApiResponse<Order>> {
    const response = await axiosInstance.post<ApiResponse<Order>>(
      this.baseUrl,
      data
    );
    return response.data;
  }

  /**
   * Update order (admin)
   */
  async updateOrder(
    id: string,
    data: Partial<Order>
  ): Promise<ApiResponse<Order>> {
    const response = await axiosInstance.put<ApiResponse<Order>>(
      `${this.baseUrl}/${id}`,
      data
    );
    return response.data;
  }

  /**
   * Update order status (admin)
   */
  async updateOrderStatus(
    id: string,
    data: UpdateOrderStatusData
  ): Promise<ApiResponse<Order>> {
    const response = await axiosInstance.patch<ApiResponse<Order>>(
      `${this.baseUrl}/${id}/status`,
      data
    );
    return response.data;
  }

  /**
   * Update payment status (admin)
   */
  async updatePaymentStatus(
    id: string,
    data: UpdatePaymentStatusData
  ): Promise<ApiResponse<Order>> {
    const response = await axiosInstance.patch<ApiResponse<Order>>(
      `${this.baseUrl}/${id}/payment`,
      data
    );
    return response.data;
  }

  /**
   * Update order items (admin)
   */
  async updateOrderItems(
    id: string,
    items: Partial<OrderItem>[]
  ): Promise<ApiResponse<Order>> {
    const response = await axiosInstance.put<ApiResponse<Order>>(
      `${this.baseUrl}/${id}/items`,
      { items }
    );
    return response.data;
  }

  /**
   * Cancel order (admin)
   */
  async cancelOrder(
    id: string,
    reason?: string,
    cancelledBy?: string
  ): Promise<ApiResponse<Order>> {
    const response = await axiosInstance.delete<ApiResponse<Order>>(
      `${this.baseUrl}/${id}`,
      { data: { reason, cancelledBy } }
    );
    return response.data;
  }

  /**
   * Get order statistics (admin)
   */
  async getStatistics(
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<any[]>> {
    const response = await axiosInstance.get<ApiResponse<any[]>>(
      `${this.baseUrl}/statistics`,
      { params: { startDate, endDate } }
    );
    return response.data;
  }

  /**
   * Get today's orders (admin)
   */
  async getTodayOrders(): Promise<ApiResponse<Order[]>> {
    const response = await axiosInstance.get<ApiResponse<Order[]>>(
      `${this.baseUrl}/today`
    );
    return response.data;
  }
}

export const orderService = new OrderService();