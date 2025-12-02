import React, { useState } from "react";
import { ChartData } from "../types";
import { BarChart3, PieChart, TrendingUp } from "lucide-react";

export type ChartType = "bar" | "pie" | "line";

interface ExpenseReportChartProps {
  data: ChartData[];
  title: string;
  loading?: boolean;
  chartType?: ChartType;
  onChartTypeChange?: (type: ChartType) => void;
}

// Paleta de colores extendida para evitar repeticiones
const CHART_COLORS = [
  { bg: "bg-emerald-500", hex: "#10b981", dark: "#059669" },
  { bg: "bg-blue-500", hex: "#3b82f6", dark: "#2563eb" },
  { bg: "bg-amber-500", hex: "#f59e0b", dark: "#d97706" },
  { bg: "bg-rose-500", hex: "#f43f5e", dark: "#e11d48" },
  { bg: "bg-violet-500", hex: "#8b5cf6", dark: "#7c3aed" },
  { bg: "bg-pink-500", hex: "#ec4899", dark: "#db2777" },
  { bg: "bg-cyan-500", hex: "#06b6d4", dark: "#0891b2" },
  { bg: "bg-orange-500", hex: "#f97316", dark: "#ea580c" },
  { bg: "bg-teal-500", hex: "#14b8a6", dark: "#0d9488" },
  { bg: "bg-indigo-500", hex: "#6366f1", dark: "#4f46e5" },
  { bg: "bg-lime-500", hex: "#84cc16", dark: "#65a30d" },
  { bg: "bg-fuchsia-500", hex: "#d946ef", dark: "#c026d3" },
];

// Optimización: Memoizar componente
export const ExpenseReportChart: React.FC<ExpenseReportChartProps> = React.memo(
  ({ data, title, loading = false, chartType = "bar", onChartTypeChange }) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const handleChartTypeChange = (type: ChartType) => {
      if (onChartTypeChange) {
        onChartTypeChange(type);
      }
    };

    const containerClasses =
      "rounded-[24px] border border-transparent bg-white p-6 shadow-md transition-colors dark:border-slate-800 dark:bg-slate-950";
    const headingClasses =
      "mb-4 text-lg font-semibold text-gray-800 dark:text-slate-100";
    const metaTextClasses = "text-sm text-gray-500 dark:text-slate-400";
    const accentCurrencyClasses = "text-green-600 dark:text-emerald-300";
    const accentMovementClasses = "text-blue-600 dark:text-sky-300";
    const dividerClasses =
      "mt-6 border-t border-gray-200 pt-4 dark:border-slate-800";

    if (loading) {
      return (
        <div className={containerClasses}>
          <h3 className={headingClasses}>{title}</h3>
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-b-2 border-green-500 rounded-full animate-spin"></div>
          </div>
        </div>
      );
    }

    if (!data || data.length === 0) {
      return (
        <div className={containerClasses}>
          <h3 className={headingClasses}>{title}</h3>
          <div className="flex items-center justify-center h-64 text-gray-500 dark:text-slate-400">
            No hay datos disponibles para mostrar
          </div>
        </div>
      );
    }

    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat("es-PE", {
        style: "currency",
        currency: "PEN",
        minimumFractionDigits: 2,
      }).format(value);
    };

    const maxGasto = Math.max(...data.map((item) => item.gasto));
    const maxMovimientos = Math.max(...data.map((item) => item.movimientos));

    const renderBarChart = () => (
      <div className="space-y-6">
        {data.map((item, index) => {
          const gastoPercentage = (item.gasto / maxGasto) * 100;
          const movimientosPercentage =
            (item.movimientos / maxMovimientos) * 100;
          const isHovered = hoveredIndex === index;

          return (
            <div
              key={index}
              className="relative space-y-3"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-slate-100">
                    {item.name}
                  </h4>
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

              {/* Tooltip detallado */}
              {isHovered && (
                <div className="absolute top-0 right-0 z-10 px-3 py-2 text-xs text-white bg-gray-900 rounded-lg shadow-lg dark:bg-slate-800">
                  <div className="space-y-1">
                    <div className="font-semibold">{item.name}</div>
                    <div className="flex justify-between space-x-4">
                      <span className="text-gray-300">Gasto:</span>
                      <span className="font-semibold text-emerald-300">
                        {formatCurrency(item.gasto)}
                      </span>
                    </div>
                    <div className="flex justify-between space-x-4">
                      <span className="text-gray-300">Movimientos:</span>
                      <span className="font-semibold text-sky-300">
                        {item.movimientos}
                      </span>
                    </div>
                    <div className="flex justify-between space-x-4">
                      <span className="text-gray-300">Promedio:</span>
                      <span className="font-semibold text-amber-300">
                        {formatCurrency(item.gasto / item.movimientos)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Barras de progreso */}
              <div className="space-y-2">
                {/* Barra de gastos */}
                <div className="flex items-center space-x-2">
                  <span className="w-16 text-xs text-gray-500 dark:text-slate-400">
                    Gastos:
                  </span>
                  <div className="flex-1 h-3 bg-gray-200 rounded-full dark:bg-slate-800">
                    <div
                      className={`h-3 rounded-full bg-green-500 dark:bg-emerald-500 transition-all duration-500 ease-out ${
                        isHovered ? "opacity-90" : ""
                      }`}
                      style={{
                        width: `${gastoPercentage}%`,
                      }}
                    ></div>
                  </div>
                  <span className="w-16 text-xs font-medium text-right text-gray-600 dark:text-slate-300">
                    {gastoPercentage.toFixed(1)}%
                  </span>
                </div>

                {/* Barra de movimientos */}
                <div className="flex items-center space-x-2">
                  <span className="w-16 text-xs text-gray-500 dark:text-slate-400">
                    Movimientos:
                  </span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full dark:bg-slate-800">
                    <div
                      className={`h-2 rounded-full bg-blue-500 transition-all duration-500 ease-out dark:bg-sky-500 ${
                        isHovered ? "opacity-90" : ""
                      }`}
                      style={{ width: `${movimientosPercentage}%` }}
                    ></div>
                  </div>
                  <span className="w-16 text-xs font-medium text-right text-gray-600 dark:text-slate-300">
                    {movimientosPercentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );

  const renderPieChart = () => {
    const total = data.reduce((sum, item) => sum + item.gasto, 0);
    let currentAngle = 0;
    
    // Caso especial: si solo hay un elemento, mostrar un círculo completo
    if (data.length === 1) {
      const item = data[0];
      const color = CHART_COLORS[0];
      const isHovered = hoveredIndex === 0;
      
      return (
        <div className="space-y-6">
          {/* Gráfico circular visual - Un solo elemento */}
          <div className="relative mx-auto h-64 w-64">
            <svg viewBox="0 0 100 100" className="transform -rotate-90">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill={color.hex}
                className="transition-all duration-300 cursor-pointer"
                style={{ opacity: isHovered ? 0.8 : 1 }}
                onMouseEnter={() => setHoveredIndex(0)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
              {isHovered && (
                <>
                  {/* Texto central con información */}
                  <text
                    x="50"
                    y="45"
                    textAnchor="middle"
                    className="fill-white text-[8px] font-bold transform rotate-90"
                    style={{ transformOrigin: '50px 45px' }}
                  >
                    100%
                  </text>
                  <text
                    x="50"
                    y="55"
                    textAnchor="middle"
                    className="fill-white/80 text-[4px] transform rotate-90"
                    style={{ transformOrigin: '50px 55px' }}
                  >
                    {item.movimientos} mov.
                  </text>
                </>
              )}
            </svg>
            
            {/* Tooltip flotante */}
            {isHovered && (
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white dark:bg-slate-800 px-3 py-2 shadow-xl border border-gray-200 dark:border-slate-700 pointer-events-none z-10">
                <div className="text-center space-y-1">
                  <div className="text-xs font-semibold text-gray-900 dark:text-slate-100">
                    {item.name}
                  </div>
                  <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(item.gasto)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-slate-400">
                    100% del total
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Leyenda con información detallada */}
          <div className="space-y-2">
            <div 
              className={`flex items-center justify-between p-2 rounded-lg transition-all cursor-pointer ${
                isHovered ? 'bg-gray-50 dark:bg-slate-800/50' : ''
              }`}
              onMouseEnter={() => setHoveredIndex(0)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="flex items-center space-x-3 flex-1">
                <div 
                  className={`h-4 w-4 rounded-full flex-shrink-0 transition-transform ${isHovered ? 'scale-110' : ''}`}
                  style={{ backgroundColor: color.hex }}
                ></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{item.name}</span>
                    <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">100%</span>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-xs">
                    <span className={accentMovementClasses}>{item.movimientos} movimientos</span>
                    <span className="text-gray-500 dark:text-slate-500">
                      Prom: {formatCurrency(item.gasto / item.movimientos)}
                    </span>
                  </div>
                </div>
              </div>
              <div className={`text-right ml-3 ${accentCurrencyClasses}`}>
                <div className="text-sm font-bold">
                  {formatCurrency(item.gasto)}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        {/* Gráfico circular visual */}
        <div className="relative mx-auto h-64 w-64">
          <svg viewBox="0 0 100 100" className="transform -rotate-90">
            {data.map((item, index) => {
              const percentage = (item.gasto / total) * 100;
              const angle = (percentage / 100) * 360;
              const startAngle = currentAngle;
              currentAngle += angle;
              
              // Calcular coordenadas del arco
              const x1 = 50 + 45 * Math.cos((startAngle * Math.PI) / 180);
              const y1 = 50 + 45 * Math.sin((startAngle * Math.PI) / 180);
              const x2 = 50 + 45 * Math.cos(((startAngle + angle) * Math.PI) / 180);
              const y2 = 50 + 45 * Math.sin(((startAngle + angle) * Math.PI) / 180);
              const largeArc = angle > 180 ? 1 : 0;
              
              const color = CHART_COLORS[index % CHART_COLORS.length];
              const isHovered = hoveredIndex === index;
              
              return (
                <g key={index}>
                  <path
                    d={`M 50 50 L ${x1} ${y1} A 45 45 0 ${largeArc} 1 ${x2} ${y2} Z`}
                    fill={color.hex}
                    className="transition-all duration-300 cursor-pointer"
                    style={{ opacity: isHovered ? 0.8 : 1 }}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                  {isHovered && (
                    <>
                      {/* Texto central con información */}
                      <text
                        x="50"
                        y="45"
                        textAnchor="middle"
                        className="fill-gray-900 dark:fill-slate-100 text-[8px] font-bold transform rotate-90"
                        style={{ transformOrigin: '50px 45px' }}
                      >
                        {percentage.toFixed(1)}%
                      </text>
                      <text
                        x="50"
                        y="55"
                        textAnchor="middle"
                        className="fill-gray-600 dark:fill-slate-400 text-[4px] transform rotate-90"
                        style={{ transformOrigin: '50px 55px' }}
                      >
                        {item.movimientos} mov.
                      </text>
                    </>
                  )}
                </g>
              );
            })}
          </svg>
          
          {/* Tooltip flotante con pointer-events-none */}
          {hoveredIndex !== null && (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white dark:bg-slate-800 px-3 py-2 shadow-xl border border-gray-200 dark:border-slate-700 pointer-events-none z-10">
              <div className="text-center space-y-1">
                <div className="text-xs font-semibold text-gray-900 dark:text-slate-100">
                  {data[hoveredIndex].name}
                </div>
                <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(data[hoveredIndex].gasto)}
                </div>
                <div className="text-xs text-gray-500 dark:text-slate-400">
                  {((data[hoveredIndex].gasto / total) * 100).toFixed(1)}% del total
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Leyenda con información detallada */}
        <div className="space-y-2">
          {data.map((item, index) => {
            const percentage = ((item.gasto / total) * 100).toFixed(1);
            const color = CHART_COLORS[index % CHART_COLORS.length];
            const isHovered = hoveredIndex === index;
            const avgPerMovement = item.gasto / item.movimientos;
            
            return (
              <div 
                key={index} 
                className={`flex items-center justify-between p-2 rounded-lg transition-all cursor-pointer ${
                  isHovered ? 'bg-gray-50 dark:bg-slate-800/50' : ''
                }`}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="flex items-center space-x-3 flex-1">
                  <div 
                    className={`h-4 w-4 rounded-full flex-shrink-0 transition-transform ${isHovered ? 'scale-110' : ''}`}
                    style={{ backgroundColor: color.hex }}
                  ></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{item.name}</span>
                      <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">{percentage}%</span>
                    </div>
                    <div className="flex items-center justify-between mt-1 text-xs">
                      <span className={accentMovementClasses}>{item.movimientos} movimientos</span>
                      <span className="text-gray-500 dark:text-slate-500">
                        Prom: {formatCurrency(avgPerMovement)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className={`text-right ml-3 ${accentCurrencyClasses}`}>
                  <div className="text-sm font-bold">
                    {formatCurrency(item.gasto)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderLineChart = () => {
    // Caso especial: si solo hay un punto
    if (data.length === 1) {
      const item = data[0];
      const isHovered = hoveredIndex === 0;
      
      return (
        <div className="space-y-6">
          {/* Gráfico con un solo punto */}
          <div className="relative h-64 flex items-center justify-center">
            <div className="relative">
              <div 
                className={`w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center cursor-pointer transition-all ${
                  isHovered ? 'scale-110 shadow-lg' : ''
                }`}
                onMouseEnter={() => setHoveredIndex(0)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="text-center text-white">
                  <div className="text-xs font-bold">100%</div>
                </div>
              </div>
              
              {isHovered && (
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 rounded-lg px-3 py-2 shadow-xl border border-emerald-500 whitespace-nowrap pointer-events-none">
                  <div className="text-xs font-bold text-gray-900 dark:text-slate-100">
                    {formatCurrency(item.gasto)}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-slate-400">
                    {item.movimientos} movimientos
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Detalles */}
          <div className="space-y-2">
            <div 
              className={`flex items-center justify-between border-b border-gray-100 pb-2 p-2 rounded-lg transition-all cursor-pointer dark:border-slate-800 ${
                isHovered ? 'bg-gray-50 dark:bg-slate-800/50' : ''
              }`}
              onMouseEnter={() => setHoveredIndex(0)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="flex items-center space-x-3 flex-1">
                <div 
                  className={`h-3 w-3 rounded-full flex-shrink-0 transition-transform bg-emerald-500 ${
                    isHovered ? 'scale-125' : ''
                  }`}
                ></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{item.name}</span>
                    <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">100%</span>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-xs">
                    <span className={accentMovementClasses}>{item.movimientos} movimientos</span>
                    <span className="text-gray-500 dark:text-slate-500">
                      Prom: {formatCurrency(item.gasto / item.movimientos)}
                    </span>
                  </div>
                </div>
              </div>
              <div className={`text-right ml-3 ${accentCurrencyClasses}`}>
                <div className="text-sm font-bold">
                  {formatCurrency(item.gasto)}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        {/* Gráfico de líneas mejorado */}
        <div className="relative h-64">
          <svg className="w-full h-full" viewBox="0 0 500 200">
            {/* Líneas de referencia */}
            <line x1="0" y1="0" x2="500" y2="0" stroke="currentColor" className="text-gray-200 dark:text-slate-700" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <line x1="0" y1="50" x2="500" y2="50" stroke="currentColor" className="text-gray-200 dark:text-slate-700" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <line x1="0" y1="100" x2="500" y2="100" stroke="currentColor" className="text-gray-200 dark:text-slate-700" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <line x1="0" y1="150" x2="500" y2="150" stroke="currentColor" className="text-gray-200 dark:text-slate-700" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <line x1="0" y1="200" x2="500" y2="200" stroke="currentColor" className="text-gray-200 dark:text-slate-700" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            
            {/* Área bajo la curva */}
            <polygon
              points={`0,200 ${data.map((item, index) => {
                const x = data.length > 1 ? (index / (data.length - 1)) * 500 : 250;
                const y = 200 - (item.gasto / maxGasto) * 180;
                return `${x},${y}`;
              }).join(' ')} ${data.length > 1 ? '500' : '250'},200`}
              fill="#10b981"
              opacity="0.1"
              className="dark:fill-emerald-500"
            />
            
            {/* Línea de gastos */}
            {data.length > 1 && (
              <polyline
                points={data.map((item, index) => {
                  const x = (index / (data.length - 1)) * 500;
                  const y = 200 - (item.gasto / maxGasto) * 180;
                  return `${x},${y}`;
                }).join(' ')}
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                className="dark:stroke-emerald-500"
                vectorEffect="non-scaling-stroke"
              />
            )}
            
            {/* Puntos interactivos */}
            {data.map((item, index) => {
              const x = data.length > 1 ? (index / (data.length - 1)) * 500 : 250;
              const y = 200 - (item.gasto / maxGasto) * 180;
              const isHovered = hoveredIndex === index;
              
              return (
                <g key={index}>
                  <circle
                    cx={x}
                    cy={y}
                    r={isHovered ? 8 : 5}
                    fill="#10b981"
                    className="dark:fill-emerald-500 cursor-pointer transition-all"
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    vectorEffect="non-scaling-stroke"
                  />
                </g>
              );
            })}
          </svg>
          
          {/* Tooltip flotante fuera del SVG */}
          {hoveredIndex !== null && (
            <div 
              className="absolute bg-white dark:bg-slate-800 rounded-lg px-3 py-2 shadow-xl border-2 border-emerald-500 pointer-events-none z-10"
              style={{
                left: data.length > 1 
                  ? `${(hoveredIndex / (data.length - 1)) * 100}%` 
                  : '50%',
                top: `${100 - ((data[hoveredIndex].gasto / maxGasto) * 70)}%`,
                transform: 'translate(-50%, -120%)'
              }}
            >
              <div className="text-xs font-bold text-gray-900 dark:text-slate-100 whitespace-nowrap">
                {formatCurrency(data[hoveredIndex].gasto)}
              </div>
              <div className="text-xs text-gray-600 dark:text-slate-400 whitespace-nowrap">
                {data[hoveredIndex].movimientos} movimientos
              </div>
            </div>
          )}
          </div>
        
        {/* Detalles con información enriquecida */}
        <div className="space-y-2">
        {data.map((item, index) => {
          const color = CHART_COLORS[index % CHART_COLORS.length];
          const isHovered = hoveredIndex === index;
          const avgPerMovement = item.gasto / item.movimientos;
          const percentageOfMax = ((item.gasto / maxGasto) * 100).toFixed(1);
          
          return (
            <div 
              key={index} 
              className={`flex items-center justify-between border-b border-gray-100 pb-2 p-2 rounded-lg transition-all cursor-pointer dark:border-slate-800 ${
                isHovered ? 'bg-gray-50 dark:bg-slate-800/50' : ''
              }`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="flex items-center space-x-3 flex-1">
                <div 
                  className={`h-3 w-3 rounded-full flex-shrink-0 transition-transform ${isHovered ? 'scale-125' : ''}`}
                  style={{ backgroundColor: color.hex }}
                ></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{item.name}</span>
                    <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">{percentageOfMax}%</span>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-xs">
                    <span className={accentMovementClasses}>{item.movimientos} movimientos</span>
                    <span className="text-gray-500 dark:text-slate-500">
                      Prom: {formatCurrency(avgPerMovement)}
                    </span>
                  </div>
                </div>
              </div>
              <div className={`text-right ml-3 ${accentCurrencyClasses}`}>
                <div className="text-sm font-bold">
                  {formatCurrency(item.gasto)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      </div>
    );
  };

  return (
      <div className={containerClasses}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={headingClasses}>{title}</h3>

          {/* Selector de tipo de gráfico */}
          <div className="flex space-x-2">
            <button
              onClick={() => handleChartTypeChange("bar")}
              className={`p-2 rounded-lg transition-colors ${
                chartType === "bar"
                  ? "bg-green-100 text-green-600 dark:bg-emerald-500/20 dark:text-emerald-300"
                  : "text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300"
              }`}
              title="Gráfico de barras"
            >
              <BarChart3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleChartTypeChange("pie")}
              className={`p-2 rounded-lg transition-colors ${
                chartType === "pie"
                  ? "bg-green-100 text-green-600 dark:bg-emerald-500/20 dark:text-emerald-300"
                  : "text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300"
              }`}
              title="Gráfico circular"
            >
              <PieChart className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleChartTypeChange("line")}
              className={`p-2 rounded-lg transition-colors ${
                chartType === "line"
                  ? "bg-green-100 text-green-600 dark:bg-emerald-500/20 dark:text-emerald-300"
                  : "text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300"
              }`}
              title="Gráfico de líneas"
            >
              <TrendingUp className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Renderizar el gráfico según el tipo seleccionado */}
        {chartType === "bar" && renderBarChart()}
        {chartType === "pie" && renderPieChart()}
        {chartType === "line" && renderLineChart()}

        {/* Resumen */}
        <div className={dividerClasses}>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className={`text-sm font-medium ${metaTextClasses}`}>
                Total Gastos
              </div>
              <div className={`text-lg font-bold ${accentCurrencyClasses}`}>
                {formatCurrency(
                  data.reduce((sum, item) => sum + item.gasto, 0)
                )}
              </div>
            </div>
            <div className="text-center">
              <div className={`text-sm font-medium ${metaTextClasses}`}>
                Total Movimientos
              </div>
              <div className={`text-lg font-bold ${accentMovementClasses}`}>
                {data.reduce((sum, item) => sum + item.movimientos, 0)}
              </div>
            </div>
          </div>
        </div>

        {/* Leyenda - Solo para gráfico de barras */}
        {chartType === "bar" && (
          <div className="flex justify-center mt-4 space-x-6 text-xs text-gray-500 dark:text-slate-400">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded dark:bg-emerald-500"></div>
              <span>Gastos</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-500 rounded dark:bg-sky-500"></div>
              <span>Movimientos</span>
            </div>
          </div>
        )}
      </div>
    );
  }
);
