import axiosInstance from '../utils/axios.config';
import { Pack, ApiResponse, PaginationParams } from '../types/api.types';

interface PackQueryParams extends PaginationParams {
  category?: string;
  occasion?: string;
  theme?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  minBudget?: number;
  maxBudget?: number;
  sort?: string;
}

class PackService {
  private readonly baseUrl = '/packs';

  /**
   * Get all packs with filters and pagination
   */
  async getPacks(params?: PackQueryParams): Promise<ApiResponse<Pack[]>> {
    const response = await axiosInstance.get<ApiResponse<Pack[]>>(
      this.baseUrl,
      { params }
    );
    return response.data;
  }

  /**
   * Get single pack by ID or slug
   */
  async getPack(idOrSlug: string): Promise<ApiResponse<Pack>> {
    const response = await axiosInstance.get<ApiResponse<Pack>>(
      `${this.baseUrl}/${idOrSlug}`
    );
    return response.data;
  }

  /**
   * Create new pack (admin)
   */
  async createPack(data: Partial<Pack>): Promise<ApiResponse<Pack>> {
    const response = await axiosInstance.post<ApiResponse<Pack>>(
      this.baseUrl,
      data
    );
    return response.data;
  }

  /**
   * Update pack (admin)
   */
  async updatePack(id: string, data: Partial<Pack>): Promise<ApiResponse<Pack>> {
    const response = await axiosInstance.put<ApiResponse<Pack>>(
      `${this.baseUrl}/${id}`,
      data
    );
    return response.data;
  }

  /**
   * Delete pack (admin)
   */
  async deletePack(id: string): Promise<ApiResponse> {
    const response = await axiosInstance.delete<ApiResponse>(
      `${this.baseUrl}/${id}`
    );
    return response.data;
  }

  /**
   * Upload pack image (admin)
   */
  async uploadImage(
    id: string,
    imageFile: File,
    alt?: string,
    isPrimary = false
  ): Promise<ApiResponse<Pack>> {
    const formData = new FormData();
    formData.append('image', imageFile);
    if (alt) formData.append('alt', alt);
    formData.append('isPrimary', String(isPrimary));

    const response = await axiosInstance.post<ApiResponse<Pack>>(
      `${this.baseUrl}/${id}/images`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  /**
   * Search packs by budget
   */
  async searchByBudget(
    budget: number,
    occasion?: string,
    theme?: string
  ): Promise<ApiResponse<any>> {
    const response = await axiosInstance.get<ApiResponse<any>>(
      `${this.baseUrl}/search/by-budget`,
      { params: { budget, occasion, theme } }
    );
    return response.data;
  }

  /**
   * Get pack statistics (admin)
   */
  async getStatistics(): Promise<ApiResponse<any>> {
    const response = await axiosInstance.get<ApiResponse<any>>(
      `${this.baseUrl}/statistics`
    );
    return response.data;
  }
}

export const packService = new PackService();