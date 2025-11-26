import React, { useEffect } from "react";
import { BarChart3, AlertTriangle, LayoutDashboard } from "lucide-react";
import { ExpenseReportPage } from "../features/reports/components/ExpenseReportPage";
import { StockAlertPage } from "../features/reports/components/StockAlertPage";
import { StockDashboardPage } from "../features/reports/components/StockDashboardPage";
import { useSearchParams } from "react-router-dom";

type ReportType =
  | "stock-dashboard"
  | "expenses"
  | "stock-alerts"
  | "inventory"
  | "movements";

interface ReportDefinition {
  id: ReportType;
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  component: React.ComponentType;
}

const REPORTS: ReportDefinition[] = [
  {
    id: "stock-dashboard",
    title: "Dashboard de Stock",
    description: "Métricas y análisis del inventario",
    icon: LayoutDashboard,
    component: StockDashboardPage,
  },
  {
    id: "expenses",
    title: "Reporte de Gastos",
    description: "Análisis de gastos por área y proyecto",
    icon: BarChart3,
    component: ExpenseReportPage,
  },
  {
    id: "stock-alerts",
    title: "Alertas de Stock",
    description: "Productos con stock por debajo del mínimo",
    icon: AlertTriangle,
    component: StockAlertPage,
  },
];

const isValidReportType = (value: string | null): value is ReportType =>
  value != null && REPORTS.some((report) => report.id === value);

export const ReportsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = searchParams.get("tab");
  const activeReport: ReportType = isValidReportType(tabParam)
    ? tabParam
    : "stock-dashboard";

  useEffect(() => {
    // Solo actualizar si no hay parámetro o si es inválido
    if (!tabParam || !isValidReportType(tabParam)) {
      setSearchParams({ tab: "stock-dashboard" }, { replace: true });
    }
  }, [tabParam, setSearchParams]);

  const handleReportChange = (reportId: ReportType) => {
    setSearchParams({ tab: reportId });
  };

  // Optimización: Renderizar solo el componente activo
  const ActiveComponent = REPORTS.find((r) => r.id === activeReport)?.component;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Navigation Tabs - Responsive */}
      <div className="bg-white border-b border-gray-200 dark:border-slate-800 dark:bg-slate-900">
        <nav className="flex px-2 -mb-px overflow-x-auto sm:px-0 sm:space-x-8 scrollbar-hide">
          {REPORTS.map((report) => {
            const Icon = report.icon;
            return (
              <button
                key={report.id}
                onClick={() => handleReportChange(report.id)}
                className={`flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-1 py-3 sm:py-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                  activeReport === report.id
                    ? "border-green-500 text-green-600 dark:text-emerald-300"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-slate-200"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{report.title}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content - Solo renderiza el componente activo */}
      <div className="px-0 pb-8 mx-auto max-w-7xl sm:px-4 lg:px-8">
        {ActiveComponent && (
          <React.Suspense
            fallback={
              <div className="flex items-center justify-center h-64">
                <div className="w-12 h-12 border-b-2 border-green-500 rounded-full animate-spin"></div>
              </div>
            }
          >
            <ActiveComponent />
          </React.Suspense>
        )}
      </div>
    </div>
  );
};
