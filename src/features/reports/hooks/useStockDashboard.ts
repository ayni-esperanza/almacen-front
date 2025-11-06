import { useState, useEffect, useCallback } from "react";
import { stockDashboardService } from "../services/stock-dashboard.service";
import { pdfExportService } from "../services/pdf-export.service";
import type { StockDashboard } from "../types";

interface UseStockDashboardReturn {
  dashboard: StockDashboard | null;
  loading: boolean;
  error: string | null;
  refetch: (periodoAnalisisDias?: number) => Promise<void>;
  exportToPDF: () => Promise<void>;
}

export const useStockDashboard = (
  initialPeriod: number = 30
): UseStockDashboardReturn => {
  const [dashboard, setDashboard] = useState<StockDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPeriod, setCurrentPeriod] = useState(initialPeriod);

  const fetchDashboard = useCallback(
    async (periodoAnalisisDias: number = initialPeriod) => {
      try {
        setLoading(true);
        setError(null);
        setCurrentPeriod(periodoAnalisisDias);
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

  const exportToPDF = useCallback(async () => {
    if (!dashboard) {
      setError("No hay datos para exportar");
      return;
    }

    try {
      const blob = await pdfExportService.exportStockDashboard(
        dashboard,
        currentPeriod
      );

      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `dashboard-stock-${
          new Date().toISOString().split("T")[0]
        }.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al exportar PDF");
      console.error("Error exporting PDF:", err);
    }
  }, [dashboard, currentPeriod]);

  useEffect(() => {
    fetchDashboard(initialPeriod);
  }, [fetchDashboard, initialPeriod]);

  return {
    dashboard,
    loading,
    error,
    refetch: fetchDashboard,
    exportToPDF,
  };
};
