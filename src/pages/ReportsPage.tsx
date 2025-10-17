import React, { useState } from 'react';
import { BarChart3, AlertTriangle } from 'lucide-react';
import { ExpenseReportPage } from '../features/reports/components/ExpenseReportPage';
import { StockAlertPage } from '../features/reports/components/StockAlertPage';

type ReportType = 'expenses' | 'stock-alerts' | 'inventory' | 'movements';

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
    {
      id: 'stock-alerts' as ReportType,
      title: 'Alertas de Stock',
      description: 'Productos con stock por debajo del mínimo',
      icon: AlertTriangle,
      component: StockAlertPage
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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Reportes</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                Análisis y estadísticas del sistema de almacén
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-8">
            {reports.map((report) => {
              const Icon = report.icon;
              return (
                <button
                  key={report.id}
                  onClick={() => setActiveReport(report.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeReport === report.id
                      ? 'border-green-500 text-green-600 dark:text-emerald-300'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-slate-200'
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
      <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        {ActiveComponent && <ActiveComponent />}
      </div>
    </div>
  );
};
