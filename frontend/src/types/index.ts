export type UserRole = "admin" | "manager" | "staff";

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface PaginationMeta {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta: PaginationMeta;
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  cost_price: number;
  stock_quantity: number;
  reorder_level: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  created_at: string;
  updated_at: string;
}

export type OrderStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

export interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
  product?: Product;
}

export interface Order {
  id: number;
  order_number: string;
  customer_id: number;
  status: OrderStatus;
  total_amount: number;
  created_at: string;
  updated_at: string;
  customer?: Customer;
  items: OrderItem[];
}

export interface InventoryMovement {
  id: number;
  product_id: number;
  type: string;
  quantity: number;
  reference: string;
  created_at: string;
  product?: Product;
}

export interface DashboardData {
  stats: {
    total_products: number;
    total_customers: number;
    total_orders: number;
    total_revenue: number;
    low_stock_count: number;
  };
  recent_orders: Order[];
  charts: {
    monthly_sales: { month: string; revenue: number; orders: number }[];
    top_products: { product_id: number; product_name: string; total_quantity: number; total_revenue: number }[];
    inventory_trends: { month: string; stock_in: number; stock_out: number }[];
  };
}
