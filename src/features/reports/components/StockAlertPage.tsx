import React, { useEffect, useState } from "react";
import { AlertTriangle, Package, Filter, Download } from "lucide-react";
import { StockAlert, StockAlertFilters } from "../types";
import { stockAlertsService } from "../services/stock-alerts.service";
import { Pagination } from "../../../shared/components/Pagination";
import { TableWithFixedHeader } from "../../../shared/components/TableWithFixedHeader";
import { SearchableSelect } from "../../../shared/components/SearchableSelect";
import { usePagination } from "../../../shared/hooks/usePagination";

export const StockAlertPage: React.FC = () => {
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<StockAlertFilters>({
    mostrarSoloCriticos: false,
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);

  const {
    paginatedData: paginatedAlerts,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    handlePageChange,
    handleItemsPerPageChange,
  } = usePagination({ data: filteredAlerts, initialItemsPerPage: 15 });

  const cardClasses =
    "rounded-lg border border-transparent bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900";

  // Cargar categorías y ubicaciones al montar el componente
  useEffect(() => {
    const loadFiltersData = async () => {
      try {
        const [categoriesData, locationsData] = await Promise.all([
          stockAlertsService.getCategories(),
          stockAlertsService.getLocations(),
        ]);
        setCategories(categoriesData);
        setLocations(locationsData);
      } catch (err) {
        console.error("Error loading filters data:", err);
      }
    };

    loadFiltersData();
  }, []);

  useEffect(() => {
    const loadStockAlerts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await stockAlertsService.getStockAlerts(filters);
        setStockAlerts(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al cargar alertas"
        );
      } finally {
        setLoading(false);
      }
    };

    loadStockAlerts();
  }, [filters]);

  useEffect(() => {
    setFilteredAlerts(stockAlerts);
  }, [stockAlerts, filters]);

  const updateFilters = (newFilters: Partial<StockAlertFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "critico":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-rose-500/10 dark:text-rose-200 dark:border-rose-500/40";
      case "bajo":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-amber-500/10 dark:text-amber-200 dark:border-amber-500/40";
      default:
        return "bg-green-100 text-green-800 border-green-200 dark:bg-emerald-500/10 dark:text-emerald-200 dark:border-emerald-500/40";
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case "critico":
        return "🔴";
      case "bajo":
        return "🟡";
      default:
        return "🟢";
    }
  };

  const getEstadisticas = () => {
    const total = filteredAlerts.length;
    const criticos = filteredAlerts.filter(
      (alert) => alert.estado === "critico"
    ).length;
    const bajos = filteredAlerts.filter(
      (alert) => alert.estado === "bajo"
    ).length;
    const totalStock = filteredAlerts.reduce(
      (sum, alert) => sum + alert.stockActual,
      0
    );
    const stockMinimo = filteredAlerts.reduce(
      (sum, alert) => sum + alert.stockMinimo,
      0
    );

    return { total, criticos, bajos, totalStock, stockMinimo };
  };

  const handleExport = async () => {
    try {
      const blob = await stockAlertsService.exportStockAlerts(filters);

      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `alertas-stock-${
          new Date().toISOString().split("T")[0]
        }.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error("Error al exportar alertas de stock:", err);
    }
  };

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
                Error al cargar alertas
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

  const estadisticas = getEstadisticas();

  return (
    <div className="p-6 space-y-6">
      <div className="p-6 text-white rounded-lg bg-gradient-to-r from-orange-500 to-red-600">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Alertas de Stock</h1>
            <p className="mt-1 text-orange-100">
              Productos con stock por debajo del mínimo (10 unidades)
            </p>
          </div>
          <button
            onClick={handleExport}
            disabled={loading}
            className="flex items-center px-4 py-2 space-x-2 transition-colors bg-white rounded-lg bg-opacity-20 hover:bg-opacity-30 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <div className={cardClasses}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-lg dark:bg-orange-500/15">
                <Package className="w-5 h-5 text-orange-600 dark:text-orange-300" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
                Total Alertas
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                {estadisticas.total}
              </p>
            </div>
          </div>
        </div>

        <div className={cardClasses}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-lg dark:bg-rose-500/15">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-rose-300" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
                Críticos
              </p>
              <p className="text-lg font-semibold text-red-600 dark:text-rose-300">
                {estadisticas.criticos}
              </p>
            </div>
          </div>
        </div>

        <div className={cardClasses}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-lg dark:bg-amber-500/15">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-amber-300" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
                Bajos
              </p>
              <p className="text-lg font-semibold text-yellow-600 dark:text-amber-300">
                {estadisticas.bajos}
              </p>
            </div>
          </div>
        </div>

        <div className={cardClasses}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg dark:bg-sky-500/15">
                <Package className="w-5 h-5 text-blue-600 dark:text-sky-300" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
                Stock Actual
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                {estadisticas.totalStock}
              </p>
            </div>
          </div>
        </div>

        <div className={cardClasses}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg dark:bg-emerald-500/15">
                <Package className="w-5 h-5 text-green-600 dark:text-emerald-300" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
                Stock Mínimo
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                {estadisticas.stockMinimo}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className={cardClasses}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-200">
            Filtros
          </h3>
          <Filter className="w-5 h-5 text-gray-400 dark:text-slate-500" />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <SearchableSelect
              label="Categoría"
              value={filters.categoria || "Todas las categorías"}
              onChange={(value) =>
                updateFilters({
                  categoria:
                    value === "Todas las categorías" ? undefined : value,
                })
              }
              options={["Todas las categorías", ...categories]}
              placeholder="Todas las categorías"
            />
          </div>

          <div>
            <SearchableSelect
              label="Ubicación"
              value={filters.ubicacion || "Todas las ubicaciones"}
              onChange={(value) =>
                updateFilters({
                  ubicacion:
                    value === "Todas las ubicaciones" ? undefined : value,
                })
              }
              options={["Todas las ubicaciones", ...locations]}
              placeholder="Todas las ubicaciones"
            />
          </div>

          <div>
            <SearchableSelect
              label="Estado"
              value={
                filters.estado
                  ? filters.estado === "critico"
                    ? "Crítico"
                    : filters.estado === "bajo"
                    ? "Bajo"
                    : "Normal"
                  : "Todos los estados"
              }
              onChange={(value) => {
                let estado: "critico" | "bajo" | "normal" | undefined;
                if (value === "Crítico") estado = "critico";
                else if (value === "Bajo") estado = "bajo";
                else if (value === "Normal") estado = "normal";
                else estado = undefined;
                updateFilters({ estado });
              }}
              options={["Todos los estados", "Crítico", "Bajo", "Normal"]}
              placeholder="Todos los estados"
            />
          </div>
        </div>
      </div>

      {/* Tabla de Alertas */}
      <div className={cardClasses}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-200">
            Productos con Stock Bajo
          </h3>
          <div className="text-sm text-gray-600 dark:text-slate-400">
            Mostrando {filteredAlerts.length} de {stockAlerts.length} alertas
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-8 h-8 border-b-2 border-orange-500 rounded-full animate-spin"></div>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="py-8 text-center text-gray-500 dark:text-slate-400">
            No hay alertas de stock que coincidan con los filtros
          </div>
        ) : (
          <>
            <TableWithFixedHeader maxHeight="600px">
              <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-slate-900">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                    Código
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                    Stock Actual
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                    Stock Mínimo
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                    Ubicación
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                    Proveedor
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                    Última Actualización
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:divide-slate-800 dark:bg-slate-950">
                {paginatedAlerts.map((alert) => (
                  <tr
                    key={alert.id}
                    className="transition-colors hover:bg-gray-50 dark:hover:bg-slate-900/40"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getEstadoColor(
                          alert.estado
                        )}`}
                      >
                        {getEstadoIcon(alert.estado)}{" "}
                        {alert.estado.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-slate-100">
                      {alert.codigo}
                    </td>
                    <td className="max-w-xs px-6 py-4 text-sm text-gray-900 truncate dark:text-slate-200">
                      {alert.nombre}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap dark:text-slate-200">
                      <span
                        className={`font-semibold ${
                          alert.stockActual === 0
                            ? "text-red-600 dark:text-rose-300"
                            : alert.stockActual < 5
                            ? "text-orange-600 dark:text-orange-300"
                            : "text-gray-900 dark:text-slate-100"
                        }`}
                      >
                        {alert.stockActual}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap dark:text-slate-200">
                      {alert.stockMinimo}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap dark:text-slate-200">
                      {alert.ubicacion}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap dark:text-slate-200">
                      {alert.categoria}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap dark:text-slate-200">
                      {alert.proveedor}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap dark:text-slate-200">
                      {new Date(alert.ultimaActualizacion).toLocaleDateString(
                        "es-ES"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </TableWithFixedHeader>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </>
        )}
      </div>
    </div>
  );
};
