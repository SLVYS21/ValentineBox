// src/services/auth.service.ts
import axiosInstance from '@/utils/axios.config';
import {
  User,
  AuthResponse,
  LoginCredentials,
  RegisterData,
  UpdateProfileData,
  ChangePasswordData,
  ForgotPasswordData,
  ResetPasswordData,
} from '../types/auth.types';
import { ApiResponse } from '../types/api.types';

class AuthService {
  private readonly baseUrl = '/auth';

  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await axiosInstance.post<AuthResponse>(
      `${this.baseUrl}/login`,
      credentials
    );
    return response.data;
  }

  /**
   * Register new user (super admin only)
   */
  async register(data: RegisterData): Promise<ApiResponse<User>> {
    const response = await axiosInstance.post<ApiResponse<User>>(
      `${this.baseUrl}/register`,
      data
    );
    return response.data;
  }

  /**
   * Get current user profile
   */
  async getMe(): Promise<ApiResponse<User>> {
    const response = await axiosInstance.get<ApiResponse<User>>(
      `${this.baseUrl}/me`
    );
    return response.data;
  }

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileData): Promise<ApiResponse<User>> {
    const response = await axiosInstance.put<ApiResponse<User>>(
      `${this.baseUrl}/update-profile`,
      data
    );
    return response.data;
  }

  /**
   * Change password
   */
  async changePassword(data: ChangePasswordData): Promise<ApiResponse<{ token: string }>> {
    const response = await axiosInstance.put<ApiResponse<{ token: string }>>(
      `${this.baseUrl}/change-password`,
      data
    );
    return response.data;
  }

  /**
   * Request password reset
   */
  async forgotPassword(data: ForgotPasswordData): Promise<ApiResponse> {
    const response = await axiosInstance.post<ApiResponse>(
      `${this.baseUrl}/forgot-password`,
      data
    );
    return response.data;
  }

  /**
   * Reset password with token
   */
  async resetPassword(
    resetToken: string,
    data: ResetPasswordData
  ): Promise<ApiResponse<{ token: string }>> {
    const response = await axiosInstance.put<ApiResponse<{ token: string }>>(
      `${this.baseUrl}/reset-password/${resetToken}`,
      data
    );
    return response.data;
  }

  /**
   * Get all users (super admin only)
   */
  async getUsers(): Promise<ApiResponse<User[]>> {
    const response = await axiosInstance.get<ApiResponse<User[]>>(
      `${this.baseUrl}/users`
    );
    return response.data;
  }

  /**
   * Update user (super admin only)
   */
  async updateUser(
    userId: string,
    data: Partial<User>
  ): Promise<ApiResponse<User>> {
    const response = await axiosInstance.put<ApiResponse<User>>(
      `${this.baseUrl}/users/${userId}`,
      data
    );
    return response.data;
  }

  /**
   * Delete user (super admin only)
   */
  async deleteUser(userId: string): Promise<ApiResponse> {
    const response = await axiosInstance.delete<ApiResponse>(
      `${this.baseUrl}/users/${userId}`
    );
    return response.data;
  }
}

export const authService = new AuthService();