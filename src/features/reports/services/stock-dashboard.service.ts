import { apiClient } from "../../../shared/services/api";
import type { StockDashboard } from "../types";

class StockDashboardService {
  /**
   * Obtiene las métricas del dashboard de stock
   * @param periodoAnalisisDias Período en días para calcular producto más movido (default: 30)
   */
  async getStockDashboard(
    periodoAnalisisDias: number = 30
  ): Promise<StockDashboard> {
    const response = await apiClient.get<StockDashboard>(
      `/reports/stock-dashboard?periodoAnalisisDias=${periodoAnalisisDias}`
    );

    if (response.error) {
      console.error("Error fetching stock dashboard:", response.error);
      throw new Error(response.error);
    }

    return (
      response.data || {
        totalProductos: 0,
        valorTotalInventario: 0,
        periodoAnalisisDias,
      }
    );
  }
}

export const stockDashboardService = new StockDashboardService();
