import { useState, useEffect, useMemo, useCallback } from "react";
import { reportsService } from "../services/reports.service";
import {
  ExpenseReport,
  MonthlyExpenseData,
  AreaExpenseData,
  ReportFilters,
  ChartData,
} from "../types";

const formatMonthValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

const formatMonthLabel = (value: string) => {
  if (!value) return "";

  // Manejar formato MM/YYYY (desde la API)
  if (value.includes("/")) {
    const [monthStr, yearStr] = value.split("/");
    const month = Number(monthStr);
    const year = Number(yearStr);
    if (!year || !month) {
      return value;
    }
    return new Intl.DateTimeFormat("es-ES", {
      month: "long",
      year: "numeric",
    }).format(new Date(year, month - 1, 1));
  }

  // Manejar formato YYYY-MM (desde filtros)
  const [yearStr, monthStr] = value.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  if (!year || !month) {
    return value;
  }
  return new Intl.DateTimeFormat("es-ES", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));
};

export const useReports = () => {
  const [expenseReports, setExpenseReports] = useState<ExpenseReport[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyExpenseData[]>([]);
  const [areaData, setAreaData] = useState<AreaExpenseData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ReportFilters>(() => {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1); // Enero del año actual
    return {
      fechaInicio: formatMonthValue(startOfYear),
      fechaFin: formatMonthValue(today),
      tipoReporte: "area",
    };
  });

  // Optimización: Fetch único que carga todos los datos en paralelo
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Ejecutar todas las peticiones en paralelo
      const [reportsData, monthlyDataResult, areaDataResult] =
        await Promise.all([
          reportsService.getExpenseReports(filters),
          reportsService.getMonthlyExpenseData(filters),
          reportsService.getAreaExpenseData(filters),
        ]);

      setExpenseReports(reportsData);
      setMonthlyData(monthlyDataResult);
      setAreaData(areaDataResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar reportes");
    } finally {
      setLoading(false);
    }
  }, [
    filters.fechaInicio,
    filters.fechaFin,
    filters.area,
    filters.proyecto,
    filters.tipoReporte,
  ]);

  const updateFilters = useCallback((newFilters: Partial<ReportFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  // Optimización: Memoizar la generación de datos de gráficos
  const generateChartData = useMemo((): ChartData[] => {
    if (filters.tipoReporte === "area") {
      return areaData.map((area) => ({
        name: area.area,
        gasto: area.totalGasto,
        movimientos: area.cantidadMovimientos,
      }));
    } else {
      // Para reportes por proyecto, agrupar por proyecto
      const projectData = new Map<
        string,
        { gasto: number; movimientos: number }
      >();

      areaData.forEach((area) => {
        area.proyectos.forEach((proyecto) => {
          const existing = projectData.get(proyecto.proyecto) || {
            gasto: 0,
            movimientos: 0,
          };
          projectData.set(proyecto.proyecto, {
            gasto: existing.gasto + proyecto.totalGasto,
            movimientos: existing.movimientos + proyecto.cantidadMovimientos,
          });
        });
      });

      return Array.from(projectData.entries()).map(([proyecto, data]) => ({
        name: proyecto,
        gasto: data.gasto,
        movimientos: data.movimientos,
      }));
    }
  }, [areaData, filters.tipoReporte]);

  // Optimización: Memoizar datos mensuales para gráficos
  const getMonthlyChartData = useMemo((): ChartData[] => {
    // Ordenar los datos por mes de forma cronológica
    const sortedData = [...monthlyData].sort((a, b) => {
      const [monthA, yearA] = (a.mes || "").split("/");
      const [monthB, yearB] = (b.mes || "").split("/");
      const dateA = new Date(parseInt(yearA) || 0, parseInt(monthA) - 1 || 0);
      const dateB = new Date(parseInt(yearB) || 0, parseInt(monthB) - 1 || 0);
      return dateA.getTime() - dateB.getTime();
    });

    return sortedData.map((item) => ({
      name: item.mes ? formatMonthLabel(item.mes) : "Sin Mes",
      gasto: item.totalGasto,
      movimientos: item.cantidadMovimientos,
    }));
  }, [monthlyData]);

  const exportToPDF = useCallback(
    async (
      tipo: "chart" | "table" = "table",
      mainChartType: "bar" | "pie" | "line" = "bar",
      monthlyChartType: "bar" | "pie" | "line" = "bar"
    ): Promise<void> => {
      try {
        const blob = await reportsService.exportExpenseReport(
          filters,
          tipo,
          mainChartType,
          monthlyChartType
        );
        if (blob) {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          const tipoTexto = tipo === "chart" ? "graficos" : "tabla";
          a.download = `reporte-gastos-${tipoTexto}-${filters.fechaInicio}-${filters.fechaFin}.pdf`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al exportar PDF");
      }
    },
    [filters]
  );

  // Optimización: Usar un solo useEffect con fetchAllData
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const refetch = useCallback(() => {
    fetchAllData();
  }, [fetchAllData]);

  return {
    expenseReports,
    monthlyData,
    areaData,
    loading,
    error,
    filters,
    updateFilters,
    generateChartData,
    getMonthlyChartData,
    exportToPDF,
    refetch,
  };
};
