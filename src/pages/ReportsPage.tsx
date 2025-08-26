import React, { useState } from 'react';
import { BarChart3, FileText, TrendingUp } from 'lucide-react';
import { ExpenseReportPage } from '../features/reports/components/ExpenseReportPage';

type ReportType = 'expenses' | 'inventory' | 'movements';

export const ReportsPage: React.FC = () => {
  const [activeReport, setActiveReport] = useState<ReportType>('expenses');

  const reports = [
    {
      id: 'expenses' as ReportType,
      title: 'Reporte de Gastos',
      description: 'Análisis de gastos por área y proyecto',
      icon: BarChart3,
      component: ExpenseReportPage
    },
    // Aquí se pueden agregar más tipos de reportes en el futuro
    // {
    //   id: 'inventory' as ReportType,
    //   title: 'Reporte de Inventario',
    //   description: 'Estado actual del inventario',
    //   icon: FileText,
    //   component: InventoryReportPage
    // },
    // {
    //   id: 'movements' as ReportType,
    //   title: 'Reporte de Movimientos',
    //   description: 'Análisis de entradas y salidas',
    //   icon: TrendingUp,
    //   component: MovementsReportPage
    // }
  ];

  const ActiveComponent = reports.find(r => r.id === activeReport)?.component;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
              <p className="mt-1 text-sm text-gray-500">
                Análisis y estadísticas del sistema de almacén
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-8">
            {reports.map((report) => {
              const Icon = report.icon;
              return (
                <button
                  key={report.id}
                  onClick={() => setActiveReport(report.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeReport === report.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{report.title}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto">
        {ActiveComponent && <ActiveComponent />}
      </div>
    </div>
  );
};
