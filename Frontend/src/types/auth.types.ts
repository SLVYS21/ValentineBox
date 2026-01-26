export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'super_admin';
  permissions: Permission[];
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type Permission =
  | 'manage_products'
  | 'manage_orders'
  | 'manage_sourcing'
  | 'manage_transactions'
  | 'manage_users'
  | 'view_dashboard'
  | 'manage_settings';

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'super_admin';
  permissions?: Permission[];
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  newPassword: string;
}