import { api } from "./client";
import type { ApiResponse, AuthTokens, DashboardData, PaginatedResponse, User } from "@/types";

export const authApi = {
  login: (email: string, password: string) =>
    api.post<ApiResponse<{ user: User; tokens: AuthTokens }>>("/auth/login", { email, password }),
  register: (data: { email: string; password: string; full_name: string; role: string }) =>
    api.post<ApiResponse<{ user: User; tokens: AuthTokens }>>("/auth/register", data),
  logout: () => api.post("/auth/logout"),
};

export const productsApi = {
  list: (params?: Record<string, unknown>) => api.get<PaginatedResponse<import("@/types").Product>>("/products", { params }),
  get: (id: number) => api.get<ApiResponse<import("@/types").Product>>(`/products/${id}`),
  create: (data: Partial<import("@/types").Product>) => api.post("/products", data),
  update: (id: number, data: Partial<import("@/types").Product>) => api.put(`/products/${id}`, data),
  delete: (id: number) => api.delete(`/products/${id}`),
};

export const customersApi = {
  list: (params?: Record<string, unknown>) => api.get<PaginatedResponse<import("@/types").Customer>>("/customers", { params }),
  get: (id: number) => api.get<ApiResponse<import("@/types").Customer>>(`/customers/${id}`),
  create: (data: Partial<import("@/types").Customer>) => api.post("/customers", data),
  update: (id: number, data: Partial<import("@/types").Customer>) => api.put(`/customers/${id}`, data),
  delete: (id: number) => api.delete(`/customers/${id}`),
};

export const ordersApi = {
  list: (params?: Record<string, unknown>) => api.get<PaginatedResponse<import("@/types").Order>>("/orders", { params }),
  get: (id: number) => api.get<ApiResponse<import("@/types").Order>>(`/orders/${id}`),
  create: (data: { customer_id: number; items: { product_id: number; quantity: number }[] }) => api.post("/orders", data),
  cancel: (id: number) => api.post(`/orders/${id}/cancel`),
  complete: (id: number) => api.post(`/orders/${id}/complete`),
};

export const inventoryApi = {
  history: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<import("@/types").InventoryMovement>>("/inventory/history", { params }),
  lowStock: (params?: Record<string, unknown>) => api.get<PaginatedResponse<import("@/types").Product>>("/inventory/low-stock", { params }),
};

export const dashboardApi = {
  get: () => api.get<ApiResponse<DashboardData>>("/dashboard"),
};
