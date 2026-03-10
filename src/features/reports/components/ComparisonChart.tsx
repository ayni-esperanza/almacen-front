import React, { useState } from "react";
import { ComparisonData } from "../types";
import { BarChart3, TrendingUp, MoveHorizontal, MoveVertical } from "lucide-react";

export type ComparisonChartType = "bar" | "line" | "monthly" | "combo";

interface ComparisonChartProps {
  data: ComparisonData[];
  chartType?: ComparisonChartType;
  onChartTypeChange?: (type: ComparisonChartType) => void;
  loading?: boolean;
  onSelectItem?: (comparisonId: string, opts?: { rawMonth?: string }) => void;
  barOrientation?: "horizontal" | "vertical";
  onBarOrientationChange?: (orientation: "horizontal" | "vertical") => void;
}

export const ComparisonChart: React.FC<ComparisonChartProps> = ({
  data,
  chartType = "bar",
  onChartTypeChange,
  loading = false,
  onSelectItem,
  barOrientation = "horizontal",
  onBarOrientationChange,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<{ comparisonId: string; monthIndex: number } | null>(null);

  const containerClasses =
    "rounded-lg border border-transparent bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900";
  const metaTextClasses = "text-sm text-gray-500 dark:text-slate-400";

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
      minimumFractionDigits: 2,
    }).format(value);
  };

  if (loading) {
    return (
      <div className={containerClasses}>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-100 mb-4">
          Comparación de Gastos
        </h3>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-b-2 border-green-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={containerClasses}>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-100 mb-4">
          Comparación de Gastos
        </h3>
        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-slate-400">
          Agrega comparaciones para ver los gráficos
        </div>
      </div>
    );
  }

  // Renderizar gráfico de barras agrupadas (horizontal o vertical)
  const renderBarChart = () => {
    // Combinar todos los meses únicos preservando el orden cronológico
    const monthMap = new Map<string, string>();
    data.forEach((item) => {
      item.monthlyData.forEach((m) => {
        const raw = m.rawMes || m.mes;
        if (!monthMap.has(raw)) {
          monthMap.set(raw, m.mes);
        }
      });
    });

    const parseRawMonth = (value: string) => {
      if (!value) return Number.POSITIVE_INFINITY;
      if (value.includes("-")) {
        const [yearStr, monthStr] = value.split("-");
        const year = Number(yearStr);
        const month = Number(monthStr);
        if (!Number.isNaN(year) && !Number.isNaN(month)) {
          return new Date(year, month - 1, 1).getTime();
        }
      }
      if (value.includes("/")) {
        const [monthStr, yearStr] = value.split("/");
        const year = Number(yearStr);
        const month = Number(monthStr);
        if (!Number.isNaN(year) && !Number.isNaN(month)) {
          return new Date(year, month - 1, 1).getTime();
        }
      }
      return value;
    };

    const sortedMonths = Array.from(monthMap.entries())
      .sort((a, b) => {
        const orderA = parseRawMonth(a[0]);
        const orderB = parseRawMonth(b[0]);

        if (typeof orderA === "number" && typeof orderB === "number") {
          return orderA - orderB;
        }
        if (typeof orderA === "number") return -1;
        if (typeof orderB === "number") return 1;
        return String(orderA).localeCompare(String(orderB));
      })
      .map(([, label]) => label);

    // Calcular el valor máximo para escalar
    const maxGasto = Math.max(
      ...data.flatMap((item) =>
        item.monthlyData.map((m) => m.totalGasto)
      )
    ) || 1;

    if (barOrientation === "vertical") {
      const chartHeight = 320;

      return (
        <div className="space-y-4">
          {/* Leyenda */}
          <div className="flex flex-wrap gap-4">
            {data.map((item) => (
              <div key={item.id} className="flex items-center gap-2 text-sm">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-gray-800 dark:text-slate-100">{item.label}</span>
              </div>
            ))}
          </div>

          <div className="relative overflow-x-auto">
            <div className="relative pl-16" style={{ height: chartHeight + 80, minWidth: Math.max(900, sortedMonths.length * 120) }}>
              {/* Grid horizontal */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
                <div
                  key={ratio}
                  className="absolute left-16 right-0 border-t border-dashed border-gray-200 dark:border-slate-700"
                  style={{ top: (1 - ratio) * chartHeight }}
                >
                  <span className="absolute left-0 -translate-x-full pr-2 text-xs text-gray-500 dark:text-slate-400">
                    {formatCurrency(maxGasto * ratio)}
                  </span>
                </div>
              ))}

              {/* Grupos de barras por mes */}
              <div className="absolute bottom-0 left-16 flex items-end gap-8">
                {sortedMonths.map((month, monthIndex) => {
                  const barWidth = Math.min(40, Math.max(20, 600 / (data.length * sortedMonths.length)));
                  
                  return (
                    <div key={monthIndex} className="flex flex-col items-center gap-2">
                      {/* Barras del mes */}
                      <div className="flex items-end gap-1" style={{ height: chartHeight }}>
                        {data.map((item) => {
                          const monthData = item.monthlyData.find((m) => m.mes === month);
                          const value = monthData?.totalGasto || 0;
                          const height = (value / maxGasto) * chartHeight;
                          const isHovered = hoveredPoint?.comparisonId === item.id && hoveredPoint?.monthIndex === monthIndex;
                          const promedio = monthData && monthData.cantidadMovimientos > 0 
                            ? monthData.totalGasto / monthData.cantidadMovimientos 
                            : 0;

                          return (
                            <div key={item.id} className="relative flex flex-col items-center">
                              {/* Tooltip detallado - posicionado arriba del contenedor si la barra es alta */}
                              {isHovered && monthData && (
                                <div className={`absolute left-1/2 -translate-x-1/2 z-10 px-3 py-2 text-xs text-white bg-gray-900 rounded-lg shadow-lg dark:bg-slate-800 whitespace-nowrap ${
                                  height > chartHeight * 0.6 ? 'top-0 -translate-y-full mt-2' : 'bottom-full mb-2'
                                }`}>
                                  <div className="space-y-1">
                                    <div className="font-semibold">{item.label}</div>
                                    <div className="text-gray-300">{month}</div>
                                    <div className="flex justify-between space-x-4">
                                      <span className="text-gray-300">Gasto:</span>
                                      <span className="font-semibold text-emerald-300">
                                        {formatCurrency(monthData.totalGasto)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between space-x-4">
                                      <span className="text-gray-300">Movimientos:</span>
                                      <span className="font-semibold text-sky-300">
                                        {monthData.cantidadMovimientos}
                                      </span>
                                    </div>
                                    <div className="flex justify-between space-x-4">
                                      <span className="text-gray-300">Promedio:</span>
                                      <span className="font-semibold text-amber-300">
                                        {formatCurrency(promedio)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}
                              <div
                                className="rounded-t-md transition-all duration-200 cursor-pointer"
                                style={{
                                  width: barWidth,
                                  height,
                                  backgroundColor: item.color,
                                  opacity: isHovered ? 1 : 0.8,
                                }}
                                onMouseEnter={() => setHoveredPoint({ comparisonId: item.id, monthIndex })}
                                onMouseLeave={() => setHoveredPoint(null)}
                                onClick={() => onSelectItem?.(item.id, { rawMonth: monthData?.rawMes })}
                              />
                            </div>
                          );
                        })}
                      </div>
                      {/* Etiqueta del mes */}
                      <div className="text-xs text-gray-700 dark:text-slate-300 text-center" style={{ maxWidth: barWidth * data.length + (data.length - 1) * 4 }}>
                        {month}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Horizontal: Mostrar por mes también
    return (
      <div className="space-y-6">
        {/* Leyenda */}
        <div className="flex flex-wrap gap-4">
          {data.map((item) => (
            <div key={item.id} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-gray-800 dark:text-slate-100">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Barras agrupadas por mes */}
        {sortedMonths.map((month, monthIndex) => (
          <div key={monthIndex} className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-slate-200">
              {month}
            </h4>
            <div className="space-y-2">
              {data.map((item) => {
                const monthData = item.monthlyData.find((m) => m.mes === month);
                const value = monthData?.totalGasto || 0;
                const percentage = (value / maxGasto) * 100;
                const isHovered = hoveredPoint?.comparisonId === item.id && hoveredPoint?.monthIndex === monthIndex;
                const promedio = monthData && monthData.cantidadMovimientos > 0
                  ? monthData.totalGasto / monthData.cantidadMovimientos
                  : 0;

                return (
                  <div
                    key={item.id}
                    className="relative"
                    onMouseEnter={() => setHoveredPoint({ comparisonId: item.id, monthIndex })}
                    onMouseLeave={() => setHoveredPoint(null)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm text-gray-900 dark:text-slate-100">
                          {item.label}
                        </span>
                      </div>
                      <div className="flex gap-4 text-xs">
                        <span style={{ color: item.color }} className="font-semibold">
                          {formatCurrency(value)}
                        </span>
                        {monthData && (
                          <span className={metaTextClasses}>
                            {monthData.cantidadMovimientos} mov.
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Tooltip detallado */}
                    {isHovered && monthData && (
                      <div className="absolute top-0 right-0 z-10 px-3 py-2 text-xs text-white bg-gray-900 rounded-lg shadow-lg dark:bg-slate-800">
                        <div className="space-y-1">
                          <div className="font-semibold">{item.label}</div>
                          <div className="text-gray-300">{month}</div>
                          <div className="flex justify-between space-x-4">
                            <span className="text-gray-300">Gasto:</span>
                            <span className="font-semibold text-emerald-300">
                              {formatCurrency(monthData.totalGasto)}
                            </span>
                          </div>
                          <div className="flex justify-between space-x-4">
                            <span className="text-gray-300">Movimientos:</span>
                            <span className="font-semibold text-sky-300">
                              {monthData.cantidadMovimientos}
                            </span>
                          </div>
                          <div className="flex justify-between space-x-4">
                            <span className="text-gray-300">Promedio:</span>
                            <span className="font-semibold text-amber-300">
                              {formatCurrency(promedio)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="relative h-6 bg-gray-200 rounded-full dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300 cursor-pointer"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: item.color,
                          opacity: isHovered ? 1 : 0.8,
                        }}
                        onClick={() => onSelectItem?.(item.id, { rawMonth: monthData?.rawMes })}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Renderizar gráfico de líneas (evolución mensual)
  const renderMonthlyChart = () => {
    // Combinar todos los meses únicos preservando el orden cronológico con rawMes
    const monthMap = new Map<string, string>();
    data.forEach((item) => {
      item.monthlyData.forEach((m) => {
        const raw = m.rawMes || m.mes;
        if (!monthMap.has(raw)) {
          monthMap.set(raw, m.mes);
        }
      });
    });

    const parseRawMonth = (value: string) => {
      if (!value) return Number.POSITIVE_INFINITY;
      if (value.includes("-")) {
        const [yearStr, monthStr] = value.split("-");
        const year = Number(yearStr);
        const month = Number(monthStr);
        if (!Number.isNaN(year) && !Number.isNaN(month)) {
          return new Date(year, month - 1, 1).getTime();
        }
      }
      if (value.includes("/")) {
        const [monthStr, yearStr] = value.split("/");
        const year = Number(yearStr);
        const month = Number(monthStr);
        if (!Number.isNaN(year) && !Number.isNaN(month)) {
          return new Date(year, month - 1, 1).getTime();
        }
      }
      return value;
    };

    const sortedMonths = Array.from(monthMap.entries())
      .sort((a, b) => {
        const orderA = parseRawMonth(a[0]);
        const orderB = parseRawMonth(b[0]);

        if (typeof orderA === "number" && typeof orderB === "number") {
          return orderA - orderB;
        }
        if (typeof orderA === "number") return -1;
        if (typeof orderB === "number") return 1;
        return String(orderA).localeCompare(String(orderB));
      })
      .map(([, label]) => label);

    if (sortedMonths.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500 dark:text-slate-400">
          No hay datos mensuales disponibles
        </div>
      );
    }

    // Calcular el valor máximo para escalar el gráfico
    const maxValue = Math.max(
      ...data.flatMap((item) =>
        item.monthlyData.map((m) => m.totalGasto)
      )
    ) || 1;

    return (
      <div className="space-y-6">
        {/* Leyenda */}
        <div className="flex flex-wrap gap-4">
          {data.map((item) => (
            <div key={item.id} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm font-medium text-gray-700 dark:text-slate-200">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Gráfico de líneas */}
        <div className="relative" style={{ height: "320px" }}>
          {/* Tooltip para el punto específico bajo el cursor */}
          {hoveredPoint && (() => {
            const item = data.find(d => d.id === hoveredPoint.comparisonId);
            if (!item) return null;
            
            const monthData = item.monthlyData.find((m) => m.mes === sortedMonths[hoveredPoint.monthIndex]);
            if (!monthData) return null;
            
            const promedio = monthData.cantidadMovimientos > 0 
              ? monthData.totalGasto / monthData.cantidadMovimientos 
              : 0;
            
            const x = 120 + (hoveredPoint.monthIndex * (840 / Math.max(1, sortedMonths.length - 1)));
            const y = 300 - (monthData.totalGasto / maxValue) * 280 + 10;
            
            return (
              <div
                className="absolute z-20 px-3 py-2 text-xs text-white bg-gray-900 rounded-lg shadow-lg dark:bg-slate-800 whitespace-nowrap pointer-events-none"
                style={{
                  left: `${(x / 1000) * 100}%`,
                  top: `${(y / 340) * 100}%`,
                  transform: 'translate(-50%, -120%)',
                }}
              >
                <div className="space-y-1">
                  <div className="font-semibold">{item.label}</div>
                  <div className="text-gray-300">{sortedMonths[hoveredPoint.monthIndex]}</div>
                  <div className="flex justify-between space-x-4">
                    <span className="text-gray-300">Gasto:</span>
                    <span className="font-semibold text-emerald-300">
                      {formatCurrency(monthData.totalGasto)}
                    </span>
                  </div>
                  <div className="flex justify-between space-x-4">
                    <span className="text-gray-300">Movimientos:</span>
                    <span className="font-semibold text-sky-300">
                      {monthData.cantidadMovimientos}
                    </span>
                  </div>
                  <div className="flex justify-between space-x-4">
                    <span className="text-gray-300">Promedio:</span>
                    <span className="font-semibold text-amber-300">
                      {formatCurrency(promedio)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}
          
          <svg viewBox="0 0 1000 340" preserveAspectRatio="xMidYMid meet" className="overflow-visible w-full h-full">
            {/* Líneas de grid horizontal */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
              <g key={ratio}>
                <line
                  x1={80}
                  y1={300 * (1 - ratio) + 10}
                  x2={980}
                  y2={300 * (1 - ratio) + 10}
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-gray-200 dark:text-slate-700"
                  strokeDasharray="4"
                />
                <text
                  x={60}
                  y={300 * (1 - ratio) + 15}
                  className="text-xs fill-gray-500 dark:fill-slate-400"
                >
                  {formatCurrency(maxValue * ratio)}
                </text>
              </g>
            ))}

            {/* Líneas de datos */}
            {data.map((item) => {
              const points = sortedMonths.map((month, index) => {
                const monthData = item.monthlyData.find((m) => m.mes === month);
                const value = monthData?.totalGasto || 0;
                const x = 120 + (index * (840 / Math.max(1, sortedMonths.length - 1)));
                const y = 300 - (value / maxValue) * 280 + 10;
                return { x, y, value, month, rawMonth: monthData?.rawMes };
              });

              const pathData = points
                .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
                .join(" ");

              return (
                <g key={item.id}>
                  {/* Línea */}
                  <path
                    d={pathData}
                    fill="none"
                    stroke={item.color}
                    strokeWidth="2"
                    className="transition-all"
                  />

                  {/* Puntos */}
                  {points.map((point, i) => {
                    const isHovered = hoveredPoint?.comparisonId === item.id && hoveredPoint?.monthIndex === i;
                    return (
                      <circle
                        key={i}
                        cx={point.x}
                        cy={point.y}
                        r={isHovered ? "7" : "5"}
                        fill={item.color}
                        className="cursor-pointer transition-all"
                        onMouseEnter={() => setHoveredPoint({ comparisonId: item.id, monthIndex: i })}
                        onMouseLeave={() => setHoveredPoint(null)}
                        onClick={() => onSelectItem?.(item.id, { rawMonth: point.rawMonth })}
                      />
                    );
                  })}
                </g>
              );
            })}

            {/* Etiquetas de meses */}
            {sortedMonths.map((month, index) => {
              const x = 120 + (index * (840 / Math.max(1, sortedMonths.length - 1)));
              return (
                <text
                  key={month}
                  x={x}
                  y={320}
                  className="text-xs fill-gray-600 dark:fill-slate-300"
                  textAnchor="middle"
                >
                  {month}
                </text>
              );
            })}
          </svg>
        </div>
      </div>
    );
  };

  // Gráfico combinado: barras y líneas por mes según configuración
  const renderComboChart = () => {
    // Combinar todos los meses únicos preservando el orden cronológico con rawMes
    const monthMap = new Map<string, string>();
    data.forEach((item) => {
      item.monthlyData.forEach((m) => {
        const raw = m.rawMes || m.mes;
        if (!monthMap.has(raw)) {
          monthMap.set(raw, m.mes);
        }
      });
    });

    const parseRawMonth = (value: string) => {
      if (!value) return Number.POSITIVE_INFINITY;
      if (value.includes("-")) {
        const [yearStr, monthStr] = value.split("-");
        const year = Number(yearStr);
        const month = Number(monthStr);
        if (!Number.isNaN(year) && !Number.isNaN(month)) {
          return new Date(year, month - 1, 1).getTime();
        }
      }
      if (value.includes("/")) {
        const [monthStr, yearStr] = value.split("/");
        const year = Number(yearStr);
        const month = Number(monthStr);
        if (!Number.isNaN(year) && !Number.isNaN(month)) {
          return new Date(year, month - 1, 1).getTime();
        }
      }
      return value;
    };

    const sortedMonths = Array.from(monthMap.entries())
      .sort((a, b) => {
        const orderA = parseRawMonth(a[0]);
        const orderB = parseRawMonth(b[0]);

        if (typeof orderA === "number" && typeof orderB === "number") {
          return orderA - orderB;
        }
        if (typeof orderA === "number") return -1;
        if (typeof orderB === "number") return 1;
        return String(orderA).localeCompare(String(orderB));
      })
      .map(([, label]) => label);

    if (sortedMonths.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500 dark:text-slate-400">
          No hay datos mensuales disponibles
        </div>
      );
    }

    // Calcular el valor máximo para escalar el gráfico
    const maxValue = Math.max(
      ...data.flatMap((item) =>
        item.monthlyData.map((m) => m.totalGasto)
      )
    ) || 1;

    return (
      <div className="space-y-6">
        {/* Leyenda con indicadores de tipo (barra/línea) */}
        <div className="flex flex-wrap gap-4">
          {data.map((item) => (
            <div key={item.id} className="flex items-center gap-2">
              {item.visualizationType === "line" ? (
                <div className="flex items-center gap-1">
                  <div
                    className="w-4 h-0.5"
                    style={{ backgroundColor: item.color }}
                  />
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                </div>
              ) : (
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: item.color }}
                />
              )}
              <span className="text-sm font-medium text-gray-700 dark:text-slate-200">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Gráfico combinado */}
        <div className="relative" style={{ height: "320px" }}>
          {/* Tooltip para el punto/barra específica bajo el cursor */}
          {hoveredPoint && (() => {
            const item = data.find(d => d.id === hoveredPoint.comparisonId);
            if (!item) return null;
            
            const monthData = item.monthlyData.find((m) => m.mes === sortedMonths[hoveredPoint.monthIndex]);
            if (!monthData) return null;
            
            const promedio = monthData.cantidadMovimientos > 0 
              ? monthData.totalGasto / monthData.cantidadMovimientos 
              : 0;
            
            const barItems = data.filter(d => d.visualizationType !== "line");
            const monthSpacing = sortedMonths.length > 1 ? 840 / (sortedMonths.length - 1) : 840;
            const maxGroupWidth = monthSpacing * 0.8;
            const calculatedBarWidth = barItems.length > 0 ? maxGroupWidth / barItems.length : 40;
            const barWidth = Math.min(40, Math.max(8, calculatedBarWidth));
            const groupWidth = barWidth * barItems.length;
            const barIndex = barItems.findIndex(d => d.id === item.id);
            const baseX = 120 + (hoveredPoint.monthIndex * (840 / Math.max(1, sortedMonths.length - 1)));
            
            let x = baseX;
            if (item.visualizationType !== "line") {
              x = baseX - groupWidth / 2 + barIndex * barWidth + barWidth / 2;
            }
            
            const y = 300 - (monthData.totalGasto / maxValue) * 280 + 10;
            
            return (
              <div
                className="absolute z-20 px-3 py-2 text-xs text-white bg-gray-900 rounded-lg shadow-lg dark:bg-slate-800 whitespace-nowrap pointer-events-none"
                style={{
                  left: `${(x / 1000) * 100}%`,
                  top: `${(y / 340) * 100}%`,
                  transform: 'translate(-50%, -120%)',
                }}
              >
                <div className="space-y-1">
                  <div className="font-semibold">{item.label}</div>
                  <div className="text-gray-300">{sortedMonths[hoveredPoint.monthIndex]}</div>
                  <div className="flex justify-between space-x-4">
                    <span className="text-gray-300">Gasto:</span>
                    <span className="font-semibold text-emerald-300">
                      {formatCurrency(monthData.totalGasto)}
                    </span>
                  </div>
                  <div className="flex justify-between space-x-4">
                    <span className="text-gray-300">Movimientos:</span>
                    <span className="font-semibold text-sky-300">
                      {monthData.cantidadMovimientos}
                    </span>
                  </div>
                  <div className="flex justify-between space-x-4">
                    <span className="text-gray-300">Promedio:</span>
                    <span className="font-semibold text-amber-300">
                      {formatCurrency(promedio)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}
          
          <svg viewBox="0 0 1000 340" preserveAspectRatio="xMidYMid meet" className="overflow-visible w-full h-full">
            {/* Líneas de grid horizontal */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
              <g key={ratio}>
                <line
                  x1={80}
                  y1={300 * (1 - ratio) + 10}
                  x2={980}
                  y2={300 * (1 - ratio) + 10}
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-gray-200 dark:text-slate-700"
                  strokeDasharray="4"
                />
                <text
                  x={60}
                  y={300 * (1 - ratio) + 15}
                  className="text-xs fill-gray-500 dark:fill-slate-400"
                >
                  {formatCurrency(maxValue * ratio)}
                </text>
              </g>
            ))}

            {/* Renderizar barras */}
            {(() => {
              const barItems = data.filter(item => item.visualizationType !== "line");
              // Calcular espaciado entre meses
              const monthSpacing = sortedMonths.length > 1 ? 840 / (sortedMonths.length - 1) : 840;
              // Calcular ancho máximo de grupo para no superponer con el siguiente mes
              const maxGroupWidth = monthSpacing * 0.8; // 80% del espacio disponible
              // Calcular ancho de barra para que el grupo no exceda maxGroupWidth
              const calculatedBarWidth = barItems.length > 0 ? maxGroupWidth / barItems.length : 40;
              const barWidth = Math.min(40, Math.max(8, calculatedBarWidth));
              const groupWidth = barWidth * barItems.length;

              return sortedMonths.map((month, monthIndex) => {
                const x = 120 + (monthIndex * (840 / Math.max(1, sortedMonths.length - 1)));
                
                return (
                  <g key={`month-${monthIndex}`}>
                    {barItems.map((item, barIndex) => {
                      const monthData = item.monthlyData.find((m) => m.mes === month);
                      const value = monthData?.totalGasto || 0;
                      const barHeight = (value / maxValue) * 280;
                      const barX = x - groupWidth / 2 + barIndex * barWidth;
                      const barY = 300 - barHeight + 10;
                      
                      const isHovered = hoveredPoint?.comparisonId === item.id && hoveredPoint?.monthIndex === monthIndex;
                      
                      return (
                        <rect
                          key={`bar-${item.id}-${monthIndex}`}
                          x={barX}
                          y={barY}
                          width={barWidth}
                          height={barHeight}
                          fill={item.color}
                          opacity={isHovered ? 1 : 0.85}
                          className="cursor-pointer transition-all"
                          onMouseEnter={() => setHoveredPoint({ comparisonId: item.id, monthIndex })}
                          onMouseLeave={() => setHoveredPoint(null)}
                          onClick={() => onSelectItem?.(item.id, { rawMonth: monthData?.rawMes })}
                        />
                      );
                    })}
                  </g>
                );
              });
            })()}

            {/* Renderizar líneas */}
            {data.filter(item => item.visualizationType === "line").map((item) => {
              const points = sortedMonths.map((month, index) => {
                const monthData = item.monthlyData.find((m) => m.mes === month);
                const value = monthData?.totalGasto || 0;
                const x = 120 + (index * (840 / Math.max(1, sortedMonths.length - 1)));
                const y = 300 - (value / maxValue) * 280 + 10;
                return { x, y, value, month, rawMonth: monthData?.rawMes };
              });

              const pathData = points
                .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
                .join(" ");

              return (
                <g key={item.id}>
                  {/* Línea */}
                  <path
                    d={pathData}
                    fill="none"
                    stroke={item.color}
                    strokeWidth="2"
                    className="transition-all"
                  />

                  {/* Puntos */}
                  {points.map((point, i) => {
                    const isHovered = hoveredPoint?.comparisonId === item.id && hoveredPoint?.monthIndex === i;
                    return (
                      <circle
                        key={i}
                        cx={point.x}
                        cy={point.y}
                        r={isHovered ? "7" : "5"}
                        fill={item.color}
                        className="cursor-pointer transition-all"
                        onMouseEnter={() => setHoveredPoint({ comparisonId: item.id, monthIndex: i })}
                        onMouseLeave={() => setHoveredPoint(null)}
                        onClick={() => onSelectItem?.(item.id, { rawMonth: point.rawMonth })}
                      />
                    );
                  })}
                </g>
              );
            })}

            {/* Etiquetas de meses */}
            {sortedMonths.map((month, index) => {
              const x = 120 + (index * (840 / Math.max(1, sortedMonths.length - 1)));
              return (
                <text
                  key={month}
                  x={x}
                  y={320}
                  className="text-xs fill-gray-600 dark:fill-slate-300"
                  textAnchor="middle"
                >
                  {month}
                </text>
              );
            })}
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className={containerClasses}>
      {/* Header con controles */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="flex-1 flex justify-center">
          {chartType === "bar" && (
            <div className="flex gap-2">
              <button
                onClick={() => onBarOrientationChange?.("horizontal")}
                className={`p-2 rounded-lg transition ${
                  barOrientation === "horizontal"
                    ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-400"
                }`}
                title="Barras horizontales"
              >
                <MoveHorizontal className="h-5 w-5" />
              </button>
              <button
                onClick={() => onBarOrientationChange?.("vertical")}
                className={`p-2 rounded-lg transition ${
                  barOrientation === "vertical"
                    ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-400"
                }`}
                title="Barras verticales"
              >
                <MoveVertical className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        {/* Selector de tipo de gráfico */}
        {onChartTypeChange && (
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => onChartTypeChange("bar")}
              className={`p-2 rounded-lg transition ${
                chartType === "bar"
                  ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-400"
              }`}
              title="Gráfico de barras"
            >
              <BarChart3 className="h-5 w-5" />
            </button>
            <button
              onClick={() => onChartTypeChange("monthly")}
              className={`p-2 rounded-lg transition ${
                chartType === "monthly"
                  ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-400"
              }`}
              title="Evolución mensual"
            >
              <TrendingUp className="h-5 w-5" />
            </button>
            <button
              onClick={() => onChartTypeChange("combo")}
              className={`p-2 rounded-lg transition ${
                chartType === "combo"
                  ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-400"
              }`}
              title="Barras + línea (combo)"
            >
              <BarChart3 className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Contenido del gráfico */}
      {chartType === "bar" && renderBarChart()}
      {chartType === "monthly" && renderMonthlyChart()}
      {chartType === "combo" && renderComboChart()}
    </div>
  );
};
