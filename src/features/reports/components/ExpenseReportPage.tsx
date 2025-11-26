import React, {
  useState,
  useEffect,
  useRef,
  Suspense,
  useMemo,
  useCallback,
} from "react";
import { Download, FileText, BarChart3 } from "lucide-react";
import { useReports } from "../hooks/useReports";
import { ReportFilters } from "./ReportFilters";
import { ReportFilters as ReportFiltersType } from "../types";
import { ChartType } from "./ExpenseReportChart";

const ExpenseReportChart = React.lazy(() =>
  import("./ExpenseReportChart").then((module) => ({
    default: module.ExpenseReportChart,
  }))
);

const ExpenseReportTable = React.lazy(() =>
  import("./ExpenseReportTable").then((module) => ({
    default: module.ExpenseReportTable,
  }))
);

const DEFAULT_AREAS = [
  "ALMACEN",
  "CONTABILIDAD",
  "ELECTRICIDAD",
  "EXTRUSORA",
  "FIBRA",
  "LINEAS DE VIDA",
  "MECANICA",
  "METALMECANICA",
  "OFICINA",
  "POZOS",
  "TORRES DE ENFRIAMIENTO",
];
const SIN_AREA_LABEL = "Sin área";

const normalizeLabel = (value?: string | null) =>
  value?.trim().toLowerCase() ?? "";
const isProjectLabel = (value?: string | null) => {
  const normalized = normalizeLabel(value);
  if (!normalized) return false;
  return normalized.startsWith("proyecto") || normalized.startsWith("proy ");
};

export const ExpenseReportPage: React.FC = () => {
  const {
    expenseReports,
    areaData,
    loading,
    error,
    filters,
    updateFilters,
    generateChartData,
    getMonthlyChartData,
    exportToPDF,
  } = useReports();

  const [areas, setAreas] = useState<string[]>(DEFAULT_AREAS);
  const [proyectos, setProyectos] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"chart" | "table">("chart");
  const [mainChartType, setMainChartType] = useState<ChartType>("bar");
  const [monthlyChartType, setMonthlyChartType] = useState<ChartType>("bar");
  const [dashboardVisible, setDashboardVisible] = useState(false);
  const dashboardRef = useRef<HTMLDivElement | null>(null);
  const cardClasses =
    "rounded-lg border border-transparent bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900";
  const statCardClasses =
    "rounded-lg border border-transparent bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900";

  // Optimización: Memoizar cálculo de áreas y proyectos
  const { areas: computedAreas, proyectos: computedProyectos } = useMemo(() => {
    const uniqueProjects = new Set<string>();
    const uniqueAreas = new Set<string>(DEFAULT_AREAS);

    areaData.forEach((area) => {
      if (area.area) {
        if (isProjectLabel(area.area)) {
          uniqueProjects.add(area.area);
        } else {
          uniqueAreas.add(area.area);
        }
      }

      area.proyectos.forEach((proyecto) => {
        if (proyecto.proyecto) {
          uniqueProjects.add(proyecto.proyecto);
        }
      });
    });

    // Garantizar que también se consideren áreas de registros individuales
    expenseReports.forEach((report) => {
      if (report.area) {
        if (isProjectLabel(report.area)) {
          uniqueProjects.add(report.area);
        } else {
          uniqueAreas.add(report.area);
        }
      }
      if (report.proyecto) {
        uniqueProjects.add(report.proyecto);
      }
    });

    const derivedAreas = Array.from(uniqueAreas).filter(Boolean);
    const derivedProjects = Array.from(uniqueProjects).filter(Boolean);
    const projectLookup = new Set(
      derivedProjects.map((project) => normalizeLabel(project)).filter(Boolean)
    );

    const merged = new Set<string>([...DEFAULT_AREAS, ...derivedAreas]);
    const filtered = Array.from(merged).filter((area) => {
      const normalized = normalizeLabel(area);
      if (!normalized || normalized === normalizeLabel(SIN_AREA_LABEL)) {
        return true;
      }
      return !projectLookup.has(normalized);
    });

    const ordered = filtered.sort((a, b) => a.localeCompare(b));
    const sinAreaIndex = ordered.findIndex(
      (area) => area.toLowerCase() === SIN_AREA_LABEL.toLowerCase()
    );
    if (sinAreaIndex !== -1) {
      const [sinArea] = ordered.splice(sinAreaIndex, 1);
      ordered.push(sinArea);
    }

    const mergedProjects = new Set<string>([...derivedProjects]);
    const sortedProjects = Array.from(mergedProjects).sort();

    return {
      areas: ordered,
      proyectos: sortedProjects,
    };
  }, [areaData, expenseReports]);

  // Actualizar estados solo cuando cambian los valores computados
  useEffect(() => {
    setAreas(computedAreas);
  }, [computedAreas]);

  useEffect(() => {
    setProyectos(computedProyectos);
  }, [computedProyectos]);

  useEffect(() => {
    if (dashboardVisible) return;

    const target = dashboardRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setDashboardVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [dashboardVisible, expenseReports.length]);

  const handleExportPDF = useCallback(async () => {
    try {
      // Exportar según la pestaña activa
      await exportToPDF(activeTab, mainChartType, monthlyChartType);
    } catch (error) {
      console.error("Error exporting PDF:", error);
    }
  }, [exportToPDF, activeTab, mainChartType, monthlyChartType]);

  const getChartTitle = useCallback(() => {
    const baseTitle =
      filters.tipoReporte === "area"
        ? "Gastos por Área"
        : "Gastos por Proyecto";
    const dateRange = `${filters.fechaInicio} - ${filters.fechaFin}`;
    return `${baseTitle} (${dateRange})`;
  }, [filters.tipoReporte, filters.fechaInicio, filters.fechaFin]);

  const getMonthlyChartTitle = useCallback(() => {
    return `Gastos Mensuales (${filters.fechaInicio} - ${filters.fechaFin})`;
  }, [filters.fechaInicio, filters.fechaFin]);

  const renderSuspenseFallback = (message: string) => (
    <div className="flex items-center justify-center py-12 text-sm text-gray-500 dark:text-slate-400">
      {message}
    </div>
  );

  const handleFiltersChange = useCallback(
    (newFilters: Partial<ReportFiltersType>) => {
      const payload: Partial<ReportFiltersType> = { ...newFilters };

      if ("tipoReporte" in newFilters) {
        if (newFilters.tipoReporte === "area") {
          payload.proyecto = undefined;
        } else if (newFilters.tipoReporte === "proyecto") {
          payload.area = undefined;
        }
      }

      if ("area" in newFilters) {
        payload.proyecto = undefined;
      }

      if ("proyecto" in newFilters) {
        payload.area = undefined;
      }

      updateFilters(payload);
    },
    [updateFilters]
  );

  // Optimización: Memoizar estadísticas
  const statistics = useMemo(
    () => ({
      totalGastos: expenseReports.reduce(
        (sum, item) => sum + item.costoTotal,
        0
      ),
      totalMovimientos: expenseReports.length,
      areasInvolucradas: new Set(expenseReports.map((item) => item.area)).size,
      proyectosInvolucrados: new Set(
        expenseReports
          .filter((item) => item.proyecto)
          .map((item) => item.proyecto!)
      ).size,
    }),
    [expenseReports]
  );

  if (error) {
    return (
      <div className="p-6">
        <div className="p-4 border border-red-200 rounded-lg bg-red-50 dark:border-rose-500/40 dark:bg-rose-500/10">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="w-5 h-5 text-red-400 dark:text-rose-300"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-rose-200">
                Error al cargar reportes
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-rose-200/80">
                {error}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-4 sm:p-6 sm:space-y-6">
      {/* Resumen de estadísticas */}
      {!loading && expenseReports.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className={statCardClasses}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/15">
                  <svg
                    className="w-5 h-5 text-emerald-600 dark:text-emerald-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
                  Total Gastos
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                  {new Intl.NumberFormat("es-PE", {
                    style: "currency",
                    currency: "PEN",
                    minimumFractionDigits: 2,
                  }).format(statistics.totalGastos)}
                </p>
              </div>
            </div>
          </div>

          <div className={statCardClasses}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg dark:bg-sky-500/15">
                  <svg
                    className="w-5 h-5 text-blue-600 dark:text-sky-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
                  Total Movimientos
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                  {statistics.totalMovimientos}
                </p>
              </div>
            </div>
          </div>

          <div className={statCardClasses}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-lg dark:bg-violet-500/15">
                  <svg
                    className="w-5 h-5 text-purple-600 dark:text-violet-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
                  Áreas Involucradas
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                  {statistics.areasInvolucradas}
                </p>
              </div>
            </div>
          </div>

          <div className={statCardClasses}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-lg dark:bg-amber-500/15">
                  <svg
                    className="w-5 h-5 text-yellow-600 dark:text-amber-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
                  Proyectos Involucrados
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                  {statistics.proyectosInvolucrados}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <ReportFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        areas={areas}
        proyectos={proyectos}
      />

      <div ref={dashboardRef} className="min-h-[1px]">
        {!loading &&
          expenseReports.length > 0 &&
          (dashboardVisible ? (
            <div className={cardClasses}>
              <div className="border-b border-gray-200 dark:border-slate-800">
                <nav className="flex items-center justify-between px-6 -mb-px">
                  <div className="flex space-x-8">
                    <button
                      onClick={() => setActiveTab("chart")}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === "chart"
                          ? "border-green-500 text-green-600 dark:text-emerald-300"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <BarChart3 className="w-4 h-4" />
                        <span>Gráficos</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab("table")}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === "table"
                          ? "border-green-500 text-green-600 dark:text-emerald-300"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4" />
                        <span>Tabla de Datos</span>
                      </div>
                    </button>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleExportPDF}
                      disabled={loading}
                      className="flex items-center px-4 py-2 space-x-2 text-green-600 transition-colors bg-green-500 rounded-lg bg-opacity-10 dark:text-emerald-300 hover:bg-opacity-20 disabled:opacity-50"
                    >
                      <Download className="w-4 h-4" />
                      <span>
                        Exportar {activeTab === "chart" ? "Gráficos" : "Tabla"}
                      </span>
                    </button>
                  </div>
                </nav>
              </div>

              <div className="p-6">
                <Suspense
                  fallback={renderSuspenseFallback(
                    activeTab === "chart"
                      ? "Cargando gráficos..."
                      : "Cargando tabla..."
                  )}
                >
                  {activeTab === "chart" ? (
                    <div className="space-y-6">
                      <ExpenseReportChart
                        data={generateChartData}
                        title={getChartTitle()}
                        loading={loading}
                        chartType={mainChartType}
                        onChartTypeChange={setMainChartType}
                      />

                      <ExpenseReportChart
                        data={getMonthlyChartData}
                        title={getMonthlyChartTitle()}
                        loading={loading}
                        chartType={monthlyChartType}
                        onChartTypeChange={setMonthlyChartType}
                      />
                    </div>
                  ) : (
                    <ExpenseReportTable
                      data={expenseReports}
                      loading={loading}
                    />
                  )}
                </Suspense>
              </div>
            </div>
          ) : (
            <div className={`${cardClasses} animate-pulse`}>
              <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-800">
                <div className="w-40 h-5 bg-gray-200 rounded dark:bg-slate-800" />
              </div>
              <div className="p-6 space-y-4">
                <div className="h-64 bg-gray-200 rounded dark:bg-slate-800" />
                <div className="h-64 bg-gray-200 rounded dark:bg-slate-800" />
              </div>
            </div>
          ))}
      </div>

      {/* Mensaje informativo cuando no hay datos */}
      {!loading && expenseReports.length === 0 && (
        <div className={cardClasses}>
          <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
            <FileText className="w-10 h-10 text-gray-300 dark:text-slate-600" />
            <div>
              <p className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                Sin resultados con estos filtros
              </p>
              <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
                Ajusta el rango de fechas o cambia el área/proyecto para
                visualizar movimientos.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
