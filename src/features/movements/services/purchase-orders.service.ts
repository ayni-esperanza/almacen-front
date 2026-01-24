/* eslint-disable @typescript-eslint/no-unused-vars */
// TODO: Este archivo está preparado para integración futura con el backend
// Las importaciones y parámetros comentados se usarán cuando los endpoints estén disponibles

// TODO: Descomentar cuando backend esté listo
// import { apiClient } from "../../../shared/services/api.ts";
import { PurchaseOrder, PurchaseOrderProduct } from "../types/purchases.ts";

export interface CreatePurchaseOrderData {
  fecha: string;
  proveedor?: string;
  estado?: 'borrador' | 'enviada' | 'recibida' | 'cancelada';
  observaciones?: string;
}

export interface UpdatePurchaseOrderData {
  fecha?: string;
  proveedor?: string;
  estado?: 'borrador' | 'enviada' | 'recibida' | 'cancelada';
  observaciones?: string;
}

export interface CreatePurchaseOrderProductData {
  codigoProducto: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
}

export interface UpdatePurchaseOrderProductData {
  codigoProducto?: string;
  descripcion?: string;
  cantidad?: number;
  precioUnitario?: number;
}

class PurchaseOrdersService {
  // === PURCHASE ORDERS ===
  // TODO: Integrar con backend cuando esté disponible
  // Los parámetros están listos para cuando el backend esté disponible
  async getAllPurchaseOrders(): Promise<{
    data: PurchaseOrder[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    // Mock data para desarrollo - Reemplazar cuando backend esté listo
    // eslint-disable-next-line no-console
    console.log("TODO: Implementar getAllPurchaseOrders con backend");
    return Promise.resolve({
      data: [
        {
          id: 1,
          fecha: "24/01/2026",
          codigo: "OC-001",
          proveedor: "Proveedor Ejemplo S.A.",
          estado: "borrador" as const,
          cantidad: 30, // 5 + 10 + 15
          costo: 29750.00, // 17500 + 8500 + 3750
          observaciones: "Orden de compra de ejemplo - Click para agregar productos",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    });

    /* Descomentar cuando backend esté disponible:
    async getAllPurchaseOrders(
      startDate?: string,
      endDate?: string,
      page: number = 1,
      limit: number = 100,
      search?: string,
    ): Promise<...> {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (search) params.append("search", search);

      const queryString = params.toString();
      const url = `/purchase-orders${queryString ? `?${queryString}` : ""}`;

      const response = await apiClient.get<{...}>(url);
      return response.data;
    }
    */
  }

  // TODO: Integrar con backend cuando esté disponible
  async getPurchaseOrderById(): Promise<PurchaseOrder> {
    // Mock data - Reemplazar cuando backend esté listo
    throw new Error("Endpoint no disponible aún");
    
    /* Descomentar cuando backend esté disponible:
    async getPurchaseOrderById(id: number): Promise<PurchaseOrder> {
      const response = await apiClient.get<PurchaseOrder>(`/purchase-orders/${id}`);
      return response.data;
    }
    */
  }

  // TODO: Integrar con backend cuando esté disponible
  async createPurchaseOrder(data: CreatePurchaseOrderData): Promise<PurchaseOrder> {
    // Mock data - Reemplazar cuando backend esté listo
    console.log("Datos para crear orden:", data);
    throw new Error("Endpoint no disponible aún. La orden se creará cuando el backend esté listo.");
    
    /* Descomentar cuando backend esté disponible:
    const response = await apiClient.post<PurchaseOrder>("/purchase-orders", data);
    return response.data;
    */
  }

  // TODO: Integrar con backend cuando esté disponible
  async updatePurchaseOrder(
    id: number,
    data: UpdatePurchaseOrderData
  ): Promise<PurchaseOrder> {
    // Mock data - Reemplazar cuando backend esté listo
    console.log("Datos para actualizar orden", id, ":", data);
    throw new Error("Endpoint no disponible aún. La orden se actualizará cuando el backend esté listo.");
    
    /* Descomentar cuando backend esté disponible:
    const response = await apiClient.patch<PurchaseOrder>(
      `/purchase-orders/${id}`,
      data
    );
    return response.data;
    */
  }

  // TODO: Integrar con backend cuando esté disponible
  async deletePurchaseOrder(id: number): Promise<void> {
    // Mock - Reemplazar cuando backend esté listo
    console.log("Eliminando orden:", id);
    throw new Error("Endpoint no disponible aún. La orden se eliminará cuando el backend esté listo.");
    
    /* Descomentar cuando backend esté disponible:
    await apiClient.delete(`/purchase-orders/${id}`);
    */
  }

  // === PURCHASE ORDER PRODUCTS ===
  // TODO: Integrar con backend cuando esté disponible
  async getPurchaseOrderProducts(purchaseOrderId: number): Promise<PurchaseOrderProduct[]> {
    // Mock data - Reemplazar cuando backend esté listo
    console.log("Obteniendo productos de orden:", purchaseOrderId);
    
    // Retornar productos de ejemplo para la orden 1
    if (purchaseOrderId === 1) {
      return Promise.resolve([
        {
          id: 1,
          purchaseOrderId: 1,
          fecha: "24/01/2026",
          codigo: "PROD-001",
          nombre: "Laptop Dell XPS 15",
          area: "Tecnología",
          proyecto: "Modernización IT",
          responsable: "Juan Pérez",
          cantidad: 5,
          costoUnitario: 3500.00,
          subtotal: 17500.00,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          purchaseOrderId: 1,
          fecha: "24/01/2026",
          codigo: "PROD-002",
          nombre: "Monitor LG 27 pulgadas",
          area: "Tecnología",
          proyecto: "Modernización IT",
          responsable: "María García",
          cantidad: 10,
          costoUnitario: 850.00,
          subtotal: 8500.00,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 3,
          purchaseOrderId: 1,
          fecha: "24/01/2026",
          codigo: "PROD-003",
          nombre: "Teclado mecánico Logitech",
          area: "Tecnología",
          proyecto: "Equipamiento Oficina",
          responsable: "Carlos Ruiz",
          cantidad: 15,
          costoUnitario: 250.00,
          subtotal: 3750.00,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
    }
    
    return Promise.resolve([]);
    
    /* Descomentar cuando backend esté disponible:
    const response = await apiClient.get<PurchaseOrderProduct[]>(
      `/purchase-orders/${purchaseOrderId}/products`
    );
    return response.data;
    */
  }

  // TODO: Integrar con backend cuando esté disponible
  async addProductToPurchaseOrder(
    purchaseOrderId: number,
    data: CreatePurchaseOrderProductData
  ): Promise<PurchaseOrderProduct> {
    // Mock data - Reemplazar cuando backend esté listo
    console.log("Agregando producto a orden", purchaseOrderId, ":", data);
    throw new Error("Endpoint no disponible aún. El producto se agregará cuando el backend esté listo.");
    
    /* Descomentar cuando backend esté disponible:
    const response = await apiClient.post<PurchaseOrderProduct>(
      `/purchase-orders/${purchaseOrderId}/products`,
      data
    );
    return response.data;
    */
  }

  // TODO: Integrar con backend cuando esté disponible
  async updatePurchaseOrderProduct(
    purchaseOrderId: number,
    productId: number,
    data: UpdatePurchaseOrderProductData
  ): Promise<PurchaseOrderProduct> {
    // Mock data - Reemplazar cuando backend esté listo
    console.log("Actualizando producto", productId, "de orden", purchaseOrderId, ":", data);
    throw new Error("Endpoint no disponible aún. El producto se actualizará cuando el backend esté listo.");
    
    /* Descomentar cuando backend esté disponible:
    const response = await apiClient.patch<PurchaseOrderProduct>(
      `/purchase-orders/${purchaseOrderId}/products/${productId}`,
      data
    );
    return response.data;
    */
  }

  // TODO: Integrar con backend cuando esté disponible
  async deletePurchaseOrderProduct(
    purchaseOrderId: number,
    productId: number
  ): Promise<void> {
    // Mock - Reemplazar cuando backend esté listo
    console.log("Eliminando producto", productId, "de orden", purchaseOrderId);
    throw new Error("Endpoint no disponible aún. El producto se eliminará cuando el backend esté listo.");
    
    /* Descomentar cuando backend esté disponible:
    await apiClient.delete(
      `/purchase-orders/${purchaseOrderId}/products/${productId}`
    );
    */
  }
}

export const purchaseOrdersService = new PurchaseOrdersService();
