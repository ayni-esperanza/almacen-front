import { useState, useEffect, useCallback } from "react";
import { stockDashboardService } from "../services/stock-dashboard.service";
import type { StockDashboard } from "../types";

interface UseStockDashboardReturn {
  dashboard: StockDashboard | null;
  loading: boolean;
  error: string | null;
  refetch: (periodoAnalisisDias?: number) => Promise<void>;
}

export const useStockDashboard = (
  initialPeriod: number = 30
): UseStockDashboardReturn => {
  const [dashboard, setDashboard] = useState<StockDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(
    async (periodoAnalisisDias: number = initialPeriod) => {
      try {
        setLoading(true);
        setError(null);
        const data = await stockDashboardService.getStockDashboard(
          periodoAnalisisDias
        );
        setDashboard(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al cargar el dashboard"
        );
        console.error("Error fetching stock dashboard:", err);
      } finally {
        setLoading(false);
      }
    },
    [initialPeriod]
  );

  useEffect(() => {
    fetchDashboard(initialPeriod);
  }, [fetchDashboard, initialPeriod]);

  return {
    dashboard,
    loading,
    error,
    refetch: fetchDashboard,
  };
};
