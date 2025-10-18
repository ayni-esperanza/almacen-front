import { useState, useEffect } from 'react';
import { reportsService } from '../services/reports.service';
import {
  ExpenseReport,
  MonthlyExpenseData,
  AreaExpenseData,
  ReportFilters,
  ChartData
} from '../types';

const formatMonthValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

const formatMonthLabel = (value: string) => {
  if (!value) return '';
  const [yearStr, monthStr] = value.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  if (!year || !month) {
    return value;
  }
  return new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(
    new Date(year, month - 1, 1)
  );
};

export const useReports = () => {
  const [expenseReports, setExpenseReports] = useState<ExpenseReport[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyExpenseData[]>([]);
  const [areaData, setAreaData] = useState<AreaExpenseData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ReportFilters>(() => {
    const currentMonth = formatMonthValue(new Date());
    return {
      fechaInicio: currentMonth,
      fechaFin: currentMonth,
      tipoReporte: 'area'
    };
  });

  const fetchExpenseReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportsService.getExpenseReports(filters);
      setExpenseReports(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar reportes');
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportsService.getMonthlyExpenseData(filters);
      setMonthlyData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos mensuales');
    } finally {
      setLoading(false);
    }
  };

  const fetchAreaData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportsService.getAreaExpenseData(filters);
      setAreaData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos por área');
    } finally {
      setLoading(false);
    }
  };

  const updateFilters = (newFilters: Partial<ReportFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const generateChartData = (): ChartData[] => {
    if (filters.tipoReporte === 'area') {
      return areaData.map(area => ({
        name: area.area,
        gasto: area.totalGasto,
        movimientos: area.cantidadMovimientos
      }));
    } else {
      // Para reportes por proyecto, agrupar por proyecto
      const projectData = new Map<string, { gasto: number; movimientos: number }>();
      
      areaData.forEach(area => {
        area.proyectos.forEach(proyecto => {
          const existing = projectData.get(proyecto.proyecto) || { gasto: 0, movimientos: 0 };
          projectData.set(proyecto.proyecto, {
            gasto: existing.gasto + proyecto.totalGasto,
            movimientos: existing.movimientos + proyecto.cantidadMovimientos
          });
        });
      });

      return Array.from(projectData.entries()).map(([proyecto, data]) => ({
        name: proyecto,
        gasto: data.gasto,
        movimientos: data.movimientos
      }));
    }
  };

  const getMonthlyChartData = (): ChartData[] => {
    return monthlyData.map(item => ({
      name: item.mes ? formatMonthLabel(item.mes) : 'Sin Mes',
      gasto: item.totalGasto,
      movimientos: item.cantidadMovimientos
    }));
  };

  const exportToPDF = async (): Promise<void> => {
    try {
      const blob = await reportsService.exportExpenseReport(filters);
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte-gastos-${filters.fechaInicio}-${filters.fechaFin}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al exportar PDF');
    }
  };

  useEffect(() => {
    fetchExpenseReports();
    fetchMonthlyData();
    fetchAreaData();
  }, [filters]);

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
    refetch: () => {
      fetchExpenseReports();
      fetchMonthlyData();
      fetchAreaData();
    }
  };
};
