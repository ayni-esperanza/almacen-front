import React, { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { areas } from '../../inventory/data/mockData.ts';

interface AddMovementFormProps {
  type: 'entrada' | 'salida';
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const AddMovementForm: React.FC<AddMovementFormProps> = ({ type, onSubmit, onCancel }) => {
  const isEntry = type === 'entrada';
  const [formData, setFormData] = useState(() => ({
    fecha: new Date().toISOString().split('T')[0],
    codigoProducto: '',
    descripcion: '',
    precioUnitario: isEntry ? '' : '0',
    cantidad: '1',
    responsable: '',
    area: '',
    proyecto: ''
  }));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const entryInputClasses = "w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-700 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-emerald-400 dark:focus:ring-emerald-500/40";
  const exitInputClasses = "w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-700 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-rose-400 dark:focus:ring-rose-500/40";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedQuantity = parseInt(formData.cantidad, 10);
    if (!Number.isFinite(parsedQuantity) || parsedQuantity < 1) {
      setErrorMessage('La cantidad debe ser al menos 1.');
      return;
    }

    const parsedPrice = parseFloat(formData.precioUnitario || '0');
    if (isEntry && (!Number.isFinite(parsedPrice) || parsedPrice <= 0)) {
      setErrorMessage('El precio unitario debe ser mayor a 0.');
      return;
    }

    setErrorMessage(null);

    onSubmit({
      ...formData,
      precioUnitario: Number.isFinite(parsedPrice) ? parsedPrice : 0,
      cantidad: parsedQuantity || 1,
      id: Date.now().toString()
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const gradientColor = isEntry ? 'from-green-500 to-green-600' : 'from-red-500 to-red-600';
  const buttonColor = isEntry ? 'bg-green-600 hover:bg-green-700' : 'bg-red-500 hover:bg-red-600';
  const primaryButtonLabel = isEntry ? 'Guardar' : 'Agregar Producto';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl overflow-hidden rounded-[32px] bg-white shadow-2xl dark:bg-slate-950 dark:border dark:border-slate-800">
        <div className={`flex items-center justify-between rounded-t-[32px] bg-gradient-to-r ${gradientColor} px-6 py-4 text-white`}>
          <h2 className="text-xl font-semibold">
            {isEntry ? 'Nueva Entrada de Producto' : 'Nueva Salida de Producto'}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full p-1 transition-colors hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 px-8 pb-8 pt-6">
          {isEntry ? (
            <>
              <div className="grid gap-5 md:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm font-semibold text-gray-700 dark:text-slate-200">
                  <span>Código del Producto *</span>
                  <input
                    type="text"
                    name="codigoProducto"
                    value={formData.codigoProducto}
                    onChange={handleChange}
                    className={entryInputClasses}
                    placeholder="Ingresa el código"
                    required
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm font-semibold text-gray-700 dark:text-slate-200">
                  <span>Nombre *</span>
                  <input
                    type="text"
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    className={entryInputClasses}
                    placeholder="Nombre del producto"
                    required
                  />
                </label>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm font-semibold text-gray-700 dark:text-slate-200">
                  <span>Fecha *</span>
                  <input
                    type="date"
                    name="fecha"
                    value={formData.fecha}
                    onChange={handleChange}
                    className={entryInputClasses}
                    required
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm font-semibold text-gray-700 dark:text-slate-200">
                  <span>Cantidad *</span>
                  <input
                    type="number"
                    name="cantidad"
                    value={formData.cantidad}
                    onChange={handleChange}
                    className={entryInputClasses}
                    placeholder="Ingresa la cantidad"
                    min={1}
                    required
                  />
                </label>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm font-semibold text-gray-700 dark:text-slate-200">
                  <span>Precio Unitario (S/)</span>
                  <input
                    type="number"
                    step="0.01"
                    name="precioUnitario"
                    value={formData.precioUnitario}
                    onChange={handleChange}
                    min="0.01"
                    className={entryInputClasses}
                    placeholder="0.00"
                    required
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm font-semibold text-gray-700 dark:text-slate-200">
                  <span>Área</span>
                  <input
                    type="text"
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    className={entryInputClasses}
                    placeholder="Área o proyecto"
                  />
                </label>
              </div>
            </>
          ) : (
            <>
              <div className="grid gap-5 md:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm font-semibold text-gray-700 dark:text-slate-200">
                  <span className="flex items-center gap-2">
                    Fecha *
                  </span>
                  <input
                    type="date"
                    name="fecha"
                    value={formData.fecha}
                    onChange={handleChange}
                    className={exitInputClasses}
                    required
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm font-semibold text-gray-700 dark:text-slate-200">
                  <span>Código *</span>
                  <input
                    type="text"
                    name="codigoProducto"
                    value={formData.codigoProducto}
                    onChange={handleChange}
                    className={exitInputClasses}
                    placeholder="Ingresa el código"
                    required
                  />
                </label>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm font-semibold text-gray-700 dark:text-slate-200">
                  <span>Nombre *</span>
                  <input
                    type="text"
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    className={exitInputClasses}
                    placeholder="Nombre del producto"
                    required
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm font-semibold text-gray-700 dark:text-slate-200">
                  <span>Cantidad *</span>
                  <input
                    type="number"
                    name="cantidad"
                    value={formData.cantidad}
                    onChange={handleChange}
                    className={exitInputClasses}
                    placeholder="Ingresa la cantidad"
                    min={1}
                    required
                  />
                </label>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                <label className="flex flex-col gap-2 text-sm font-semibold text-gray-700 dark:text-slate-200">
                  <span>Área *</span>
                  <div className="relative">
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
                    <select
                      name="area"
                      value={formData.area}
                      onChange={handleChange}
                      className={`${exitInputClasses} appearance-none`}
                      required
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

                <label className="flex flex-col gap-2 text-sm font-semibold text-gray-700 dark:text-slate-200">
                  <span>Proyecto *</span>
                  <input
                    type="text"
                    name="proyecto"
                    value={formData.proyecto}
                    onChange={handleChange}
                    className={exitInputClasses}
                    placeholder="Proyecto asignado"
                    required
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm font-semibold text-gray-700 dark:text-slate-200">
                  <span>Responsable *</span>
                  <input
                    type="text"
                    name="responsable"
                    value={formData.responsable}
                    onChange={handleChange}
                    className={exitInputClasses}
                    placeholder="Nombre del responsable"
                    required
                  />
                </label>
              </div>
            </>
          )}

          {errorMessage && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          <div className="flex flex-col gap-4 border-t border-gray-200 pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-full border border-gray-300 px-6 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`rounded-full px-6 py-2 text-sm font-semibold text-white shadow-md transition-colors ${buttonColor}`}
            >
              {primaryButtonLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
