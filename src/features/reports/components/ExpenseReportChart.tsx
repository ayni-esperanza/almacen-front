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

  const maxGasto = Math.max(...data.map(item => item.gasto));
  const maxMovimientos = Math.max(...data.map(item => item.movimientos));

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      
      {/* Gráfico mejorado con barras CSS */}
      <div className="space-y-6">
        {data.map((item, index) => {
          const gastoPercentage = (item.gasto / maxGasto) * 100;
          const movimientosPercentage = (item.movimientos / maxMovimientos) * 100;
          
          return (
            <div key={index} className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{item.name}</h4>
                  <div className="flex space-x-4 text-sm text-gray-500 mt-1">
                    <span className="text-green-600 font-semibold">
                      {formatCurrency(item.gasto)}
                    </span>
                    <span className="text-blue-600">
                      {item.movimientos} movimientos
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Barras de progreso */}
              <div className="space-y-2">
                {/* Barra de gastos */}
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500 w-16">Gastos:</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-green-500 h-3 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${gastoPercentage}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 w-12 text-right">
                    {gastoPercentage.toFixed(1)}%
                  </span>
                </div>
                
                {/* Barra de movimientos */}
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500 w-16">Movimientos:</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${movimientosPercentage}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 w-12 text-right">
                    {movimientosPercentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Resumen */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-sm font-medium text-gray-500">Total Gastos</div>
            <div className="text-lg font-bold text-green-600">
              {formatCurrency(data.reduce((sum, item) => sum + item.gasto, 0))}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-gray-500">Total Movimientos</div>
            <div className="text-lg font-bold text-blue-600">
              {data.reduce((sum, item) => sum + item.movimientos, 0)}
            </div>
          </div>
        </div>
      </div>
      
      {/* Leyenda */}
      <div className="mt-4 flex justify-center space-x-6 text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span>Gastos</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span>Movimientos</span>
        </div>
      </div>
    </div>
  );
};
