import { useState, useEffect } from 'react';
import { reportsService } from '../services/reports.service';
import { pdfExportService } from '../services/pdf-export.service';
import { 
  ExpenseReport, 
  MonthlyExpenseData, 
  AreaExpenseData, 
  ReportFilters,
  ChartData 
} from '../types';
// Removidas las importaciones de date-fns para evitar problemas
import { 
  mockExpenseReports, 
  mockMonthlyExpenseData, 
  mockAreaExpenseData,
  filterExpenseReports,
  generateMonthlyData,
  generateAreaData
} from '../utils/mockData';

export const useReports = () => {
  const [expenseReports, setExpenseReports] = useState<ExpenseReport[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyExpenseData[]>([]);
  const [areaData, setAreaData] = useState<AreaExpenseData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ReportFilters>({
    fechaInicio: new Date().toISOString().split('T')[0].substring(0, 7) + '-01',
    fechaFin: new Date().toISOString().split('T')[0],
    tipoReporte: 'area'
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
      name: `Enero 2025`, // Simplificado para el ejemplo
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
