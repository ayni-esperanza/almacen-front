import { apiClient } from "./api";
import { Product } from "../../features/inventory/types";

export interface CreateProductData {
  codigo: string;
  nombre: string;
  costoUnitario: number;
  ubicacion: string;
  entradas?: number;
  salidas?: number;
  stockActual?: number;
  stockMinimo?: number;
  unidadMedida: string;
  proveedor: string;
  marca?: string;
  costoTotal?: number;
  categoria?: string;
}

export type UpdateProductData = Partial<CreateProductData>;

class InventoryService {
  async getAllProducts(search?: string): Promise<Product[]> {
    const endpoint = search
      ? `/inventory/products?search=${encodeURIComponent(search)}`
      : "/inventory/products";
    const response = await apiClient.get<Product[]>(endpoint);

    if (response.error) {
      console.error("Error fetching products:", response.error);
      return [];
    }

    return response.data || [];
  }

  async getProduct(id: string): Promise<Product | null> {
    const response = await apiClient.get<Product>(`/inventory/products/${id}`);

    if (response.error) {
      console.error("Error fetching product:", response.error);
      return null;
    }

    return response.data || null;
  }

  async createProduct(productData: CreateProductData): Promise<Product | null> {
    const response = await apiClient.post<Product>(
      "/inventory/products",
      productData
    );

    if (response.error) {
      console.error("Error creating product:", response.error);
      throw new Error(response.error);
    }

    return response.data || null;
  }

  async updateProduct(
    id: string,
    productData: UpdateProductData
  ): Promise<Product | null> {
    const response = await apiClient.patch<Product>(
      `/inventory/products/${id}`,
      productData
    );

    if (response.error) {
      console.error("Error updating product:", response.error);
      throw new Error(response.error);
    }

    return response.data || null;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const response = await apiClient.delete(`/inventory/products/${id}`);

    if (response.error) {
      console.error("Error deleting product:", response.error);
      return false;
    }

    return true;
  }

  async getAreas(): Promise<string[]> {
    const response = await apiClient.get<{ nombre: string }[]>(
      "/inventory/areas"
    );

    if (response.error) {
      console.error("Error fetching areas:", response.error);
      return [];
    }

    return response.data?.map((area) => area.nombre) || [];
  }
}

export const inventoryService = new InventoryService();
