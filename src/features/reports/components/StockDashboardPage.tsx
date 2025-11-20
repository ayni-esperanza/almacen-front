import { useState } from "react";
import { useStockDashboard } from "../hooks/useStockDashboard";

export const StockDashboardPage = () => {
  const [period, setPeriod] = useState(30);
  const { dashboard, refetch } = useStockDashboard(period);

  const handlePeriodChange = (newPeriod: number) => {
    setPeriod(newPeriod);
    refetch(newPeriod);
  };

  if (!dashboard) {
    return (
      <div className="py-8 text-center text-gray-500 dark:text-slate-400">
        No hay datos disponibles
      </div>
    );
  }

  return (
    <div className="p-3 space-y-4 sm:p-6 sm:space-y-6">
      {/* Header con selector de período - Responsive */}
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-slate-100">
          Dashboard de Stock
        </h1>
        <div className="flex w-full gap-2 sm:w-auto">
          <button
            onClick={() => handlePeriodChange(7)}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm rounded transition-colors ${
              period === 7
                ? "bg-blue-600 text-white dark:bg-emerald-600 dark:text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
            }`}
          >
            7 días
          </button>
          <button
            onClick={() => handlePeriodChange(30)}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm rounded transition-colors ${
              period === 30
                ? "bg-blue-600 text-white dark:bg-emerald-600 dark:text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
            }`}
          >
            30 días
          </button>
          <button
            onClick={() => handlePeriodChange(90)}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm rounded transition-colors ${
              period === 90
                ? "bg-blue-600 text-white dark:bg-emerald-600 dark:text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
            }`}
          >
            90 días
          </button>
        </div>
      </div>

      {/* Grid de métricas - Responsive */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Métrica 1: Total Productos */}
        <div className="p-4 bg-white rounded-lg shadow sm:p-6 dark:bg-slate-900 dark:border dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 sm:text-sm dark:text-slate-400">
                Total de Productos
              </p>
              <p className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl dark:text-slate-100">
                {dashboard.totalProductos.toLocaleString()}
              </p>
            </div>
            <div className="p-2 bg-blue-100 rounded-full sm:p-3 dark:bg-blue-500/10">
              <svg
                className="w-6 h-6 text-blue-600 sm:w-8 sm:h-8 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Métrica 2: Valor Total */}
        <div className="p-4 bg-white rounded-lg shadow sm:p-6 dark:bg-slate-900 dark:border dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 sm:text-sm dark:text-slate-400">
                Valor Total Inventario
              </p>
              <p className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl dark:text-slate-100">
                S/.{" "}
                {dashboard.valorTotalInventario.toLocaleString("es-PE", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="p-2 bg-green-100 rounded-full sm:p-3 dark:bg-green-500/10">
              <svg
                className="w-6 h-6 text-green-600 sm:w-8 sm:h-8 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Métrica 3: Producto Crítico */}
        <div className="p-4 bg-white rounded-lg shadow sm:p-6 dark:bg-slate-900 dark:border dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-gray-600 sm:text-sm dark:text-slate-400">
              Producto Crítico
            </p>
            <div className="p-2 bg-red-100 rounded-full sm:p-3 dark:bg-red-500/10">
              <svg
                className="w-6 h-6 text-red-600 sm:w-8 sm:h-8 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>
          {dashboard.productoCritico ? (
            <div>
              <p className="text-base font-semibold text-gray-900 sm:text-lg dark:text-slate-100">
                {dashboard.productoCritico.nombre}
              </p>
              <div className="mt-2 space-y-1">
                <p className="text-xs text-gray-600 sm:text-sm dark:text-slate-400">
                  Stock:{" "}
                  <span className="font-medium text-red-600 dark:text-red-400">
                    {dashboard.productoCritico.stockActual}
                  </span>
                  {" / "}
                  <span className="font-medium dark:text-slate-300">
                    {dashboard.productoCritico.stockMinimo}
                  </span>{" "}
                  (mínimo)
                </p>
                <div className="w-full h-2 mt-2 bg-gray-200 rounded-full dark:bg-slate-700">
                  <div
                    className="h-2 bg-red-600 rounded-full dark:bg-red-500"
                    style={{
                      width: `${Math.min(
                        (dashboard.productoCritico.stockActual /
                          dashboard.productoCritico.stockMinimo) *
                          100,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs italic text-gray-500 sm:text-sm dark:text-slate-400">
              Sin productos críticos
            </p>
          )}
        </div>

        {/* Métrica 4: Producto Menos Movido */}
        <div className="p-4 bg-white rounded-lg shadow sm:p-6 dark:bg-slate-900 dark:border dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-gray-600 sm:text-sm dark:text-slate-400">
              Menos Movido (últimos {period} días)
            </p>
            <div className="p-2 bg-orange-100 rounded-full sm:p-3 dark:bg-orange-500/10">
              <svg
                className="w-6 h-6 text-orange-600 sm:w-8 sm:h-8 dark:text-orange-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
          {dashboard.productoMenosMovido ? (
            <div>
              <p className="text-base font-semibold text-gray-900 sm:text-lg dark:text-slate-100">
                {dashboard.productoMenosMovido.nombre}
              </p>
              <div className="mt-2 space-y-1">
                <p className="text-xs text-gray-600 sm:text-sm dark:text-slate-400">
                  Movimientos:{" "}
                  <span className="font-medium text-orange-600 dark:text-orange-400">
                    {dashboard.productoMenosMovido.cantidadMovimientos}
                  </span>
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs italic text-gray-500 sm:text-sm dark:text-slate-400">
              Sin datos de movimientos
            </p>
          )}
        </div>

        {/* Métrica 5: Producto Más Movido */}
        <div className="p-4 bg-white rounded-lg shadow sm:p-6 dark:bg-slate-900 dark:border dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-gray-600 sm:text-sm dark:text-slate-400">
              Más Movido (últimos {period} días)
            </p>
            <div className="p-2 bg-purple-100 rounded-full sm:p-3 dark:bg-purple-500/10">
              <svg
                className="w-6 h-6 text-purple-600 sm:w-8 sm:h-8 dark:text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
          </div>
          {dashboard.productoMasMovido ? (
            <div>
              <p className="text-base font-semibold text-gray-900 sm:text-lg dark:text-slate-100">
                {dashboard.productoMasMovido.nombre}
              </p>
              <div className="mt-2 space-y-1">
                <p className="text-xs text-gray-600 sm:text-sm dark:text-slate-400">
                  Movimientos:{" "}
                  <span className="font-medium text-purple-600 dark:text-purple-400">
                    {dashboard.productoMasMovido.cantidadMovimientos}
                  </span>
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs italic text-gray-500 sm:text-sm dark:text-slate-400">
              Sin datos de movimientos
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

