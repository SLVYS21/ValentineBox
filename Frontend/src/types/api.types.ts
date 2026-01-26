// Common API Response
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  count?: number;
  total?: number;
  page?: number;
  pages?: number;
  currentPage?: number;
  totalPages?: number;
}

// Product Types
export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: ProductImage[];
  category: ProductCategory;
  stock: ProductStock;
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  metadata: ProductMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductImage {
  public_id: string;
  url: string;
  thumbnail_url?: string;
  is_primary: boolean;
  _id?: string;
}

export type ProductCategory = 'bouquets' | 'chocolats' | 'peluches' | 'bijoux' | 'parfums' | 'coffrets' | 'autres';

export interface ProductStock {
  quantity: number;
  reserved: number;
  available: number;
  threshold: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export interface ProductMetadata {
  views: number;
  purchases: number;
  rating: {
    average: number;
    count: number;
  };
}

// Pack Types
export interface Pack {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  items: PackItem[];
  originalPrice: number;
  packPrice: number;
  discount: number;
  discountPercentage: number;
  budgetRange: {
    min: number;
    max: number;
  };
  category: PackCategory;
  occasion: PackOccasion;
  theme?: PackTheme;
  tags: string[];
  image?: PackImage;
  images: PackImage[];
  isActive: boolean;
  isFeatured: boolean;
  stockStatus: 'available' | 'limited' | 'out_of_stock';
  availableQuantity: number;
  validFrom?: Date;
  validUntil?: Date;
  metadata: PackMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface PackItem {
  product: string | Product;
  quantity: number;
  priceAtCreation: number;
  _id?: string;
}

export interface PackImage {
  url: string;
  publicId?: string;
  alt?: string;
  isPrimary?: boolean;
}

export type PackCategory = 'petit_budget' | 'budget_moyen' | 'budget_confortable' | 'budget_premium' | 'budget_luxe';
export type PackOccasion = 'saint_valentin' | 'anniversaire' | 'declaration' | 'reconciliation' | 'cadeau_surprise' | 'toutes_occasions';
export type PackTheme = 'romantique' | 'gourmand' | 'luxe' | 'classique' | 'moderne' | 'personnalise';

export interface PackMetadata {
  views: number;
  purchases: number;
  revenue: number;
  rating: number;
  reviewCount: number;
}

// Order Types
export interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  statusHistory: OrderStatusHistory[];
  customer: OrderCustomer;
  delivery: OrderDelivery;
  payment: OrderPayment;
  notes?: string;
  internalNotes?: string;
  discount: number;
  finalAmount: number;
  stockReserved: boolean;
  transactionCreated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  product: string | Product;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  image?: ProductImage;
  _id?: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'refunded';

export interface OrderStatusHistory {
  status: string;
  timestamp: Date;
  notes?: string;
  updatedBy?: string;
}

export interface OrderCustomer {
  name: string;
  phone: string;
  email?: string;
  address?: {
    street?: string;
    city?: string;
    district?: string;
    landmark?: string;
  };
}

export interface OrderDelivery {
  type: 'pickup' | 'delivery';
  date?: Date;
  timeSlot?: string;
  address?: string;
  instructions?: string;
  fee: number;
}

export interface OrderPayment {
  method: 'cash' | 'momo' | 'bank_transfer' | 'card';
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  transactionId?: string;
  paidAt?: Date;
}

// Sourcing Types
export interface Sourcing {
  _id: string;
  sourcingNumber: string;
  supplier: SourcingSupplier;
  items: SourcingItem[];
  totalCost: number;
  status: SourcingStatus;
  statusHistory: SourcingStatusHistory[];
  orderDate: Date;
  expectedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  payment: SourcingPayment;
  shippingCost: number;
  otherCosts: number;
  finalCost: number;
  notes?: string;
  transactionCreated: boolean;
  stockRecorded: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SourcingSupplier {
  name: string;
  contact?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface SourcingItem {
  product: string | Product;
  name: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  receivedQuantity: number;
  notes?: string;
  _id?: string;
}

export type SourcingStatus = 'draft' | 'ordered' | 'partial' | 'received' | 'cancelled';

export interface SourcingStatusHistory {
  status: string;
  timestamp: Date;
  notes?: string;
  updatedBy?: string;
}

export interface SourcingPayment {
  method?: 'cash' | 'bank_transfer' | 'credit' | 'momo';
  status: 'pending' | 'partial' | 'paid';
  paidAmount: number;
  dueAmount: number;
}

// Transaction Types
export interface Transaction {
  _id: string;
  transactionNumber: string;
  type: 'income' | 'expense';
  category: TransactionCategory;
  amount: number;
  description: string;
  relatedDocument?: {
    model: 'Order' | 'Sourcing' | 'Manual';
    id?: string;
  };
  paymentMethod: PaymentMethod;
  date: Date;
  account: TransactionAccount;
  status: 'pending' | 'completed' | 'cancelled' | 'failed';
  notes?: string;
  performedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TransactionCategory =
  | 'sales'
  | 'refund_received'
  | 'other_income'
  | 'sourcing'
  | 'delivery'
  | 'marketing'
  | 'packaging'
  | 'rent'
  | 'utilities'
  | 'salaries'
  | 'refund_given'
  | 'other_expense';

export type PaymentMethod = 'cash' | 'momo' | 'bank_transfer' | 'card' | 'credit';
export type TransactionAccount = 'main_cash' | 'momo_account' | 'bank_account' | 'card_terminal';

// Query Parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface ProductQueryParams extends PaginationParams {
  category?: ProductCategory;
  search?: string;
  status?: string;
  sortBy?: string;
  isActive?: boolean;
  isFeatured?: boolean;
}

export interface OrderQueryParams extends PaginationParams {
  status?: OrderStatus;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface SourcingQueryParams extends PaginationParams {
  status?: SourcingStatus;
  supplier?: string;
  startDate?: string;
  endDate?: string;
}

export interface TransactionQueryParams extends PaginationParams {
  type?: 'income' | 'expense';
  category?: TransactionCategory;
  account?: TransactionAccount;
  startDate?: string;
  endDate?: string;
  status?: string;
}