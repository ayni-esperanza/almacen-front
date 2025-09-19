import { apiClient } from '../../../shared/services/api';
import { 
  ExpenseReport, 
  MonthlyExpenseData, 
  AreaExpenseData, 
  ReportFilters 
} from '../types';

class ReportsService {
  async getExpenseReports(filters: ReportFilters): Promise<ExpenseReport[]> {
    const params = new URLSearchParams();
    params.append('fechaInicio', filters.fechaInicio);
    params.append('fechaFin', filters.fechaFin);
    if (filters.area) params.append('area', filters.area);
    if (filters.proyecto) params.append('proyecto', filters.proyecto);
    params.append('tipoReporte', filters.tipoReporte);

    const response = await apiClient.get<ExpenseReport[]>(`/reports/expenses?${params.toString()}`);
    
    if (response.error) {
      console.error('Error fetching expense reports:', response.error);
      return [];
    }
    
    return response.data || [];
  }

  async getMonthlyExpenseData(filters: ReportFilters): Promise<MonthlyExpenseData[]> {
    const params = new URLSearchParams();
    params.append('fechaInicio', filters.fechaInicio);
    params.append('fechaFin', filters.fechaFin);
    if (filters.area) params.append('area', filters.area);
    if (filters.proyecto) params.append('proyecto', filters.proyecto);
    params.append('tipoReporte', filters.tipoReporte);

    const response = await apiClient.get<MonthlyExpenseData[]>(`/reports/expenses/monthly?${params.toString()}`);
    
    if (response.error) {
      console.error('Error fetching monthly expense data:', response.error);
      return [];
    }
    
    return response.data || [];
  }

  async getAreaExpenseData(filters: ReportFilters): Promise<AreaExpenseData[]> {
    const params = new URLSearchParams();
    params.append('fechaInicio', filters.fechaInicio);
    params.append('fechaFin', filters.fechaFin);
    if (filters.area) params.append('area', filters.area);
    if (filters.proyecto) params.append('proyecto', filters.proyecto);
    params.append('tipoReporte', filters.tipoReporte);

    const response = await apiClient.get<AreaExpenseData[]>(`/reports/expenses/area?${params.toString()}`);
    
    if (response.error) {
      console.error('Error fetching area expense data:', response.error);
      return [];
    }
    
    return response.data || [];
  }

  async exportExpenseReport(filters: ReportFilters): Promise<Blob | null> {
    try {
      const params = new URLSearchParams();
      params.append('fechaInicio', filters.fechaInicio);
      params.append('fechaFin', filters.fechaFin);
      if (filters.area) params.append('area', filters.area);
      if (filters.proyecto) params.append('proyecto', filters.proyecto);
      params.append('tipoReporte', filters.tipoReporte);

      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:3000/reports/expenses/export?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to export expense report');
      }

      return await response.blob();
    } catch (error) {
      console.error('Error exporting expense report:', error);
      return null;
    }
  }

  async exportToPDF(data: ExpenseReport[], filters: ReportFilters): Promise<Blob | null> {
    try {
      const response = await apiClient.post('/reports/expenses/export-pdf', {
        data,
        filters
      });
      
      if (response.error) {
        console.error('Error exporting to PDF:', response.error);
        return null;
      }
      
      return response.data as Blob;
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      return null;
    }
  }
}

export const reportsService = new ReportsService();
