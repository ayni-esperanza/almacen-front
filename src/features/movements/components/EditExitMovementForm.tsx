import React, { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { MovementExit } from "../types/index.ts";
import { UpdateExitData } from "../../../shared/services/movements.service.ts";
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

interface EditExitMovementFormProps {
  exit: MovementExit;
  onSubmit: (data: UpdateExitData) => Promise<void> | void;
  onCancel: () => void;
  onDelete?: (exit: MovementExit) => Promise<void> | void;
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

export const EditExitMovementForm: React.FC<EditExitMovementFormProps> = ({
  exit,
  onSubmit,
  onCancel,
  onDelete,
}) => {
  // Bloquear scroll
  useModalScrollLock(true);
  // Cerrar modal con tecla ESC
  useEscapeKey(onCancel);
  // Referencia para detectar clicks fuera de la modal
  const modalRef = useRef<HTMLDivElement>(null);
  // Cerrar modal al hacer click fuera
  useClickOutside(modalRef, onCancel, true);

  const initialState = useMemo(
    () => ({
      fecha: toISODate(exit.fecha),
      codigoProducto: exit.codigoProducto ?? "",
      descripcion: exit.descripcion ?? "",
      cantidad: exit.cantidad ? String(exit.cantidad) : "1",
      responsable: exit.responsable ?? "",
      area: exit.area ?? "",
      proyecto: exit.proyecto ?? "",
    }),
    [exit]
  );

  const [formData, setFormData] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    setFormData(initialState);
    setErrorMessage(null);
  }, [initialState]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    if (name === "cantidad") {
      setErrorMessage(null);
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsedQuantity = parseInt(formData.cantidad, 10);
    if (!Number.isFinite(parsedQuantity) || parsedQuantity < 1) {
      setErrorMessage("La cantidad debe ser al menos 1.");
      return;
    }

    if (!formData.area) {
      setErrorMessage("Selecciona un área.");
      return;
    }

    if (!formData.responsable.trim()) {
      setErrorMessage("Ingresa un responsable.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const payload: UpdateExitData = {
        fecha: formData.fecha,
        descripcion: formData.descripcion.trim(),
        cantidad: parsedQuantity,
        responsable: formData.responsable.trim(),
        area: formData.area.trim(),
        proyecto: formData.proyecto.trim(),
      };

      await onSubmit(payload);
      if (mountedRef.current) {
        setSubmitting(false);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar la salida"
      );
      if (mountedRef.current) {
        setSubmitting(false);
      }
    }
  };

  const labelClasses =
    "flex flex-col gap-1.5 text-xs font-semibold text-gray-700 dark:text-slate-200";
  const inputClasses =
    "w-full rounded-xl border border-gray-300 px-3 py-1.5 text-sm text-gray-700 transition focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-rose-400 dark:focus:ring-rose-500/30 [color-scheme:light] dark:[color-scheme:dark] cursor-pointer";
  const disabledInputClasses =
    "w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-100 px-3 py-1.5 text-sm text-gray-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400";
  const footerButtonClasses =
    "rounded-full border border-gray-300 px-4 py-1.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900/60";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm dark:bg-slate-950/70">
      <div
        ref={modalRef}
        className="w-full max-w-3xl max-h-95vh overflow-hidden rounded-3xl border border-transparent bg-white shadow-2xl transition-colors dark:border-slate-800 dark:bg-slate-950 flex flex-col"
      >
        <div className="flex items-center justify-between rounded-t-3xl bg-gradient-to-r from-red-500 to-red-600 px-4 py-2 text-white flex-shrink-0">
          <h2 className="text-base font-semibold">Editar Salida de Producto</h2>
          <button
            type="button"
            onClick={onCancel}
            className="p-1 transition-colors rounded-full hover:bg-white/20"
            disabled={submitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <form
            onSubmit={handleSubmit}
            className="px-4 pt-4 pb-4 space-y-2 transition-colors bg-white dark:bg-slate-950"
          >
            <div className="grid gap-3 md:grid-cols-2">
              <label className={labelClasses}>
                <span className="flex items-center gap-2">Fecha *</span>
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
                <span>Código *</span>
                <input
                  type="text"
                  name="codigoProducto"
                  value={formData.codigoProducto}
                  disabled
                  className={disabledInputClasses}
                />
              </label>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
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

              <label className={labelClasses}>
                <span>Cantidad *</span>
                <input
                  type="number"
                  name="cantidad"
                  value={formData.cantidad}
                  onChange={handleChange}
                  className={inputClasses}
                  placeholder="Ingresa la cantidad"
                  min={1}
                  required
                  disabled={submitting}
                />
              </label>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <SearchableSelect
                name="area"
                label="Área *"
                value={formData.area}
                onChange={(value) => setFormData({ ...formData, area: value })}
                options={AREAS_MOVIMIENTOS}
                placeholder="Selecciona un área"
                required
              />

              <label className={labelClasses}>
                <span>Proyecto</span>
                <input
                  type="text"
                  name="proyecto"
                  value={formData.proyecto}
                  onChange={handleChange}
                  className={inputClasses}
                  placeholder="Proyecto asignado"
                  disabled={submitting}
                />
              </label>

              <label className={labelClasses}>
                <span>Responsable *</span>
                <input
                  type="text"
                  name="responsable"
                  value={formData.responsable}
                  onChange={handleChange}
                  className={inputClasses}
                  placeholder="Nombre del responsable"
                  required
                  disabled={submitting}
                />
              </label>
            </div>

            {errorMessage && (
              <div className="px-3 py-2 text-sm text-red-700 border border-red-200 rounded-xl bg-red-50 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
                {errorMessage}
              </div>
            )}

            <div className="flex flex-col gap-2 pt-2 border-t border-gray-200 dark:border-slate-800 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  if (!onDelete) {
                    console.info("Eliminar salida pendiente de integración");
                    return;
                  }
                  const confirmed = window.confirm("¿Eliminar esta salida de inventario?");
                  if (!confirmed) return;
                  onDelete(exit);
                }}
                className="rounded-full border border-red-200 px-4 py-1.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-500/40 dark:text-red-200 dark:hover:bg-red-500/10"
                disabled={submitting}
              >
                Eliminar
              </button>
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
                className="px-4 py-1.5 text-sm font-semibold text-white transition-colors bg-red-500 rounded-full shadow-md hover:bg-red-600 disabled:opacity-60 dark:bg-rose-600 dark:hover:bg-rose-500"
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
