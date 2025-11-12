import React, { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { MovementEntry } from "../types";
import { UpdateEntryData } from "../../../shared/services/movements.service.ts";
import { useModalScrollLock } from "../../../shared/hooks/useModalScrollLock";
import { useEscapeKey } from "../../../shared/hooks/useEscapeKey";
import { useClickOutside } from "../../../shared/hooks/useClickOutside";
import { SearchableSelect } from "../../../shared/components/SearchableSelect";

// Áreas predefinidas para movimientos
const AREAS_MOVIMIENTOS = [
  "Almacén",
  "Contabilidad",
  "Electricidad",
  "Extrusora",
  "Fibra",
  "Líneas de vida",
  "Mecánica",
  "Metalmecánica",
  "Oficina",
  "Pozos",
  "Torres de Enfriamiento",
];

interface EditMovementFormProps {
  entry: MovementEntry;
  onSubmit: (data: UpdateEntryData) => Promise<void> | void;
  onCancel: () => void;
}

function toISODate(date: string | undefined): string {
  if (!date) return "";
  if (date.includes("/")) {
    const [dd, mm, yyyy] = date.split("/");
    if (dd && mm && yyyy) {
      return `${yyyy.padStart(4, "0")}-${mm.padStart(2, "0")}-${dd.padStart(
        2,
        "0"
      )}`;
    }
  }
  return date;
}

export const EditMovementForm: React.FC<EditMovementFormProps> = ({
  entry,
  onSubmit,
  onCancel,
}) => {
  // Bloquear scroll de la ventana
  useModalScrollLock(true);
  // Cerrar modal con tecla ESC
  useEscapeKey(onCancel);
  // Referencia para detectar clicks fuera de la modal
  const modalRef = useRef<HTMLDivElement>(null);
  // Cerrar modal al hacer click fuera
  useClickOutside(modalRef, onCancel, true);

  const initialState = useMemo(
    () => ({
      codigoProducto: entry.codigoProducto ?? "",
      descripcion: entry.descripcion ?? "",
      fecha: toISODate(entry.fecha),
      cantidad: entry.cantidad ? String(entry.cantidad) : "1",
      precioUnitario: entry.precioUnitario
        ? entry.precioUnitario.toFixed(2)
        : "0.00",
      area: entry.area ?? "",
    }),
    [entry]
  );

  const [formData, setFormData] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isMountedRef = useRef(false);

  useEffect(() => {
    setFormData(initialState);
    setErrorMessage(null);
  }, [initialState]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    if (name === "precioUnitario" || name === "cantidad") {
      setErrorMessage(null);
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsedPrice = parseFloat(formData.precioUnitario);
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setErrorMessage("El precio unitario debe ser mayor a 0.");
      return;
    }

    const parsedQuantity = parseInt(formData.cantidad, 10);
    if (!Number.isFinite(parsedQuantity) || parsedQuantity < 1) {
      setErrorMessage("La cantidad debe ser al menos 1.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const payload: UpdateEntryData = {
        fecha: formData.fecha,
        descripcion: formData.descripcion.trim(),
        precioUnitario: parsedPrice,
        cantidad: parsedQuantity,
        area: formData.area.trim() || null,
      };

      await onSubmit(payload);
      if (isMountedRef.current) {
        setSubmitting(false);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar la entrada"
      );
      if (isMountedRef.current) {
        setSubmitting(false);
      }
    }
  };

  const labelClasses =
    "flex flex-col gap-2 text-sm font-semibold text-gray-700 dark:text-slate-200";
  const inputClasses =
    "w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-700 transition focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-emerald-400 dark:focus:ring-emerald-500/30";
  const disabledInputClasses =
    "w-full cursor-not-allowed rounded-2xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400";
  const footerButtonClasses =
    "rounded-full border border-gray-300 px-6 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900/60";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm dark:bg-slate-950/70">
      <div
        ref={modalRef}
        className="w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-[32px] border border-transparent bg-white shadow-2xl transition-colors dark:border-slate-800 dark:bg-slate-950 flex flex-col"
      >
        <div className="flex items-center justify-between rounded-t-[32px] bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 text-white flex-shrink-0">
          <h2 className="text-xl font-semibold">Editar Entrada de Producto</h2>
          <button
            type="button"
            onClick={onCancel}
            className="p-1 transition-colors rounded-full hover:bg-white/20"
            disabled={submitting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <form
            onSubmit={handleSubmit}
            className="px-8 pt-6 pb-8 space-y-8 transition-colors bg-white dark:bg-slate-950"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <label className={labelClasses}>
                <span>Código del Producto</span>
                <input
                  type="text"
                  name="codigoProducto"
                  value={formData.codigoProducto}
                  disabled
                  className={disabledInputClasses}
                />
              </label>

              <label className={labelClasses}>
                <span>Nombre *</span>
                <input
                  type="text"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  className={inputClasses}
                  placeholder="Nombre del producto"
                  required
                  disabled={submitting}
                />
              </label>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className={labelClasses}>
                <span>Fecha *</span>
                <input
                  type="date"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleChange}
                  className={inputClasses}
                  required
                  disabled={submitting}
                />
              </label>

              <label className={labelClasses}>
                <span>Cantidad *</span>
                <input
                  type="number"
                  name="cantidad"
                  value={formData.cantidad}
                  onChange={handleChange}
                  className={inputClasses}
                  min={1}
                  required
                  disabled={submitting}
                />
              </label>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className={labelClasses}>
                <span>Precio Unitario (S/)</span>
                <input
                  type="number"
                  step="0.01"
                  name="precioUnitario"
                  value={formData.precioUnitario}
                  onChange={handleChange}
                  className={inputClasses}
                  min="0.01"
                  required
                  disabled={submitting}
                />
              </label>

              <SearchableSelect
                name="area"
                label="Área"
                value={formData.area}
                onChange={(value) => setFormData({ ...formData, area: value })}
                options={AREAS_MOVIMIENTOS}
                placeholder="Selecciona un área"
              />
            </div>

            {errorMessage && (
              <div className="px-4 py-3 text-sm text-red-700 border border-red-200 rounded-2xl bg-red-50 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
                {errorMessage}
              </div>
            )}

            <div className="flex flex-col gap-4 pt-6 border-t border-gray-200 dark:border-slate-800 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onCancel}
                className={footerButtonClasses}
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2 text-sm font-semibold text-white transition-colors bg-green-600 rounded-full shadow-md hover:bg-green-700 disabled:opacity-60 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                disabled={submitting}
              >
                {submitting ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
