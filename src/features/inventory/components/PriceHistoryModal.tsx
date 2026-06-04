import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  CalendarDays,
  History,
  Search,
  TrendingUp,
  X,
} from "lucide-react";
import DatePicker from "react-datepicker";
import { es } from "date-fns/locale";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { inventoryService } from "../../../shared/services/inventory.service";
import { useClickOutside } from "../../../shared/hooks/useClickOutside";
import { useEscapeKey } from "../../../shared/hooks/useEscapeKey";
import { useModalScrollLock } from "../../../shared/hooks/useModalScrollLock";
import { PriceHistoryRecord } from "../types";

interface PriceHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProductCode?: string;
  initialProductName?: string;
}

const formatCurrency = (value: number) => `S/ ${Number(value).toFixed(2)}`;

const formatDateForApi = (value: Date | null) =>
  value ? value.toISOString().split("T")[0] : "";

const parseFilterDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
};

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

const getUserLabel = (record: PriceHistoryRecord) => {
  if (!record.usuario) return "No registrado";
  const fullName = [record.usuario.firstName, record.usuario.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  return fullName || record.usuario.username;
};

export const PriceHistoryModal: React.FC<PriceHistoryModalProps> = ({
  isOpen,
  onClose,
  initialProductCode = "",
  initialProductName,
}) => {
  useModalScrollLock(isOpen);
  useEscapeKey(onClose, isOpen);

  const modalRef = useRef<HTMLDivElement>(null);
  useClickOutside(modalRef, onClose, isOpen);

  const [producto, setProducto] = useState(initialProductCode);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [history, setHistory] = useState<PriceHistoryRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isDarkMode =
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark");
  useEffect(() => {
    if (isOpen) {
      setProducto(initialProductCode);
      setFechaInicio("");
      setFechaFin("");
    }
  }, [initialProductCode, isOpen]);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await inventoryService.getPriceHistory({
        producto: producto.trim() || undefined,
        fechaInicio: fechaInicio || undefined,
        fechaFin: fechaFin || undefined,
      });
      setHistory(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo cargar el historial de precios",
      );
    } finally {
      setLoading(false);
    }
  }, [fechaFin, fechaInicio, producto]);

  useEffect(() => {
    if (!isOpen) return;

    const timeoutId = window.setTimeout(() => {
      fetchHistory();
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [fetchHistory, isOpen]);

  const chartData = useMemo(
    () =>
      [...history]
        .reverse()
        .map((record) => ({
          pointKey: `${record.fechaCambio}-${record.id}`,
          fecha: formatDateTime(record.fechaCambio),
          precioAnterior: record.precioAnterior,
          precioNuevo: record.precioNuevo,
          usuario: getUserLabel(record),
          producto: record.product?.nombre || record.productoId,
        })),
    [history],
  );

  const resetFilters = () => {
    setProducto(initialProductCode);
    setFechaInicio("");
    setFechaFin("");
  };

  const renderTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{
      name: string;
      value: number;
      color: string;
      dataKey?: string | number;
      payload?: { fecha?: string };
    }>;
    label?: string;
  }) => {
    if (!active || !payload?.length) return null;
    const activeLabel = payload[0]?.payload?.fecha ?? label;

    return (
      <div
        className={`min-w-[180px] rounded-xl border px-3 py-2 shadow-lg ${
          isDarkMode
            ? "border-slate-700 bg-slate-900 text-slate-100"
            : "border-slate-200 bg-white text-slate-800"
        }`}
      >
        <p className="mb-2 text-xs font-semibold">{activeLabel}</p>
        {payload.map((entry) => {
          const isPreviousPrice =
            entry.dataKey === "precioAnterior" || entry.name === "Precio anterior";

          return (
            <div
              key={`${entry.dataKey ?? entry.name}`}
              className="flex items-center justify-between gap-3 text-xs"
            >
              <span className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                {isPreviousPrice ? "Precio anterior" : "Precio nuevo"}
              </span>
              <span className="font-semibold">
                {formatCurrency(Number(entry.value))}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm dark:bg-slate-950/70">
      <div
        ref={modalRef}
        className="flex w-full max-w-6xl max-h-[94vh] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:border dark:border-slate-800 dark:bg-slate-950"
      >
        <div className="flex items-center justify-between gap-4 bg-gradient-to-r from-green-500 to-green-600 px-5 py-4 text-white">
          <div className="flex items-center gap-3">
            <History className="w-5 h-5" />
            <div>
              <h2 className="text-lg font-bold">Historial de precios</h2>
              {initialProductName && (
                <p className="text-xs text-emerald-50">{initialProductName}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 transition-colors rounded-full hover:bg-white/15"
            aria-label="Cerrar historial de precios"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="alerts-scroll flex-1 overflow-y-auto">
          <div className="grid gap-3 border-b border-gray-200 bg-gray-50 p-4 md:grid-cols-[1.3fr_1fr_1fr_auto] dark:border-slate-800 dark:bg-slate-900">
            <label className="block">
              <span className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-slate-200">
                <Search className="w-3.5 h-3.5" />
                Producto
              </span>
              <input
                type="text"
                value={producto}
                onChange={(e) => setProducto(e.target.value)}
                placeholder="Codigo del producto"
                className="app-field h-10 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm leading-5 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
              />
            </label>
            <label className="block">
              <span className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-slate-200">
                <CalendarDays className="w-3.5 h-3.5" />
                Fecha inicio
              </span>
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-green-600 dark:text-emerald-400" />
                <DatePicker
                  selected={fechaInicio ? parseFilterDate(fechaInicio) : null}
                  onChange={(date: Date | null) => setFechaInicio(formatDateForApi(date))}
                  dateFormat="dd/MM/yyyy"
                  locale={es}
                  placeholderText="dd/mm/aaaa"
                  maxDate={fechaFin ? parseFilterDate(fechaFin) : undefined}
                  fixedHeight
                  portalId="root"
                  wrapperClassName="date-field-wrapper block w-full"
                  calendarClassName="app-datepicker app-datepicker--green"
                  popperClassName="app-datepicker-popper app-datepicker-popper--green"
                  className="app-field h-10 w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 text-sm leading-5 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                />
              </div>
            </label>
            <label className="block">
              <span className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-slate-200">
                <CalendarDays className="w-3.5 h-3.5" />
                Fecha fin
              </span>
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-green-600 dark:text-emerald-400" />
                <DatePicker
                  selected={fechaFin ? parseFilterDate(fechaFin) : null}
                  onChange={(date: Date | null) => setFechaFin(formatDateForApi(date))}
                  dateFormat="dd/MM/yyyy"
                  locale={es}
                  placeholderText="dd/mm/aaaa"
                  minDate={fechaInicio ? parseFilterDate(fechaInicio) : undefined}
                  fixedHeight
                  portalId="root"
                  wrapperClassName="date-field-wrapper block w-full"
                  calendarClassName="app-datepicker app-datepicker--green"
                  popperClassName="app-datepicker-popper app-datepicker-popper--green"
                  className="app-field h-10 w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 text-sm leading-5 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                />
              </div>
            </label>
            {(producto !== initialProductCode || Boolean(fechaInicio) || Boolean(fechaFin)) && (
              <button
                type="button"
                onClick={resetFilters}
                disabled={loading}
                aria-label="Limpiar filtros"
                title="Limpiar filtros"
                className="mt-5 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="p-4">
            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
                {error}
              </div>
            )}

            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-slate-100">
              <TrendingUp className="w-4 h-4 text-green-600 dark:text-emerald-300" />
              Cambios registrados: {history.length}
            </div>

            <div className="h-72 rounded-xl border border-gray-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
              {loading ? (
                <div className="flex h-full items-center justify-center text-sm text-gray-500 dark:text-slate-400">
                  Cargando historial...
                </div>
              ) : chartData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-gray-500 dark:text-slate-400">
                  No hay cambios de precio para los filtros seleccionados.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={isDarkMode ? "#334155" : "#e5e7eb"}
                    />
                    <XAxis
                      dataKey="pointKey"
                      tickFormatter={(value) =>
                        chartData.find((item) => item.pointKey === value)?.fecha ?? ""
                      }
                      tick={{ fontSize: 11, fill: isDarkMode ? "#cbd5e1" : "#475569" }}
                      minTickGap={20}
                    />
                    <YAxis
                      tickFormatter={(value) => `S/ ${value}`}
                      tick={{ fontSize: 11, fill: isDarkMode ? "#cbd5e1" : "#475569" }}
                    />
                    <Tooltip
                      content={renderTooltip}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="precioAnterior"
                      name="Precio anterior"
                      stroke="#64748b"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="precioNuevo"
                      name="Precio nuevo"
                      stroke="#059669"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 dark:border-slate-800">
              <table className="min-w-[880px] w-full text-xs text-gray-700 dark:text-slate-200">
                <thead className="bg-gray-50 dark:bg-slate-900">
                  <tr>
                    <th className="px-3 py-3 text-left font-semibold">Fecha</th>
                    <th className="px-3 py-3 text-left font-semibold">Producto</th>
                    <th className="px-3 py-3 text-left font-semibold">Precio anterior</th>
                    <th className="px-3 py-3 text-left font-semibold">Precio nuevo</th>
                    <th className="px-3 py-3 text-left font-semibold">Usuario</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white dark:divide-slate-800 dark:bg-slate-950">
                  {history.map((record) => (
                    <tr key={record.id}>
                      <td className="px-3 py-2">{formatDateTime(record.fechaCambio)}</td>
                      <td className="px-3 py-2">
                        <span className="font-semibold">{record.productoId}</span>
                        <span className="ml-2 text-gray-500 dark:text-slate-400">
                          {record.product?.nombre || ""}
                        </span>
                      </td>
                      <td className="px-3 py-2">{formatCurrency(record.precioAnterior)}</td>
                      <td className="px-3 py-2 font-semibold text-green-700 dark:text-emerald-300">
                        {formatCurrency(record.precioNuevo)}
                      </td>
                      <td className="px-3 py-2">{getUserLabel(record)}</td>
                    </tr>
                  ))}
                  {!loading && history.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-3 py-6 text-center text-gray-500 dark:text-slate-400">
                        Sin registros para mostrar.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
