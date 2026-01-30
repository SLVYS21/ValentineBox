import axiosInstance from "../utils/axios.config";
import {
  ApiResponse,
  Transaction,
  TransactionQueryParams,
} from "../types/api.types";

interface CreateTransactionData {
  type: Transaction["type"];
  category: Transaction["category"];
  amount: number;
  description: string;
  paymentMethod: Transaction["paymentMethod"];
  date?: Date;
  account?: Transaction["account"];
  notes?: string;
  performedBy?: string;
}

class TransactionService {
  private readonly baseUrl = "/transactions";

  async getTransactions(
    params?: TransactionQueryParams,
  ): Promise<ApiResponse<Transaction[]>> {
    const response = await axiosInstance.get<ApiResponse<Transaction[]>>(
      this.baseUrl,
      { params },
    );
    return response.data;
  }

  async getTransaction(id: string): Promise<ApiResponse<Transaction>> {
    const response = await axiosInstance.get<ApiResponse<Transaction>>(
      `${this.baseUrl}/${id}`,
    );
    return response.data;
  }

  async createTransaction(
    data: CreateTransactionData,
  ): Promise<ApiResponse<Transaction>> {
    const response = await axiosInstance.post<ApiResponse<Transaction>>(
      this.baseUrl,
      data,
    );
    return response.data;
  }

  async updateTransaction(
    id: string,
    data: Partial<Transaction>,
  ): Promise<ApiResponse<Transaction>> {
    const response = await axiosInstance.put<ApiResponse<Transaction>>(
      `${this.baseUrl}/${id}`,
      data,
    );
    return response.data;
  }

  async deleteTransaction(id: string): Promise<ApiResponse> {
    const response = await axiosInstance.delete<ApiResponse>(
      `${this.baseUrl}/${id}`,
    );
    return response.data;
  }

  async getAccountBalance(
    account?: string,
    endDate?: string,
  ): Promise<ApiResponse<any>> {
    const response = await axiosInstance.get<ApiResponse<any>>(
      `${this.baseUrl}/balance/${account || "all"}`,
      { params: { endDate } },
    );
    return response.data;
  }

  async getCategoryStatistics(
    startDate?: string,
    endDate?: string,
    type?: "income" | "expense",
  ): Promise<ApiResponse<any[]>> {
    const response = await axiosInstance.get<ApiResponse<any[]>>(
      `${this.baseUrl}/statistics/category`,
      { params: { startDate, endDate, type } },
    );
    return response.data;
  }

  async getMonthlyStatistics(year: number): Promise<ApiResponse<any[]>> {
    const response = await axiosInstance.get<ApiResponse<any[]>>(
      `${this.baseUrl}/statistics/monthly/${year}`,
    );
    return response.data;
  }

  async getFinancialDashboard(
    startDate?: string,
    endDate?: string,
  ): Promise<ApiResponse<any>> {
    const response = await axiosInstance.get<ApiResponse<any>>(
      `${this.baseUrl}/dashboard`,
      { params: { startDate, endDate } },
    );
    return response.data;
  }
}

export const transactionService = new TransactionService();
