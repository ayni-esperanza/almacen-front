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
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      
      {/* Gráfico simplificado con barras CSS */}
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{item.name}</span>
              <span className="text-green-600">{formatCurrency(item.gasto)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className="bg-green-500 h-4 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.min((item.gasto / Math.max(...data.map(d => d.gasto))) * 100, 100)}%` 
                }}
              ></div>
            </div>
            <div className="text-xs text-gray-500">
              Movimientos: {item.movimientos}
            </div>
          </div>
        ))}
      </div>
      
      {/* Resumen */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-between text-sm">
          <span className="font-medium">Total:</span>
          <span className="font-bold text-green-600">
            {formatCurrency(data.reduce((sum, item) => sum + item.gasto, 0))}
          </span>
        </div>
      </div>
    </div>
  );
};
