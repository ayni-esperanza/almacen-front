import React, { useState, useEffect } from 'react';
import { Download, FileText, BarChart3 } from 'lucide-react';
import { useReports } from '../hooks/useReports';
import { ReportFilters } from './ReportFilters';
import { ExpenseReportChart } from './ExpenseReportChart';
import { ExpenseReportTable } from './ExpenseReportTable';

export const ExpenseReportPage: React.FC = () => {
  const {
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
    refetch
  } = useReports();

  const [areas, setAreas] = useState<string[]>(['ALMACEN', 'MECANICA', 'BROCHA', 'OTRO']);
  const [proyectos, setProyectos] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'chart' | 'table'>('chart');

  // Extraer proyectos únicos de los datos
  useEffect(() => {
    const uniqueProjects = new Set<string>();
    areaData.forEach(area => {
      area.proyectos.forEach(proyecto => {
        if (proyecto.proyecto) {
          uniqueProjects.add(proyecto.proyecto);
        }
      });
    });
    setProyectos(Array.from(uniqueProjects).sort());
  }, [areaData]);

  const handleExportPDF = async () => {
    try {
      await exportToPDF();
    } catch (error) {
      console.error('Error exporting PDF:', error);
    }
  };

  const getChartTitle = () => {
    const baseTitle = filters.tipoReporte === 'area' ? 'Gastos por Área' : 'Gastos por Proyecto';
    const dateRange = `${filters.fechaInicio} - ${filters.fechaFin}`;
    return `${baseTitle} (${dateRange})`;
  };

  const getMonthlyChartTitle = () => {
    return `Gastos Mensuales (${filters.fechaInicio} - ${filters.fechaFin})`;
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
              <h3 className="text-sm font-medium text-red-800">Error al cargar reportes</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Reporte de Gastos Mensual</h1>
            <p className="text-green-100 mt-1">
              Análisis detallado de gastos por área y proyecto
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleExportPDF}
              disabled={loading}
              className="flex items-center space-x-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>Exportar PDF</span>
            </button>
            <button
              onClick={refetch}
              disabled={loading}
              className="flex items-center space-x-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <FileText className="w-4 h-4" />
              <span>Actualizar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <ReportFilters
        filters={filters}
        onFiltersChange={updateFilters}
        areas={areas}
        proyectos={proyectos}
      />

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('chart')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'chart'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>Gráficos</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('table')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'table'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Tabla de Datos</span>
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'chart' ? (
            <div className="space-y-6">
              {/* Gráfico principal */}
              <ExpenseReportChart
                data={generateChartData()}
                title={getChartTitle()}
                loading={loading}
              />

              {/* Gráfico mensual */}
              <ExpenseReportChart
                data={getMonthlyChartData()}
                title={getMonthlyChartTitle()}
                loading={loading}
              />
            </div>
          ) : (
            <ExpenseReportTable
              data={expenseReports}
              loading={loading}
            />
          )}
        </div>
      </div>

      {/* Resumen de estadísticas */}
      {!loading && expenseReports.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Gastos</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Intl.NumberFormat('es-PE', {
                    style: 'currency',
                    currency: 'PEN',
                    minimumFractionDigits: 2
                  }).format(expenseReports.reduce((sum, item) => sum + item.costoTotal, 0))}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Movimientos</p>
                <p className="text-lg font-semibold text-gray-900">{expenseReports.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Áreas Involucradas</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Set(expenseReports.map(item => item.area)).size}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Proyectos Involucrados</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Set(expenseReports.filter(item => item.proyecto).map(item => item.proyecto!)).size}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
