import axiosInstance from '../utils/axios.config';
import {
  Sourcing,
  SourcingQueryParams,
  SourcingItem,
  ApiResponse,
} from '../types/api.types';

interface CreateSourcingData {
  items: Partial<SourcingItem>[];
  supplier: Sourcing['supplier'];
  expectedDeliveryDate?: Date;
  shippingCost?: number;
  otherCosts?: number;
  notes?: string;
  createdBy?: string;
}

interface UpdateSourcingStatusData {
  status: Sourcing['status'];
  notes?: string;
  updatedBy?: string;
}

class SourcingService {
  private readonly baseUrl = '/sourcing';

  async getSourcings(params?: SourcingQueryParams): Promise<ApiResponse<Sourcing[]>> {
    const response = await axiosInstance.get<ApiResponse<Sourcing[]>>(
      this.baseUrl,
      { params }
    );
    return response.data;
  }

  async getSourcing(id: string): Promise<ApiResponse<Sourcing>> {
    const response = await axiosInstance.get<ApiResponse<Sourcing>>(
      `${this.baseUrl}/${id}`
    );
    return response.data;
  }

  async createSourcing(data: CreateSourcingData): Promise<ApiResponse<Sourcing>> {
    const response = await axiosInstance.post<ApiResponse<Sourcing>>(
      this.baseUrl,
      data
    );
    return response.data;
  }

  async updateSourcing(
    id: string,
    data: Partial<Sourcing>
  ): Promise<ApiResponse<Sourcing>> {
    const response = await axiosInstance.put<ApiResponse<Sourcing>>(
      `${this.baseUrl}/${id}`,
      data
    );
    return response.data;
  }

  async updateStatus(
    id: string,
    data: UpdateSourcingStatusData
  ): Promise<ApiResponse<Sourcing>> {
    const response = await axiosInstance.patch<ApiResponse<Sourcing>>(
      `${this.baseUrl}/${id}/status`,
      data
    );
    return response.data;
  }

  async receiveItem(
    id: string,
    itemId: string,
    receivedQuantity: number
  ): Promise<ApiResponse<Sourcing>> {
    const response = await axiosInstance.patch<ApiResponse<Sourcing>>(
      `${this.baseUrl}/${id}/items/${itemId}/receive`,
      { receivedQuantity }
    );
    return response.data;
  }

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
}

export const sourcingService = new SourcingService();

// src/services/transaction.service.ts
import {
  Transaction,
  TransactionQueryParams,
} from '../types/api.types';

interface CreateTransactionData {
  type: Transaction['type'];
  category: Transaction['category'];
  amount: number;
  description: string;
  paymentMethod: Transaction['paymentMethod'];
  date?: Date;
  account?: Transaction['account'];
  notes?: string;
  performedBy?: string;
}

class TransactionService {
  private readonly baseUrl = '/transactions';

  async getTransactions(
    params?: TransactionQueryParams
  ): Promise<ApiResponse<Transaction[]>> {
    const response = await axiosInstance.get<ApiResponse<Transaction[]>>(
      this.baseUrl,
      { params }
    );
    return response.data;
  }

  async getTransaction(id: string): Promise<ApiResponse<Transaction>> {
    const response = await axiosInstance.get<ApiResponse<Transaction>>(
      `${this.baseUrl}/${id}`
    );
    return response.data;
  }

  async createTransaction(
    data: CreateTransactionData
  ): Promise<ApiResponse<Transaction>> {
    const response = await axiosInstance.post<ApiResponse<Transaction>>(
      this.baseUrl,
      data
    );
    return response.data;
  }

  async updateTransaction(
    id: string,
    data: Partial<Transaction>
  ): Promise<ApiResponse<Transaction>> {
    const response = await axiosInstance.put<ApiResponse<Transaction>>(
      `${this.baseUrl}/${id}`,
      data
    );
    return response.data;
  }

  async deleteTransaction(id: string): Promise<ApiResponse> {
    const response = await axiosInstance.delete<ApiResponse>(
      `${this.baseUrl}/${id}`
    );
    return response.data;
  }

  async getAccountBalance(
    account?: string,
    endDate?: string
  ): Promise<ApiResponse<any>> {
    const response = await axiosInstance.get<ApiResponse<any>>(
      `${this.baseUrl}/balance/${account || 'all'}`,
      { params: { endDate } }
    );
    return response.data;
  }

  async getCategoryStatistics(
    startDate?: string,
    endDate?: string,
    type?: 'income' | 'expense'
  ): Promise<ApiResponse<any[]>> {
    const response = await axiosInstance.get<ApiResponse<any[]>>(
      `${this.baseUrl}/statistics/category`,
      { params: { startDate, endDate, type } }
    );
    return response.data;
  }

  async getMonthlyStatistics(year: number): Promise<ApiResponse<any[]>> {
    const response = await axiosInstance.get<ApiResponse<any[]>>(
      `${this.baseUrl}/statistics/monthly/${year}`
    );
    return response.data;
  }

  async getFinancialDashboard(
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<any>> {
    const response = await axiosInstance.get<ApiResponse<any>>(
      `${this.baseUrl}/dashboard`,
      { params: { startDate, endDate } }
    );
    return response.data;
  }
}

export const transactionService = new TransactionService();