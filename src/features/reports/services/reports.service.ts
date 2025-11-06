import { apiClient } from "../../../shared/services/api";
import { config } from "../../../shared/config";
import {
  ExpenseReport,
  MonthlyExpenseData,
  AreaExpenseData,
  ReportFilters,
} from "../types";

const normalizeDateValue = (
  value: string,
  position: "start" | "end"
): string => {
  if (!value) {
    return value;
  }
  const monthPattern = /^\d{4}-\d{2}$/;
  if (monthPattern.test(value)) {
    const [yearStr, monthStr] = value.split("-");
    const year = Number(yearStr);
    const month = Number(monthStr);
    if (!year || !month) {
      return value;
    }
    if (position === "start") {
      return `${value}-01`;
    }
    const lastDay = new Date(year, month, 0).getDate();
    return `${value}-${String(lastDay).padStart(2, "0")}`;
  }
  return value;
};

const buildParams = (filters: ReportFilters) => {
  const params = new URLSearchParams();
  const startDate = normalizeDateValue(filters.fechaInicio, "start");
  const endDate = normalizeDateValue(filters.fechaFin, "end");
  params.append("fechaInicio", startDate);
  params.append("fechaFin", endDate);
  if (filters.area) params.append("area", filters.area);
  if (filters.proyecto) params.append("proyecto", filters.proyecto);
  params.append("tipoReporte", filters.tipoReporte);
  return params;
};

class ReportsService {
  async getExpenseReports(filters: ReportFilters): Promise<ExpenseReport[]> {
    const params = buildParams(filters);

    const response = await apiClient.get<ExpenseReport[]>(
      `/reports/expenses?${params.toString()}`
    );

    if (response.error) {
      console.error("Error fetching expense reports:", response.error);
      return [];
    }

    return response.data || [];
  }

  async getMonthlyExpenseData(
    filters: ReportFilters
  ): Promise<MonthlyExpenseData[]> {
    const params = buildParams(filters);

    const response = await apiClient.get<MonthlyExpenseData[]>(
      `/reports/expenses/monthly?${params.toString()}`
    );

    if (response.error) {
      console.error("Error fetching monthly expense data:", response.error);
      return [];
    }

    return response.data || [];
  }

  async getAreaExpenseData(filters: ReportFilters): Promise<AreaExpenseData[]> {
    const params = buildParams(filters);

    const response = await apiClient.get<AreaExpenseData[]>(
      `/reports/expenses/area?${params.toString()}`
    );

    if (response.error) {
      console.error("Error fetching area expense data:", response.error);
      return [];
    }

    return response.data || [];
  }

  async exportExpenseReport(filters: ReportFilters): Promise<Blob | null> {
    try {
      const params = buildParams(filters);

      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        `${config.apiUrl}/reports/expenses/export?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to export expense report");
      }

      return await response.blob();
    } catch (error) {
      console.error("Error exporting expense report:", error);
      return null;
    }
  }

  async exportToPDF(
    data: ExpenseReport[],
    filters: ReportFilters
  ): Promise<Blob | null> {
    try {
      const response = await apiClient.post("/reports/expenses/export-pdf", {
        data,
        filters: {
          ...filters,
          fechaInicio: normalizeDateValue(filters.fechaInicio, "start"),
          fechaFin: normalizeDateValue(filters.fechaFin, "end"),
        },
      });

      if (response.error) {
        console.error("Error exporting to PDF:", response.error);
        return null;
      }

      return response.data as Blob;
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      return null;
    }
  }
}

export const reportsService = new ReportsService();
