import { useState, useEffect, useCallback } from "react";
import { reportsService } from "../services/reports.service";
import {
  ComparisonItem,
  ComparisonData,
  MonthlyComparisonData,
  ReportFilters,
} from "../types";

const COLORS = [
  "#3b82f6", // blue-500
  "#10b981", // green-500
  "#f59e0b", // amber-500
  "#8b5cf6", // violet-500
  "#ec4899", // pink-500
  "#06b6d4", // cyan-500
  "#f97316", // orange-500
  "#14b8a6", // teal-500
  "#6366f1", // indigo-500
  "#84cc16", // lime-500
];

const formatMonthLabel = (value: string) => {
  if (!value) return "";

  if (value.includes("/")) {
    const [monthStr, yearStr] = value.split("/");
    const month = Number(monthStr);
    const year = Number(yearStr);
    if (!year || !month) {
      return value;
    }
    return new Intl.DateTimeFormat("es-ES", {
      month: "short",
      year: "numeric",
    }).format(new Date(year, month - 1, 1));
  }

  const [yearStr, monthStr] = value.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  if (!year || !month) {
    return value;
  }
  return new Intl.DateTimeFormat("es-ES", {
    month: "short",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));
};

export const useComparisonReport = () => {
  const [comparisons, setComparisons] = useState<ComparisonItem[]>([]);
  const [comparisonData, setComparisonData] = useState<ComparisonData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addComparison = useCallback((item: Omit<ComparisonItem, "id" | "color">) => {
    const id = `comparison-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const colorIndex = comparisons.length % COLORS.length;
    const color = COLORS[colorIndex];
    
    setComparisons((prev) => [
      ...prev,
      { ...item, id, color },
    ]);
  }, [comparisons.length]);

  const removeComparison = useCallback((id: string) => {
    setComparisons((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const updateVisualizationType = useCallback((id: string, visualizationType: "bar" | "line") => {
    setComparisons((prev) => 
      prev.map((c) => c.id === id ? { ...c, visualizationType } : c)
    );
  }, []);

  const clearComparisons = useCallback(() => {
    setComparisons([]);
    setComparisonData([]);
  }, []);

  // Fetch data cuando cambian las comparaciones
  useEffect(() => {
    if (comparisons.length === 0) {
      setComparisonData([]);
      return;
    }

    const fetchComparisonData = async () => {
      try {
        setLoading(true);
        setError(null);

        const results = await Promise.all(
          comparisons.map(async (comparison) => {
            const filters: ReportFilters = {
              fechaInicio: comparison.fechaInicio,
              fechaFin: comparison.fechaFin,
              tipoReporte: comparison.type === "proyecto" ? "proyecto" : "area",
              area: comparison.area,
              proyecto: comparison.proyecto,
            };

            const [areaData, monthlyData] = await Promise.all([
              reportsService.getAreaExpenseData(filters),
              reportsService.getMonthlyExpenseData(filters),
            ]);

            let totalGasto = 0;
            let cantidadMovimientos = 0;

            if (comparison.type === "area" && comparison.area) {
              const areaResult = areaData.find((a) => a.area === comparison.area);
              if (areaResult) {
                totalGasto = areaResult.totalGasto;
                cantidadMovimientos = areaResult.cantidadMovimientos;
              }
            } else if (comparison.type === "proyecto" && comparison.proyecto) {
              areaData.forEach((area) => {
                const proyectoResult = area.proyectos.find(
                  (p) => p.proyecto === comparison.proyecto
                );
                if (proyectoResult) {
                  totalGasto += proyectoResult.totalGasto;
                  cantidadMovimientos += proyectoResult.cantidadMovimientos;
                }
              });
            }

            const monthlyComparisonData: MonthlyComparisonData[] = monthlyData.map(
              (item) => ({
                mes: formatMonthLabel(item.mes),
                rawMes: item.mes,
                totalGasto: item.totalGasto,
                cantidadMovimientos: item.cantidadMovimientos,
              })
            );

            return {
              id: comparison.id,
              label: comparison.label,
              totalGasto,
              cantidadMovimientos,
              monthlyData: monthlyComparisonData,
              color: comparison.color,
              visualizationType: comparison.visualizationType,
            } as ComparisonData;
          })
        );

        setComparisonData(results);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al cargar comparaciones"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchComparisonData();
  }, [comparisons]);

  return {
    comparisons,
    comparisonData,
    loading,
    error,
    addComparison,
    removeComparison,
    updateVisualizationType,
    clearComparisons,
  };
};
