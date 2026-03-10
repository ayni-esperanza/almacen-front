import React, { useState, useMemo, useEffect } from "react";
import { Search, ChevronUp, ChevronDown, Info, LayoutGrid, Grid2X2 } from "lucide-react";
import { useComparisonReport } from "../hooks/useComparisonReport";
import { useReports } from "../hooks/useReports";
import { ComparisonSelector } from "./ComparisonSelector";
import { ComparisonChart, ComparisonChartType } from "./ComparisonChart";
import { reportsService } from "../services/reports.service";
import { ExpenseReport } from "../types";

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

export const ComparisonReportPage: React.FC = () => {
  const {
    comparisons,
    comparisonData,
    loading,
    error,
    addComparison,
    removeComparison,
    updateVisualizationType,
  } = useComparisonReport();

  const {
    areaData,
    expenseReports,
    loading: reportsLoading,
  } = useReports();

  const [chartType, setChartType] = useState<ComparisonChartType>("bar");
  const [extraProjects, setExtraProjects] = useState<string[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [barOrientation, setBarOrientation] = useState<"horizontal" | "vertical">(
    "horizontal"
  );
  const [detailSelection, setDetailSelection] = useState<
    { comparisonId: string; rawMonth?: string } | null
  >(null);
  const [productDetail, setProductDetail] = useState<{
    loading: boolean;
    items: ExpenseReport[];
    error: string | null;
  }>({ loading: false, items: [], error: null });
  const [searchTerm, setSearchTerm] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [chartLayout, setChartLayout] = useState<"stacked" | "side-by-side">("stacked");
  const [individualChartTypes, setIndividualChartTypes] = useState<Record<string, ComparisonChartType>>({});

  // Cerrar popover de info al colapsar
  useEffect(() => {
    if (isCollapsed) {
      setShowInfo(false);
    }
  }, [isCollapsed]);

  // Derivar áreas y proyectos exactamente igual que ExpenseReportPage
  const { areas, proyectos } = useMemo(() => {
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

      if (area.proyectos && Array.isArray(area.proyectos)) {
        area.proyectos.forEach((proyecto) => {
          if (proyecto.proyecto) {
            uniqueProjects.add(proyecto.proyecto);
          }
        });
      }
    });

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

    const sortedProjects = Array.from(new Set([...derivedProjects])).sort();

    return {
      areas: ordered,
      proyectos: sortedProjects,
    };
  }, [areaData, expenseReports]);

  // Fallback: si no llegaron proyectos aún, consulta explícita con tipoReporte "proyecto"
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setProjectsLoading(true);
        const today = new Date();
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        const formatMonthValue = (date: Date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          return `${year}-${month}`;
        };

        const areaDataProjects = await reportsService.getAreaExpenseData({
          fechaInicio: formatMonthValue(startOfYear),
          fechaFin: formatMonthValue(today),
          tipoReporte: "proyecto",
        });

        const projectsSet = new Set<string>();
        areaDataProjects.forEach((area: any) => {
          if (Array.isArray(area.proyectos)) {
            area.proyectos.forEach((p: any) => {
              if (p?.proyecto) {
                projectsSet.add(p.proyecto);
              }
            });
          }
        });

        setExtraProjects(Array.from(projectsSet).filter(Boolean).sort());
      } catch (err) {
        console.error("Error cargando proyectos adicionales", err);
      } finally {
        setProjectsLoading(false);
      }
    };

    if (proyectos.length === 0 && extraProjects.length === 0 && !projectsLoading) {
      fetchProjects();
    }
  }, [proyectos.length, extraProjects.length, projectsLoading]);

  const mergedProjects = useMemo(() => {
    const all = new Set<string>([...proyectos, ...extraProjects]);
    return Array.from(all).filter(Boolean).sort();
  }, [proyectos, extraProjects]);

  const detailData = useMemo(() => {
    if (!detailSelection) return null;
    const comparison = comparisonData.find(
      (c) => c.id === detailSelection.comparisonId
    );
    if (!comparison) return null;

    const filteredRows = detailSelection.rawMonth
      ? comparison.monthlyData.filter(
          (m) => m.rawMes === detailSelection.rawMonth || m.mes === detailSelection.rawMonth
        )
      : comparison.monthlyData;

    return {
      comparison,
      rows: filteredRows.length > 0 ? filteredRows : comparison.monthlyData,
    };
  }, [detailSelection, comparisonData]);

  useEffect(() => {
    if (!detailSelection) return;
    const exists = comparisonData.some((c) => c.id === detailSelection.comparisonId);
    if (!exists) {
      setDetailSelection(null);
    }
  }, [comparisonData, detailSelection]);

  const parseMonthRange = (rawMonth?: string) => {
    if (!rawMonth) return null;
    if (rawMonth.includes("-")) {
      const [yearStr, monthStr] = rawMonth.split("-");
      const year = Number(yearStr);
      const month = Number(monthStr);
      if (!Number.isNaN(year) && !Number.isNaN(month)) {
        const start = `${year}-${String(month).padStart(2, "0")}-01`;
        const lastDay = new Date(year, month, 0).getDate();
        const end = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
        return { start, end };
      }
    }
    if (rawMonth.includes("/")) {
      const [monthStr, yearStr] = rawMonth.split("/");
      const year = Number(yearStr);
      const month = Number(monthStr);
      if (!Number.isNaN(year) && !Number.isNaN(month)) {
        const start = `${year}-${String(month).padStart(2, "0")}-01`;
        const lastDay = new Date(year, month, 0).getDate();
        const end = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
        return { start, end };
      }
    }
    return null;
  };

  useEffect(() => {
    if (!detailSelection?.rawMonth) {
      setProductDetail((prev) => ({ ...prev, items: [], error: null }));
      setSearchTerm(""); // Limpiar buscador al cambiar de selección
      return;
    }

    const comparison = comparisonData.find(
      (c) => c.id === detailSelection.comparisonId
    );
    const range = parseMonthRange(detailSelection.rawMonth);
    if (!comparison || !range) {
      setProductDetail((prev) => ({ ...prev, items: [], error: null }));
      setSearchTerm(""); // Limpiar buscador si no hay datos válidos
      return;
    }

    const filters: any = {
      fechaInicio: range.start,
      fechaFin: range.end,
      tipoReporte: "area",
    };

    if (comparisonData.length > 0) {
      const source = comparisons.find((c) => c.id === comparison.id);
      if (source?.type === "proyecto" && source.proyecto) {
        filters.tipoReporte = "proyecto";
        filters.proyecto = source.proyecto;
      } else if (source?.type === "area" && source.area) {
        filters.area = source.area;
      }
    }

    setSearchTerm(""); // Limpiar buscador al cargar nuevos productos
    setProductDetail({ loading: true, items: [], error: null });
    reportsService
      .getExpenseReports(filters)
      .then((items) => {
        setProductDetail({ loading: false, items, error: null });
      })
      .catch((err) => {
        setProductDetail({
          loading: false,
          items: [],
          error: err instanceof Error ? err.message : "No se pudieron cargar los productos",
        });
      });
  }, [detailSelection, comparisonData, comparisons]);

  const cardClasses =
    "rounded-lg border border-transparent bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900";

  // Componentes de gráficos - reorganizado para soportar múltiples gráficos
  const chartsSection = (
    <>
      {/* Gráficos de Comparación */}
      {comparisons.length > 0 && (
        <>
          {chartLayout === "side-by-side" ? (
            // Mostrar gráficos individuales lado a lado (todos)
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {comparisonData.map((comparison) => (
                <ComparisonChart
                  key={comparison.id}
                  data={[comparison]}
                  chartType={individualChartTypes[comparison.id] || chartType}
                  onChartTypeChange={(type) => {
                    setIndividualChartTypes(prev => ({ ...prev, [comparison.id]: type }));
                  }}
                  loading={loading}
                  onSelectItem={(id, opts) => setDetailSelection({ comparisonId: id, rawMonth: opts?.rawMonth })}
                  barOrientation={barOrientation}
                  onBarOrientationChange={setBarOrientation}
                />
              ))}
            </div>
          ) : (
            // Mostrar todos los gráficos en un solo contenedor (vista apilada)
            <ComparisonChart
              data={comparisonData}
              chartType={chartType}
              onChartTypeChange={setChartType}
              loading={loading}
              onSelectItem={(id, opts) => setDetailSelection({ comparisonId: id, rawMonth: opts?.rawMonth })}
              barOrientation={barOrientation}
              onBarOrientationChange={setBarOrientation}
            />
          )}
        </>
      )}
    </>
  );

  // Componentes de tablas
  const tablesSection = (
    <>
      {detailData && detailData.rows.length > 0 && (
        <div className={cardClasses}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: detailData!.comparison.color }}
              />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-100">
                Detalle seleccionado: {detailData!.comparison.label}
              </h3>
            </div>
            <button
              onClick={() => setDetailSelection(null)}
              className="text-sm text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-100"
            >
              Limpiar selección
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[600px] w-full text-xs text-gray-700 dark:text-slate-200">
              <thead className="bg-gray-50 dark:bg-slate-900">
                <tr className="border-b border-gray-200 dark:border-slate-800">
                  <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 shadow-sm bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                    Mes
                  </th>
                  <th className="px-3 py-3 text-xs font-semibold text-right text-gray-700 shadow-sm bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                    Total Gasto
                  </th>
                  <th className="px-3 py-3 text-xs font-semibold text-right text-gray-700 shadow-sm bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                    Movimientos
                  </th>
                  <th className="px-3 py-3 text-xs font-semibold text-right text-gray-700 shadow-sm bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                    Gasto Promedio
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100 dark:divide-slate-800 dark:bg-slate-950">
                {detailData!.rows.map((row, idx) => (
                  <tr
                    key={`${row.mes}-${idx}`}
                    className="border-b border-gray-100 dark:border-slate-800 last:border-0"
                  >
                    <td className="px-3 py-2 text-xs text-gray-900 dark:text-slate-100">
                      {row.mes}
                    </td>
                    <td className="px-3 py-2 text-xs text-right font-medium" style={{ color: detailData!.comparison.color }}>
                      {new Intl.NumberFormat("es-PE", {
                        style: "currency",
                        currency: "PEN",
                      }).format(row.totalGasto)}
                    </td>
                    <td className="px-3 py-2 text-xs text-right text-gray-600 dark:text-slate-400">
                      {row.cantidadMovimientos}
                    </td>
                    <td className="px-3 py-2 text-xs text-right text-gray-600 dark:text-slate-400">
                      {row.cantidadMovimientos > 0
                        ? new Intl.NumberFormat("es-PE", {
                            style: "currency",
                            currency: "PEN",
                          }).format(row.totalGasto / row.cantidadMovimientos)
                        : "S/. 0.00"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-md font-semibold text-gray-800 dark:text-slate-100">
                Productos del mes seleccionado
              </h4>
              {productDetail.loading && (
                <span className="text-xs text-gray-500 dark:text-slate-400">Cargando...</span>
              )}
            </div>
            {productDetail.error && (
              <p className="text-sm text-red-600 dark:text-red-400 mb-2">{productDetail.error}</p>
            )}
            {productDetail.items.length === 0 && !productDetail.loading ? (
              <p className="text-sm text-gray-600 dark:text-slate-400">No hay productos para este mes.</p>
            ) : (
              <>
                {/* Buscador de productos */}
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-500" />
                    <input
                      type="text"
                      placeholder="Buscar por código o descripción..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100 dark:focus:border-green-400 dark:focus:ring-green-500/30 transition"
                    />
                  </div>
                </div>
                <div className="overflow-x-auto">
                <table className="min-w-[800px] w-full text-xs text-gray-700 dark:text-slate-200">
                  <thead className="bg-gray-50 dark:bg-slate-900">
                    <tr className="border-b border-gray-200 dark:border-slate-800">
                      <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 shadow-sm bg-gray-50 dark:bg-slate-900 dark:text-slate-300">Código</th>
                      <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 shadow-sm bg-gray-50 dark:bg-slate-900 dark:text-slate-300">Descripción</th>
                      <th className="px-3 py-3 text-xs font-semibold text-right text-gray-700 shadow-sm bg-gray-50 dark:bg-slate-900 dark:text-slate-300">Cantidad</th>
                      <th className="px-3 py-3 text-xs font-semibold text-right text-gray-700 shadow-sm bg-gray-50 dark:bg-slate-900 dark:text-slate-300">Costo total</th>
                      <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 shadow-sm bg-gray-50 dark:bg-slate-900 dark:text-slate-300">Responsable</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100 dark:divide-slate-800 dark:bg-slate-950">
                    {(() => {
                      const filteredItems = productDetail.items.filter((item) => {
                        if (!searchTerm.trim()) return true;
                        const search = searchTerm.toLowerCase();
                        return (
                          item.codigoProducto?.toLowerCase().includes(search) ||
                          item.descripcion?.toLowerCase().includes(search)
                        );
                      });

                      if (filteredItems.length === 0 && searchTerm.trim()) {
                        return (
                          <tr>
                            <td colSpan={5} className="px-3 py-8 text-center text-xs text-gray-500 dark:text-slate-400">
                              No se encontraron productos con "{searchTerm}"
                            </td>
                          </tr>
                        );
                      }

                      return filteredItems.map((item) => (
                        <tr key={item.id} className="border-b border-gray-100 dark:border-slate-800 last:border-0">
                          <td className="px-3 py-2 text-xs text-gray-900 dark:text-slate-100">{item.codigoProducto}</td>
                          <td className="px-3 py-2 text-xs text-gray-900 dark:text-slate-100">{item.descripcion}</td>
                          <td className="px-3 py-2 text-xs text-right text-gray-700 dark:text-slate-300">{item.cantidad}</td>
                          <td className="px-3 py-2 text-xs text-right font-medium" style={{ color: detailData!.comparison.color }}>
                            {new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(item.costoTotal)}
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-700 dark:text-slate-300">{item.responsable || "-"}</td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Tabla de Resumen */}
      {comparisonData.length > 0 && !loading && (
        <div className={cardClasses}>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-100 mb-4">
            Resumen de Comparaciones
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-[600px] w-full text-xs text-gray-700 dark:text-slate-200">
              <thead className="bg-gray-50 dark:bg-slate-900">
                <tr className="border-b border-gray-200 dark:border-slate-800">
                  <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 shadow-sm bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                    Comparación
                  </th>
                  <th className="px-3 py-3 text-xs font-semibold text-right text-gray-700 shadow-sm bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                    Total Gasto
                  </th>
                  <th className="px-3 py-3 text-xs font-semibold text-right text-gray-700 shadow-sm bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                    Movimientos
                  </th>
                  <th className="px-3 py-3 text-xs font-semibold text-right text-gray-700 shadow-sm bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                    Gasto Promedio
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100 dark:divide-slate-800 dark:bg-slate-950">
                {comparisonData.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-100 dark:border-slate-800 last:border-0"
                  >
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-xs text-gray-900 dark:text-slate-100">
                          {item.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <span
                        className="text-xs font-medium"
                        style={{ color: item.color }}
                      >
                        {new Intl.NumberFormat("es-PE", {
                          style: "currency",
                          currency: "PEN",
                        }).format(item.totalGasto)}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-right text-gray-600 dark:text-slate-400">
                      {item.cantidadMovimientos}
                    </td>
                    <td className="px-3 py-2 text-xs text-right text-gray-600 dark:text-slate-400">
                      {item.cantidadMovimientos > 0
                        ? new Intl.NumberFormat("es-PE", {
                            style: "currency",
                            currency: "PEN",
                          }).format(item.totalGasto / item.cantidadMovimientos)
                        : "S/. 0.00"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="space-y-6">
      {/* Selector de Comparaciones */}
      {reportsLoading || projectsLoading ? (
        <div className={cardClasses}>
          <div className="flex items-center justify-center h-24 gap-3">
            <div className="w-6 h-6 border-b-2 border-green-500 rounded-full animate-spin"></div>
            <span className="text-sm text-gray-500 dark:text-slate-400">
              Cargando áreas y proyectos...
            </span>
          </div>
        </div>
      ) : (
        <div className={cardClasses}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-100">
                Agregar Comparación
              </h3>
              {!isCollapsed && (
                <div className="relative">
                  <button
                    onClick={() => setShowInfo(!showInfo)}
                    className="rounded-full p-1 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition"
                    title="Cómo usar"
                  >
                    <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </button>
                  {showInfo && (
                    <div className="absolute left-0 top-8 z-10 w-72 rounded-lg border border-blue-200 bg-white p-3 text-sm shadow-lg dark:border-slate-700 dark:bg-slate-900">
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-semibold text-blue-700 dark:text-blue-300">Guía rápida</span>
                        <button
                          onClick={() => setShowInfo(false)}
                          className="text-xs text-gray-500 hover:text-gray-800 dark:text-slate-400 dark:hover:text-slate-100"
                        >
                          Cerrar
                        </button>
                      </div>
                      <ul className="mt-2 space-y-1 text-blue-700 dark:text-blue-200">
                        <li>• Compara áreas o proyectos cambiando el selector.</li>
                        <li>• Ajusta el rango de fechas para ver períodos distintos.</li>
                        <li>• Haz clic en barras o puntos para ver el detalle del mes.</li>
                        <li>• Personaliza la etiqueta si lo deseas.</li>
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
              title={isCollapsed ? "Expandir" : "Compactar"}
            >
              {isCollapsed ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <ChevronUp className="h-5 w-5" />
              )}
            </button>
          </div>
          <ComparisonSelector
            areas={areas}
            proyectos={mergedProjects}
            onAddComparison={addComparison}
            comparisons={comparisons}
            onRemoveComparison={removeComparison}
            onUpdateVisualizationType={updateVisualizationType}
            isCollapsed={isCollapsed}
          />
        </div>
      )}

      {/* Botón de cambio de vista y mensaje de error */}
      <div className="flex items-center justify-between gap-4">
        {error && (
          <div className="flex-1 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/30">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}
        
        {comparisons.length > 0 && (
          <div className="flex gap-2">
            {/* Botón de layout de gráficos */}
            {comparisonData.length >= 2 && (
              <button
                onClick={() => setChartLayout(chartLayout === "stacked" ? "side-by-side" : "stacked")}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-700 transition-colors"
                title={chartLayout === "stacked" ? "Gráficos lado a lado" : "Gráficos apilados"}
              >
                {chartLayout === "side-by-side" ? (
                  <>
                    <LayoutGrid className="h-4 w-4" />
                    <span>Apilados</span>
                  </>
                ) : (
                  <>
                    <Grid2X2 className="h-4 w-4" />
                    <span>Lado a lado</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Contenido */}
      {chartsSection}
      {tablesSection}
    </div>
  );
};
