import React, { useEffect, useState } from 'react';
import { AlertTriangle, Package, Filter, Download } from 'lucide-react';
import { StockAlert, StockAlertFilters } from '../types';
import { stockAlertsService } from '../services/stock-alerts.service';
import { Pagination } from '../../../shared/components/Pagination';
import { TableWithFixedHeader } from '../../../shared/components/TableWithFixedHeader';
import { usePagination } from '../../../shared/hooks/usePagination';

export const StockAlertPage: React.FC = () => {
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<StockAlertFilters>({
    mostrarSoloCriticos: false
  });

  const {
    paginatedData: paginatedAlerts,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    handlePageChange,
    handleItemsPerPageChange,
  } = usePagination({ data: filteredAlerts, initialItemsPerPage: 15 });

  const cardClasses = 'rounded-lg border border-transparent bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900';
  const selectClasses = 'w-full rounded-lg border border-gray-300 px-4 py-3 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-orange-400 dark:focus:ring-orange-500/30';

  useEffect(() => {
    const loadStockAlerts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await stockAlertsService.getStockAlerts(filters);
        setStockAlerts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar alertas');
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
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'critico':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-rose-500/10 dark:text-rose-200 dark:border-rose-500/40';
      case 'bajo':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-amber-500/10 dark:text-amber-200 dark:border-amber-500/40';
      default:
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-emerald-500/10 dark:text-emerald-200 dark:border-emerald-500/40';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'critico':
        return '🔴';
      case 'bajo':
        return '🟡';
      default:
        return '🟢';
    }
  };

  const getCategorias = () => {
    const categorias = new Set(stockAlerts.map(alert => alert.categoria));
    return Array.from(categorias).sort();
  };

  const getUbicaciones = () => {
    const ubicaciones = new Set(stockAlerts.map(alert => alert.ubicacion));
    return Array.from(ubicaciones).sort();
  };

  const getEstadisticas = () => {
    const total = filteredAlerts.length;
    const criticos = filteredAlerts.filter(alert => alert.estado === 'critico').length;
    const bajos = filteredAlerts.filter(alert => alert.estado === 'bajo').length;
    const totalStock = filteredAlerts.reduce((sum, alert) => sum + alert.stockActual, 0);
    const stockMinimo = filteredAlerts.reduce((sum, alert) => sum + alert.stockMinimo, 0);

    return { total, criticos, bajos, totalStock, stockMinimo };
  };

  const handleExport = async () => {
    try {
      const blob = await stockAlertsService.exportStockAlerts(filters);

      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `alertas-stock-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error('Error al exportar alertas de stock:', err);
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-rose-500/40 dark:bg-rose-500/10">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400 dark:text-rose-300" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-rose-200">Error al cargar alertas</h3>
              <div className="mt-2 text-sm text-red-700 dark:text-rose-200/80">{error}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const estadisticas = getEstadisticas();

  return (
    <div className="space-y-6 p-6">
      <div className="rounded-lg bg-gradient-to-r from-orange-500 to-red-600 p-6 text-white">
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
            className="flex items-center space-x-2 rounded-lg bg-white bg-opacity-20 px-4 py-2 transition-colors hover:bg-opacity-30 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <div className={cardClasses}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-500/15">
                <Package className="h-5 w-5 text-orange-600 dark:text-orange-300" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Total Alertas</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-slate-100">{estadisticas.total}</p>
            </div>
          </div>
        </div>

        <div className={cardClasses}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 dark:bg-rose-500/15">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-rose-300" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Críticos</p>
              <p className="text-lg font-semibold text-red-600 dark:text-rose-300">{estadisticas.criticos}</p>
            </div>
          </div>
        </div>

        <div className={cardClasses}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-100 dark:bg-amber-500/15">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-amber-300" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Bajos</p>
              <p className="text-lg font-semibold text-yellow-600 dark:text-amber-300">{estadisticas.bajos}</p>
            </div>
          </div>
        </div>

        <div className={cardClasses}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-sky-500/15">
                <Package className="h-5 w-5 text-blue-600 dark:text-sky-300" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Stock Actual</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-slate-100">{estadisticas.totalStock}</p>
            </div>
          </div>
        </div>

        <div className={cardClasses}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 dark:bg-emerald-500/15">
                <Package className="h-5 w-5 text-green-600 dark:text-emerald-300" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Stock Mínimo</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-slate-100">{estadisticas.stockMinimo}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className={cardClasses}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-200">Filtros</h3>
          <Filter className="h-5 w-5 text-gray-400 dark:text-slate-500" />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-slate-300">
              Categoría
            </label>
            <select
              value={filters.categoria || ''}
              onChange={(e) => updateFilters({ categoria: e.target.value || undefined })}
              className={selectClasses}
            >
              <option value="">Todas las categorías</option>
              {getCategorias().map(categoria => (
                <option key={categoria} value={categoria}>{categoria}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-slate-300">
              Ubicación
            </label>
            <select
              value={filters.ubicacion || ''}
              onChange={(e) => updateFilters({ ubicacion: e.target.value || undefined })}
              className={selectClasses}
            >
              <option value="">Todas las ubicaciones</option>
              {getUbicaciones().map(ubicacion => (
                <option key={ubicacion} value={ubicacion}>{ubicacion}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-slate-300">
              Estado
            </label>
            <select
              value={filters.estado || ''}
              onChange={(e) => updateFilters({ estado: e.target.value as 'critico' | 'bajo' | 'normal' || undefined })}
              className={selectClasses}
            >
              <option value="">Todos los estados</option>
              <option value="critico">Crítico</option>
              <option value="bajo">Bajo</option>
              <option value="normal">Normal</option>
            </select>
          </div>

          <div className="flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.mostrarSoloCriticos || false}
                onChange={(e) => updateFilters({ mostrarSoloCriticos: e.target.checked })}
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-950 dark:text-orange-300 dark:focus:ring-orange-500/40"
              />
              <span className="ml-2 text-sm font-medium text-gray-700 dark:text-slate-300">
                Solo críticos
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Tabla de Alertas */}
      <div className={cardClasses}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-200">Productos con Stock Bajo</h3>
          <div className="text-sm text-gray-600 dark:text-slate-400">
            Mostrando {filteredAlerts.length} de {stockAlerts.length} alertas
          </div>
        </div>

        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-orange-500"></div>
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
                  <th className="bg-gray-50 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:bg-slate-900 dark:text-slate-300">
                    Estado
                  </th>
                  <th className="bg-gray-50 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:bg-slate-900 dark:text-slate-300">
                    Código
                  </th>
                  <th className="bg-gray-50 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:bg-slate-900 dark:text-slate-300">
                    Descripción
                  </th>
                  <th className="bg-gray-50 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:bg-slate-900 dark:text-slate-300">
                    Stock Actual
                  </th>
                  <th className="bg-gray-50 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:bg-slate-900 dark:text-slate-300">
                    Stock Mínimo
                  </th>
                  <th className="bg-gray-50 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:bg-slate-900 dark:text-slate-300">
                    Ubicación
                  </th>
                  <th className="bg-gray-50 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:bg-slate-900 dark:text-slate-300">
                    Categoría
                  </th>
                  <th className="bg-gray-50 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:bg-slate-900 dark:text-slate-300">
                    Proveedor
                  </th>
                  <th className="bg-gray-50 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:bg-slate-900 dark:text-slate-300">
                    Última Actualización
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-slate-800 dark:bg-slate-950">
                {paginatedAlerts.map((alert) => (
                  <tr key={alert.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-slate-900/40">
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getEstadoColor(alert.estado)}`}>
                        {getEstadoIcon(alert.estado)} {alert.estado.toUpperCase()}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-slate-100">
                      {alert.codigo}
                    </td>
                    <td className="max-w-xs truncate px-6 py-4 text-sm text-gray-900 dark:text-slate-200">
                      {alert.descripcion}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-slate-200">
                      <span className={`font-semibold ${alert.stockActual === 0 ? 'text-red-600 dark:text-rose-300' : alert.stockActual < 5 ? 'text-orange-600 dark:text-orange-300' : 'text-gray-900 dark:text-slate-100'}`}>
                        {alert.stockActual}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-slate-200">
                      {alert.stockMinimo}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-slate-200">
                      {alert.ubicacion}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-slate-200">
                      {alert.categoria}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-slate-200">
                      {alert.proveedor}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-slate-200">
                      {new Date(alert.ultimaActualizacion).toLocaleDateString('es-ES')}
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
