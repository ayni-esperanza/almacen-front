import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { MovementExit } from '../types/index.ts';
import { UpdateExitData } from '../../../shared/services/movements.service.ts';
import { areas } from '../../inventory/data/mockData.ts';

interface EditExitMovementFormProps {
  exit: MovementExit;
  onSubmit: (data: UpdateExitData) => Promise<void> | void;
  onCancel: () => void;
}

function toISODate(date: string | undefined): string {
  if (!date) return '';
  if (date.includes('/')) {
    const [dd, mm, yyyy] = date.split('/');
    if (dd && mm && yyyy) {
      return `${yyyy.padStart(4, '0')}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
    }
  }
  return date;
}

export const EditExitMovementForm: React.FC<EditExitMovementFormProps> = ({ exit, onSubmit, onCancel }) => {
  const initialState = useMemo(
    () => ({
      fecha: toISODate(exit.fecha),
      codigoProducto: exit.codigoProducto ?? '',
      descripcion: exit.descripcion ?? '',
      cantidad: exit.cantidad ? String(exit.cantidad) : '1',
      responsable: exit.responsable ?? '',
      area: exit.area ?? '',
      proyecto: exit.proyecto ?? ''
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

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    if (name === 'cantidad') {
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
      setErrorMessage('La cantidad debe ser al menos 1.');
      return;
    }

    if (!formData.area) {
      setErrorMessage('Selecciona un área.');
      return;
    }

    if (!formData.responsable.trim()) {
      setErrorMessage('Ingresa un responsable.');
      return;
    }

    if (!formData.proyecto.trim()) {
      setErrorMessage('El proyecto es obligatorio.');
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
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo actualizar la salida');
      if (mountedRef.current) {
        setSubmitting(false);
      }
    }
  };

  const labelClasses = 'flex flex-col gap-2 text-sm font-semibold text-gray-700 dark:text-slate-200';
  const inputClasses = 'w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-700 transition focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-rose-400 dark:focus:ring-rose-500/30';
  const disabledInputClasses = 'w-full cursor-not-allowed rounded-2xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400';
  const selectClasses = `${inputClasses} appearance-none`;
  const footerButtonClasses = 'rounded-full border border-gray-300 px-6 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900/60';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm dark:bg-slate-950/70">
      <div className="w-full max-w-3xl overflow-hidden rounded-[32px] border border-transparent bg-white shadow-2xl transition-colors dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center justify-between rounded-t-[32px] bg-gradient-to-r from-red-500 to-red-600 px-6 py-4 text-white">
          <h2 className="text-xl font-semibold">Editar Salida de Producto</h2>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full p-1 transition-colors hover:bg-white/20"
            disabled={submitting}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 bg-white px-8 pb-8 pt-6 transition-colors dark:bg-slate-950">
          <div className="grid gap-5 md:grid-cols-2">
            <label className={labelClasses}>
              <span className="flex items-center gap-2">
                Fecha *
              </span>
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

          <div className="grid gap-5 md:grid-cols-2">
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

          <div className="grid gap-5 md:grid-cols-3">
            <label className={labelClasses}>
              <span>Área *</span>
              <div className="relative">
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
                <select
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  className={selectClasses}
                  required
                  disabled={submitting}
                >
                  <option value="" disabled>
                    Todas las áreas
                  </option>
                  {areas.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>
            </label>

            <label className={labelClasses}>
              <span>Proyecto *</span>
              <input
                type="text"
                name="proyecto"
                value={formData.proyecto}
                onChange={handleChange}
                className={inputClasses}
                placeholder="Proyecto asignado"
                required
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
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
              {errorMessage}
            </div>
          )}

          <div className="flex flex-col gap-4 border-t border-gray-200 pt-6 dark:border-slate-800 sm:flex-row sm:justify-end">
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
              className="rounded-full bg-red-500 px-6 py-2 text-sm font-semibold text-white shadow-md transition-colors hover:bg-red-600 disabled:opacity-60 dark:bg-rose-600 dark:hover:bg-rose-500"
              disabled={submitting}
            >
              {submitting ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
