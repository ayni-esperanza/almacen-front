import { useEffect, useState } from "react";
import { stockAlertsService } from "../../features/reports/services/stock-alerts.service";
import type { StockAlert } from "../../features/reports/types";
import type { StockAlertNotification } from "../components/NotificationBell";

export const useStockAlerts = (refreshInterval = 60000) => {
  const [alerts, setAlerts] = useState<StockAlertNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = async () => {
    try {
      setError(null);
      // Obtener solo alertas críticas y de advertencia (stock bajo o crítico)
      // ocultarVistas: true para que no aparezcan las ya vistas en la campana
      const stockAlerts = await stockAlertsService.getStockAlerts({
        mostrarSoloCriticos: false,
        ocultarVistas: true, // Ocultar alertas vistas solo en la campana
      });

      // Filtrar solo productos con stock bajo o crítico
      const filteredAlerts = stockAlerts.filter(
        (alert: StockAlert) =>
          alert.estado === "critico" || alert.estado === "bajo"
      );

      // Convertir al formato que espera NotificationBell
      const notifications: StockAlertNotification[] = filteredAlerts.map(
        (alert: StockAlert) => ({
          id: alert.id,
          productName: alert.nombre,
          productCode: alert.codigo,
          currentStock: alert.stockActual,
          minimumStock: alert.stockMinimo,
          updatedAt: alert.ultimaActualizacion
            ? new Date(alert.ultimaActualizacion).toISOString()
            : new Date().toISOString(),
          severity: alert.estado === "critico" ? "critical" : "warning",
          status: "pending",
        })
      );

      setAlerts(notifications);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar alertas");
      console.error("Error fetching stock alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();

    // Configurar actualización periódica
    const interval = setInterval(fetchAlerts, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  return {
    alerts,
    loading,
    error,
    refetch: fetchAlerts,
  };
};
