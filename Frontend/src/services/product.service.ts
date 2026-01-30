import axiosInstance from '../utils/axios.config';
import { Product, ProductQueryParams, ApiResponse, CreateProductDTO } from '../types/api.types';

class ProductService {
  private readonly baseUrl = '/products';

  /**
   * Get all products with filters and pagination
   */
  async getProducts(params?: ProductQueryParams): Promise<ApiResponse<Product[]>> {
    const response = await axiosInstance.get<ApiResponse<Product[]>>(
      this.baseUrl,
      { params }
    );
    return response.data;
  }

  /**
   * Get single product by ID
   */
  async getProduct(id: string): Promise<ApiResponse<Product>> {
    const response = await axiosInstance.get<ApiResponse<Product>>(
      `${this.baseUrl}/${id}`
    );
    return response.data;
  }

  /**
   * Create new product (admin)
   */
  // async createProduct(data: Partial<Product>): Promise<ApiResponse<Product>> {
  //   const response = await axiosInstance.post<ApiResponse<Product>>(
  //     this.baseUrl,
  //     data
  //   );
  //   return response.data;
  // }

  async createProduct(
  data: CreateProductDTO
): Promise<ApiResponse<Product>> {
  const response = await axiosInstance.post<ApiResponse<Product>>(
    this.baseUrl,
    data
  );
  return response.data;
}


  /**
   * Update product (admin)
   */
  async updateProduct(
    id: string,
    data: Partial<Product>
  ): Promise<ApiResponse<Product>> {
    const response = await axiosInstance.put<ApiResponse<Product>>(
      `${this.baseUrl}/${id}`,
      data
    );
    return response.data;
  }

  /**
   * Delete product (admin)
   */
  async deleteProduct(id: string): Promise<ApiResponse> {
    const response = await axiosInstance.delete<ApiResponse>(
      `${this.baseUrl}/${id}`
    );
    return response.data;
  }

  /**
   * Upload product image (admin)
   */
  async uploadImage(id: string, imageFile: File, isPrimary = false): Promise<ApiResponse<Product>> {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('is_primary', String(isPrimary));

    const response = await axiosInstance.post<ApiResponse<Product>>(
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
   * Delete product image (admin)
   */
  async deleteImage(productId: string, imageId: string): Promise<ApiResponse<Product>> {
    const response = await axiosInstance.delete<ApiResponse<Product>>(
      `${this.baseUrl}/${productId}/images/${imageId}`
    );
    return response.data;
  }

  /**
   * Adjust stock (admin)
   */
  async adjustStock(
    id: string,
    quantity: number,
    reason: string,
    performedBy?: string
  ): Promise<ApiResponse<Product>> {
    const response = await axiosInstance.post<ApiResponse<Product>>(
      `${this.baseUrl}/${id}/stock/adjust`,
      { quantity, reason, performedBy }
    );
    return response.data;
  }

  /**
   * Get stock history (admin)
   */
  async getStockHistory(id: string, limit = 50): Promise<ApiResponse<any[]>> {
    const response = await axiosInstance.get<ApiResponse<any[]>>(
      `${this.baseUrl}/${id}/stock/history`,
      { params: { limit } }
    );
    return response.data;
  }

  /**
   * Get stock statistics (admin)
   */
  async getStockStatistics(
    id: string,
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<any>> {
    const response = await axiosInstance.get<ApiResponse<any>>(
      `${this.baseUrl}/${id}/stock/statistics`,
      { params: { startDate, endDate } }
    );
    return response.data;
  }

  /**
   * Get stock alerts (admin)
   */
  async getStockAlerts(): Promise<ApiResponse<Product[]>> {
    const response = await axiosInstance.get<ApiResponse<Product[]>>(
      `${this.baseUrl}/stock/alerts`
    );
    return response.data;
  }

  /**
   * Search products by budget
   */
  async searchByBudget(
    budget: number,
    category?: string,
    tags?: string
  ) {
    const response = await axiosInstance.get(
      `${this.baseUrl}/search/by-budget`,
      { params: { budget, category, tags } }
    );
    return response.data;
  }
}

export const productService = new ProductService();