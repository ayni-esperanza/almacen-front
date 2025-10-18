import React from 'react';
import { ChartData } from '../types';

interface ExpenseReportChartProps {
  data: ChartData[];
  title: string;
  loading?: boolean;
}

export const ExpenseReportChart: React.FC<ExpenseReportChartProps> = ({
  data,
  title,
  loading = false
}) => {
  const containerClasses = 'rounded-[24px] border border-transparent bg-white p-6 shadow-md transition-colors dark:border-slate-800 dark:bg-slate-950';
  const headingClasses = 'mb-4 text-lg font-semibold text-gray-800 dark:text-slate-100';
  const metaTextClasses = 'text-sm text-gray-500 dark:text-slate-400';
  const accentCurrencyClasses = 'text-green-600 dark:text-emerald-300';
  const accentMovementClasses = 'text-blue-600 dark:text-sky-300';
  const dividerClasses = 'mt-6 border-t border-gray-200 pt-4 dark:border-slate-800';

  if (loading) {
    return (
      <div className={containerClasses}>
        <h3 className={headingClasses}>{title}</h3>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={containerClasses}>
        <h3 className={headingClasses}>{title}</h3>
        <div className="flex h-64 items-center justify-center text-gray-500 dark:text-slate-400">
          No hay datos disponibles para mostrar
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(value);
  };

  const maxGasto = Math.max(...data.map(item => item.gasto));
  const maxMovimientos = Math.max(...data.map(item => item.movimientos));

  return (
    <div className={containerClasses}>
      <h3 className={headingClasses}>{title}</h3>
      
      {/* Gráfico mejorado con barras CSS */}
      <div className="space-y-6">
        {data.map((item, index) => {
          const gastoPercentage = (item.gasto / maxGasto) * 100;
          const movimientosPercentage = (item.movimientos / maxMovimientos) * 100;
          
          return (
            <div key={index} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-slate-100">{item.name}</h4>
                  <div className={`mt-1 flex space-x-4 ${metaTextClasses}`}>
                    <span className={`font-semibold ${accentCurrencyClasses}`}>
                      {formatCurrency(item.gasto)}
                    </span>
                    <span className={accentMovementClasses}>
                      {item.movimientos} movimientos
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Barras de progreso */}
              <div className="space-y-2">
                {/* Barra de gastos */}
                <div className="flex items-center space-x-2">
                  <span className="w-16 text-xs text-gray-500 dark:text-slate-400">Gastos:</span>
                  <div className="h-3 flex-1 rounded-full bg-gray-200 dark:bg-slate-800">
                    <div 
                      className="h-3 rounded-full bg-green-500 transition-all duration-500 ease-out dark:bg-emerald-500"
                      style={{ width: `${gastoPercentage}%` }}
                    ></div>
                  </div>
                  <span className="w-12 text-right text-xs text-gray-500 dark:text-slate-400">
                    {gastoPercentage.toFixed(1)}%
                  </span>
                </div>
                
                {/* Barra de movimientos */}
                <div className="flex items-center space-x-2">
                  <span className="w-16 text-xs text-gray-500 dark:text-slate-400">Movimientos:</span>
                  <div className="h-2 flex-1 rounded-full bg-gray-200 dark:bg-slate-800">
                    <div 
                      className="h-2 rounded-full bg-blue-500 transition-all duration-500 ease-out dark:bg-sky-500"
                      style={{ width: `${movimientosPercentage}%` }}
                    ></div>
                  </div>
                  <span className="w-12 text-right text-xs text-gray-500 dark:text-slate-400">
                    {movimientosPercentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Resumen */}
      <div className={dividerClasses}>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className={`text-sm font-medium ${metaTextClasses}`}>Total Gastos</div>
            <div className={`text-lg font-bold ${accentCurrencyClasses}`}>
              {formatCurrency(data.reduce((sum, item) => sum + item.gasto, 0))}
            </div>
          </div>
          <div className="text-center">
            <div className={`text-sm font-medium ${metaTextClasses}`}>Total Movimientos</div>
            <div className={`text-lg font-bold ${accentMovementClasses}`}>
              {data.reduce((sum, item) => sum + item.movimientos, 0)}
            </div>
          </div>
        </div>
      </div>
      
      {/* Leyenda */}
      <div className="mt-4 flex justify-center space-x-6 text-xs text-gray-500 dark:text-slate-400">
        <div className="flex items-center space-x-1">
          <div className="h-3 w-3 rounded bg-green-500 dark:bg-emerald-500"></div>
          <span>Gastos</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="h-3 w-3 rounded bg-blue-500 dark:bg-sky-500"></div>
          <span>Movimientos</span>
        </div>
      </div>
    </div>
  );
};
