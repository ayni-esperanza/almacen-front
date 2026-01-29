/* eslint-disable @typescript-eslint/no-unused-vars */
import { apiClient } from "../../../shared/services/api.ts";
import { PurchaseOrder, PurchaseOrderProduct } from "../types/purchases.ts";

export interface CreatePurchaseOrderData {
  fecha: string;
  proveedor?: string;
  estado?: "BORRADOR" | "ENVIADA" | "RECIBIDA" | "CANCELADA";
  observaciones?: string;
}

export interface UpdatePurchaseOrderData {
  fecha?: string;
  proveedor?: string;
  estado?: "BORRADOR" | "ENVIADA" | "RECIBIDA" | "CANCELADA";
  observaciones?: string;
}

export interface CreatePurchaseOrderProductData {
  fecha: string;
  codigo: string;
  nombre: string;
  area: string;
  proyecto: string;
  responsable: string;
  cantidad: number;
  costoUnitario: number;
}

export interface UpdatePurchaseOrderProductData {
  fecha?: string;
  codigo?: string;
  nombre?: string;
  area?: string;
  proyecto?: string;
  responsable?: string;
  cantidad?: number;
  costoUnitario?: number;
}

class PurchaseOrdersService {
  // === PURCHASE ORDERS ===
  async getAllPurchaseOrders(
    startDate?: string,
    endDate?: string,
    page: number = 1,
    limit: number = 100,
    search?: string,
  ): Promise<{
    data: PurchaseOrder[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    params.append("page", page.toString());
    params.append("limit", limit.toString());
    if (search) params.append("search", search);

    const queryString = params.toString();
    const url = `/movements/purchase-orders${queryString ? `?${queryString}` : ""}`;

    const response = await apiClient.get<{
      data: PurchaseOrder[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(url);

    if (response.error) {
      console.error("Error fetching purchase orders:", response.error);
      return {
        data: [],
        pagination: { page: 1, limit, total: 0, totalPages: 0 },
      };
    }

    return (
      response.data || {
        data: [],
        pagination: { page: 1, limit, total: 0, totalPages: 0 },
      }
    );
  }

  async getPurchaseOrderById(id: number): Promise<PurchaseOrder> {
    const response = await apiClient.get<PurchaseOrder>(
      `/movements/purchase-orders/${id}`,
    );

    if (response.error) {
      throw new Error(response.error);
    }

    return response.data!;
  }

  async createPurchaseOrder(
    data: CreatePurchaseOrderData,
  ): Promise<PurchaseOrder> {
    const response = await apiClient.post<PurchaseOrder>(
      "/movements/purchase-orders",
      data,
    );

    if (response.error) {
      throw new Error(response.error);
    }

    return response.data!;
  }

  async updatePurchaseOrder(
    id: number,
    data: UpdatePurchaseOrderData,
  ): Promise<PurchaseOrder> {
    const response = await apiClient.patch<PurchaseOrder>(
      `/movements/purchase-orders/${id}`,
      data,
    );

    if (response.error) {
      throw new Error(response.error);
    }

    return response.data!;
  }

  async deletePurchaseOrder(id: number): Promise<void> {
    const response = await apiClient.delete(`/movements/purchase-orders/${id}`);

    if (response.error) {
      throw new Error(response.error);
    }
  }

  // === PURCHASE ORDER PRODUCTS ===
  async getPurchaseOrderProducts(
    purchaseOrderId: number,
  ): Promise<PurchaseOrderProduct[]> {
    const response = await apiClient.get<PurchaseOrderProduct[]>(
      `/movements/purchase-orders/${purchaseOrderId}/products`,
    );

    if (response.error) {
      console.error("Error fetching purchase order products:", response.error);
      return [];
    }

    return response.data || [];
  }

  async addProductToPurchaseOrder(
    purchaseOrderId: number,
    data: CreatePurchaseOrderProductData,
  ): Promise<PurchaseOrderProduct> {
    const response = await apiClient.post<PurchaseOrderProduct>(
      `/movements/purchase-orders/${purchaseOrderId}/products`,
      data,
    );

    if (response.error) {
      throw new Error(response.error);
    }

    return response.data!;
  }

  async updatePurchaseOrderProduct(
    purchaseOrderId: number,
    productId: number,
    data: UpdatePurchaseOrderProductData,
  ): Promise<PurchaseOrderProduct> {
    const response = await apiClient.patch<PurchaseOrderProduct>(
      `/movements/purchase-orders/${purchaseOrderId}/products/${productId}`,
      data,
    );

    if (response.error) {
      throw new Error(response.error);
    }

    return response.data!;
  }

  async deletePurchaseOrderProduct(
    purchaseOrderId: number,
    productId: number,
  ): Promise<void> {
    const response = await apiClient.delete(
      `/movements/purchase-orders/${purchaseOrderId}/products/${productId}`,
    );

    if (response.error) {
      throw new Error(response.error);
    }
  }
}

export const purchaseOrdersService = new PurchaseOrdersService();
