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
  providerId: number;
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

  async getProductByCode(codigo: string): Promise<Product | null> {
    const response = await apiClient.get<Product>(
      `/inventory/products/code/${encodeURIComponent(codigo)}`
    );

    if (response.error) {
      // No mostrar error en consola si no se encuentra
      if (!response.error.includes("404")) {
        console.error("Error fetching product by code:", response.error);
      }
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

  async getAreas(search?: string): Promise<string[]> {
    const endpoint = search
      ? `/inventory/areas?search=${encodeURIComponent(search)}`
      : "/inventory/areas";
    const response = await apiClient.get<{ nombre: string }[]>(endpoint);

    if (response.error) {
      console.error("Error fetching areas:", response.error);
      return [];
    }

    return response.data?.map((area) => area.nombre) || [];
  }

  async createArea(nombre: string): Promise<string | null> {
    const response = await apiClient.post<{ nombre: string }>(
      "/inventory/areas",
      { nombre }
    );

    if (response.error) {
      console.error("Error creating area:", response.error);
      return null;
    }

    return response.data?.nombre || null;
  }

  async getCategorias(search?: string): Promise<string[]> {
    const endpoint = search
      ? `/inventory/categorias?search=${encodeURIComponent(search)}`
      : "/inventory/categorias";
    const response = await apiClient.get<{ nombre: string }[]>(endpoint);

    if (response.error) {
      console.error("Error fetching categorias:", response.error);
      return [];
    }

    return response.data?.map((categoria) => categoria.nombre) || [];
  }

  async createCategoria(nombre: string): Promise<string | null> {
    const response = await apiClient.post<{ nombre: string }>(
      "/inventory/categorias",
      { nombre }
    );

    if (response.error) {
      console.error("Error creating categoria:", response.error);
      return null;
    }

    return response.data?.nombre || null;
  }
}

export const inventoryService = new InventoryService();
