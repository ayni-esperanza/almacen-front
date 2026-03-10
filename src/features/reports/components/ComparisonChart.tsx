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
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

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
    const maxGasto = Math.max(...data.map((item) => item.totalGasto)) || 1;

    if (barOrientation === "vertical") {
      const barCount = data.length;
      const gap = 16;
      const barWidth = Math.max(24, Math.min(60, Math.floor(900 / Math.max(4, barCount * 1.5))));
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
            <div className="relative" style={{ height: chartHeight + 60 }}>
              {/* Grid horizontal */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
                <div
                  key={ratio}
                  className="absolute left-0 right-0 border-t border-dashed border-gray-200 dark:border-slate-700"
                  style={{ top: (1 - ratio) * chartHeight }}
                >
                  <span className="absolute -left-2 -translate-x-full text-xs text-gray-500 dark:text-slate-400">
                    {formatCurrency(maxGasto * ratio)}
                  </span>
                </div>
              ))}

              {/* Barras */}
              <div className="absolute bottom-0 left-14 flex items-end" style={{ gap }}>
                {data.map((item, index) => {
                  const height = (item.totalGasto / maxGasto) * chartHeight;
                  const isHovered = hoveredIndex === index;
                  return (
                    <div key={item.id} className="flex flex-col items-center gap-2">
                      <div
                        className="flex-1 flex items-end"
                        style={{ height: chartHeight }}
                      >
                        <div
                          className="w-full rounded-t-md transition-all duration-200 cursor-pointer"
                          style={{
                            width: barWidth,
                            height,
                            backgroundColor: item.color,
                            opacity: isHovered ? 1 : 0.8,
                          }}
                          onMouseEnter={() => setHoveredIndex(index)}
                          onMouseLeave={() => setHoveredIndex(null)}
                          onClick={() => onSelectItem?.(item.id)}
                          title={`${item.label}: ${formatCurrency(item.totalGasto)} (${item.cantidadMovimientos} mov.)`}
                        />
                      </div>
                      <div className="w-full text-center text-xs text-gray-700 dark:text-slate-300">
                        {item.label}
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

    // Horizontal (default)
    return (
      <div className="space-y-4">
        {data.map((item, index) => {
          const percentage = (item.totalGasto / maxGasto) * 100;
          const isHovered = hoveredIndex === index;

          return (
            <div
              key={item.id}
              className="relative"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-medium text-gray-900 dark:text-slate-100">
                    {item.label}
                  </span>
                </div>
                <div className="flex gap-4 text-sm">
                  <span style={{ color: item.color }} className="font-semibold">
                    {formatCurrency(item.totalGasto)}
                  </span>
                  <span className={metaTextClasses}>
                    {item.cantidadMovimientos} mov.
                  </span>
                </div>
              </div>

              <div className="relative h-8 bg-gray-200 rounded-full dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300 cursor-pointer"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: item.color,
                    opacity: isHovered ? 1 : 0.8,
                  }}
                  onClick={() => onSelectItem?.(item.id)}
                  title={`${item.label}: ${formatCurrency(item.totalGasto)} (${item.cantidadMovimientos} mov.)`}
                />
              </div>
            </div>
          );
        })}
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
                  {points.map((point, i) => (
                    <circle
                      key={i}
                      cx={point.x}
                      cy={point.y}
                      r="5"
                      fill={item.color}
                      className="cursor-pointer hover:r-6 transition-all"
                      onMouseEnter={() => setHoveredIndex(i)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      onClick={() => onSelectItem?.(item.id, { rawMonth: point.rawMonth })}
                    >
                      <title>
                        {item.label} - {point.month}: {formatCurrency(point.value)}
                      </title>
                    </circle>
                  ))}
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

  // Gráfico combinado: barras (gasto) + línea (movimientos)
  const renderComboChart = () => {
    const maxGasto = Math.max(...data.map((d) => d.totalGasto)) || 1;
    const maxMov = Math.max(...data.map((d) => d.cantidadMovimientos)) || 1;

    return (
      <div className="space-y-4">
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

        <div className="relative" style={{ height: "320px" }}>
          <svg viewBox="0 0 1000 340" preserveAspectRatio="xMidYMid meet" className="overflow-visible w-full h-full">
            {/* Grid horizontal */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
              <line
                key={ratio}
                x1={80}
                y1={300 * (1 - ratio) + 10}
                x2={980}
                y2={300 * (1 - ratio) + 10}
                stroke="currentColor"
                strokeWidth="1"
                className="text-gray-200 dark:text-slate-700"
                strokeDasharray="4"
              />
            ))}

            {data.map((item, idx) => {
              const x = 120 + (idx * (840 / Math.max(1, data.length - 1)));
              const barHeight = (item.totalGasto / maxGasto) * 260;
              const yBar = 300 - barHeight + 10;
              const yLine = 300 - (item.cantidadMovimientos / maxMov) * 260 + 10;

              return (
                <g key={item.id}>
                  {/* Barra */}
                  <rect
                    x={x - 14}
                    y={yBar}
                    width={28}
                    height={barHeight}
                    fill={item.color}
                    opacity={0.85}
                    className="cursor-pointer"
                    onClick={() => onSelectItem?.(item.id)}
                  />
                  {/* Línea de movs */}
                  <circle
                    cx={x}
                    cy={yLine}
                    r={6}
                    fill="transparent"
                    stroke={item.color}
                    strokeWidth={2}
                    className="cursor-pointer"
                    onClick={() => onSelectItem?.(item.id)}
                  />
                </g>
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
