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

const normalizeText = (value?: string | null) => value?.trim().toLowerCase() ?? "";

const toNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
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
            const monthlyTotalGasto = monthlyData.reduce(
              (sum, item: any) => sum + toNumber(item?.totalGasto ?? item?.gasto),
              0
            );
            const monthlyMovimientos = monthlyData.reduce(
              (sum, item: any) => sum + toNumber(item?.cantidadMovimientos ?? item?.movimientos),
              0
            );

            if (comparison.type === "area" && comparison.area) {
              const targetArea = normalizeText(comparison.area);
              const areaResult = areaData.find(
                (a: any) => normalizeText(a?.area) === targetArea
              );
              if (areaResult) {
                totalGasto = toNumber((areaResult as any).totalGasto);
                cantidadMovimientos = toNumber((areaResult as any).cantidadMovimientos);
              }
            } else if (comparison.type === "proyecto" && comparison.proyecto) {
              const targetProject = normalizeText(comparison.proyecto);

              areaData.forEach((area: any) => {
                const areaAsProjectMatch = normalizeText(area?.proyecto || area?.area) === targetProject;
                if (areaAsProjectMatch) {
                  totalGasto += toNumber(area?.totalGasto);
                  cantidadMovimientos += toNumber(area?.cantidadMovimientos);
                }

                const proyectos = Array.isArray(area?.proyectos) ? area.proyectos : [];
                const proyectoResult = proyectos.find(
                  (p: any) =>
                    normalizeText(p?.proyecto || p?.area || p?.nombre) === targetProject
                );
                if (proyectoResult) {
                  totalGasto += toNumber((proyectoResult as any).totalGasto);
                  cantidadMovimientos += toNumber((proyectoResult as any).cantidadMovimientos);
                }
              });
            }

            if (totalGasto === 0 && cantidadMovimientos === 0) {
              totalGasto = monthlyTotalGasto;
              cantidadMovimientos = monthlyMovimientos;
            }

            const monthlyComparisonData: MonthlyComparisonData[] = monthlyData.map(
              (item: any) => ({
                mes: formatMonthLabel(item.mes),
                rawMes: item.mes,
                totalGasto: toNumber(item.totalGasto ?? item.gasto),
                cantidadMovimientos: toNumber(item.cantidadMovimientos ?? item.movimientos),
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
