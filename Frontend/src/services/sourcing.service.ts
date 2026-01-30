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