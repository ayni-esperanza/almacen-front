import React, { useState, useEffect } from 'react';
import { AlertTriangle, Package, Filter, Download } from 'lucide-react';
import { StockAlert, StockAlertFilters } from '../types';
import { mockStockAlerts, filterStockAlerts } from '../utils/mockData';

export const StockAlertPage: React.FC = () => {
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<StockAlertFilters>({
    mostrarSoloCriticos: false
  });

  // Cargar datos de alertas
  useEffect(() => {
    const loadStockAlerts = async () => {
      try {
        setLoading(true);
        setError(null);
        // Simular carga de datos
        await new Promise(resolve => setTimeout(resolve, 500));
        setStockAlerts(mockStockAlerts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar alertas');
      } finally {
        setLoading(false);
      }
    };

    loadStockAlerts();
  }, []);

  // Aplicar filtros
  useEffect(() => {
    const filtered = filterStockAlerts(stockAlerts, filters);
    setFilteredAlerts(filtered);
  }, [stockAlerts, filters]);

  const updateFilters = (newFilters: Partial<StockAlertFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'critico':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'bajo':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
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

  const handleExport = () => {
    // Función para exportar alertas (preparada para backend)
    console.log('Exportando alertas de stock...');
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error al cargar alertas</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const estadisticas = getEstadisticas();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Alertas de Stock</h1>
            <p className="text-orange-100 mt-1">
              Productos con stock por debajo del mínimo (10 unidades)
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleExport}
              disabled={loading}
              className="flex items-center space-x-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>Exportar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Alertas</p>
              <p className="text-lg font-semibold text-gray-900">{estadisticas.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Críticos</p>
              <p className="text-lg font-semibold text-red-600">{estadisticas.criticos}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Bajos</p>
              <p className="text-lg font-semibold text-yellow-600">{estadisticas.bajos}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Stock Actual</p>
              <p className="text-lg font-semibold text-gray-900">{estadisticas.totalStock}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Stock Mínimo</p>
              <p className="text-lg font-semibold text-gray-900">{estadisticas.stockMinimo}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Filtros</h3>
          <Filter className="w-5 h-5 text-gray-400" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Categoría */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Categoría
            </label>
            <select
              value={filters.categoria || ''}
              onChange={(e) => updateFilters({ categoria: e.target.value || undefined })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            >
              <option value="">Todas las categorías</option>
              {getCategorias().map(categoria => (
                <option key={categoria} value={categoria}>{categoria}</option>
              ))}
            </select>
          </div>

          {/* Ubicación */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Ubicación
            </label>
            <select
              value={filters.ubicacion || ''}
              onChange={(e) => updateFilters({ ubicacion: e.target.value || undefined })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            >
              <option value="">Todas las ubicaciones</option>
              {getUbicaciones().map(ubicacion => (
                <option key={ubicacion} value={ubicacion}>{ubicacion}</option>
              ))}
            </select>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Estado
            </label>
            <select
              value={filters.estado || ''}
              onChange={(e) => updateFilters({ estado: e.target.value as 'critico' | 'bajo' | 'normal' || undefined })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            >
              <option value="">Todos los estados</option>
              <option value="critico">Crítico</option>
              <option value="bajo">Bajo</option>
              <option value="normal">Normal</option>
            </select>
          </div>

          {/* Solo Críticos */}
          <div className="flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.mostrarSoloCriticos || false}
                onChange={(e) => updateFilters({ mostrarSoloCriticos: e.target.checked })}
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">
                Solo críticos
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Tabla de Alertas */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Productos con Stock Bajo</h3>
          <div className="text-sm text-gray-600">
            Mostrando {filteredAlerts.length} de {stockAlerts.length} alertas
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No hay alertas de stock que coincidan con los filtros
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock Actual
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock Mínimo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ubicación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Proveedor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Última Actualización
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAlerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getEstadoColor(alert.estado)}`}>
                        {getEstadoIcon(alert.estado)} {alert.estado.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {alert.codigo}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {alert.descripcion}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`font-semibold ${alert.stockActual === 0 ? 'text-red-600' : alert.stockActual < 5 ? 'text-orange-600' : 'text-gray-900'}`}>
                        {alert.stockActual}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {alert.stockMinimo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {alert.ubicacion}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {alert.categoria}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {alert.proveedor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(alert.ultimaActualizacion).toLocaleDateString('es-ES')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
