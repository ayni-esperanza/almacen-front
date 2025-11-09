import { apiClient } from "../../../shared/services/api";
import { config } from "../../../shared/config";
import { StockAlert, StockAlertFilters } from "../types";

class StockAlertsService {
  async getStockAlerts(filters: StockAlertFilters): Promise<StockAlert[]> {
    const params = new URLSearchParams();
    if (filters.categoria) params.append("categoria", filters.categoria);
    if (filters.ubicacion) params.append("ubicacion", filters.ubicacion);
    if (filters.estado) params.append("estado", filters.estado);
    if (filters.mostrarSoloCriticos) params.append("soloCriticos", "true");
    if (filters.ocultarVistas) params.append("ocultarVistas", "true");

    const response = await apiClient.get<StockAlert[]>(
      `/reports/stock-alerts?${params.toString()}`
    );

    if (response.error) {
      console.error("Error fetching stock alerts:", response.error);
      return [];
    }

    return response.data || [];
  }

  async getStockAlert(id: string): Promise<StockAlert | null> {
    const response = await apiClient.get<StockAlert>(
      `/reports/stock-alerts/${id}`
    );

    if (response.error) {
      console.error("Error fetching stock alert:", response.error);
      return null;
    }

    return response.data || null;
  }

  async updateStockAlert(
    id: string,
    data: Partial<StockAlert>
  ): Promise<StockAlert | null> {
    const response = await apiClient.patch<StockAlert>(
      `/reports/stock-alerts/${id}`,
      data
    );

    if (response.error) {
      console.error("Error updating stock alert:", response.error);
      throw new Error(response.error);
    }

    return response.data || null;
  }

  async markAlertAsViewed(id: string): Promise<StockAlert | null> {
    const response = await apiClient.post<StockAlert>(
      `/reports/stock-alerts/${id}/mark-viewed`,
      {}
    );

    if (response.error) {
      console.error("Error marking alert as viewed:", response.error);
      throw new Error(response.error);
    }

    return response.data || null;
  }

  async exportStockAlerts(filters: StockAlertFilters): Promise<Blob | null> {
    try {
      const params = new URLSearchParams();
      if (filters.categoria) params.append("categoria", filters.categoria);
      if (filters.ubicacion) params.append("ubicacion", filters.ubicacion);
      if (filters.estado) params.append("estado", filters.estado);
      if (filters.mostrarSoloCriticos) params.append("soloCriticos", "true");

      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        `${config.apiUrl}/reports/stock-alerts/export?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to export stock alerts");
      }

      return await response.blob();
    } catch (error) {
      console.error("Error exporting stock alerts:", error);
      return null;
    }
  }

  async getStockAlertStatistics(): Promise<{
    total: number;
    criticos: number;
    bajos: number;
    totalStock: number;
    stockMinimo: number;
  }> {
    const response = await apiClient.get("/reports/stock-alerts/statistics");

    if (response.error) {
      console.error("Error fetching stock alert statistics:", response.error);
      return {
        total: 0,
        criticos: 0,
        bajos: 0,
        totalStock: 0,
        stockMinimo: 0,
      };
    }

    return (
      (response.data as {
        total: number;
        criticos: number;
        bajos: number;
        totalStock: number;
        stockMinimo: number;
      }) || {
        total: 0,
        criticos: 0,
        bajos: 0,
        totalStock: 0,
        stockMinimo: 0,
      }
    );
  }

  async getCategories(): Promise<string[]> {
    const response = await apiClient.get<string[]>(
      "/reports/stock-alerts/filters/categories"
    );

    if (response.error) {
      console.error("Error fetching categories:", response.error);
      return [];
    }

    return response.data || [];
  }

  async getLocations(): Promise<string[]> {
    const response = await apiClient.get<string[]>(
      "/reports/stock-alerts/filters/locations"
    );

    if (response.error) {
      console.error("Error fetching locations:", response.error);
      return [];
    }

    return response.data || [];
  }
}

export const stockAlertsService = new StockAlertsService();
