import React, { useState } from 'react';
import { ChevronDown, Wrench, X } from 'lucide-react';
import { areas } from '../../inventory/data/mockData';
import { CreateEquipmentData } from '../../../shared/services/equipment.service';

interface AddEquipmentFormProps {
  onSubmit: (data: CreateEquipmentData) => void;
  onCancel: () => void;
}

type EstadoEquipo = CreateEquipmentData['estadoEquipo'];
type EstadoRetorno = '' | 'Bueno' | 'Regular' | 'Malo' | 'Danado';

export const AddEquipmentForm: React.FC<AddEquipmentFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    equipo: '',
    serieCodigo: '',
    cantidad: '1',
    estadoEquipo: '' as '' | EstadoEquipo,
    responsable: '',
    fechaSalida: new Date().toISOString().split('T')[0],
    horaSalida: new Date().toTimeString().slice(0, 5),
    areaProyecto: '',
    fechaRetorno: '',
    horaRetorno: '',
    estadoRetorno: '' as EstadoRetorno,
    responsableRetorno: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.estadoEquipo) {
      return;
    }

    onSubmit({
      equipo: formData.equipo,
      serieCodigo: formData.serieCodigo,
      cantidad: parseInt(formData.cantidad, 10) || 1,
      estadoEquipo: formData.estadoEquipo,
      responsable: formData.responsable,
      fechaSalida: formData.fechaSalida,
      horaSalida: formData.horaSalida,
      areaProyecto: formData.areaProyecto,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const labelClasses = 'flex flex-col gap-2 text-sm font-semibold text-gray-700 dark:text-slate-200';
  const inputClasses = 'w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-500/30';
  const selectClasses = 'w-full appearance-none rounded-2xl border border-gray-300 px-4 py-3 pr-12 text-sm text-gray-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-500/30';
  const dividerClasses = 'space-y-6 border-t border-gray-200 pt-6 dark:border-slate-800';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm dark:bg-slate-950/70">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[32px] border border-transparent bg-white shadow-2xl transition-colors dark:border-slate-800 dark:bg-slate-950 flex flex-col">
        <div className="flex items-center justify-between rounded-t-[32px] bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 text-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <Wrench className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Nueva Salida de Herramientas/Equipos</h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1 transition-colors rounded-full hover:bg-white/20"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="px-8 pt-6 pb-8 space-y-8 bg-white dark:bg-slate-950">
          <div className="grid gap-5 md:grid-cols-3">
            <label className={labelClasses}>
              <span>Código *</span>
              <input
                type="text"
                name="serieCodigo"
                value={formData.serieCodigo}
                onChange={handleChange}
                className={inputClasses}
                placeholder="Ingresa código"
                required
              />
            </label>

            <label className={labelClasses}>
              <span>Nombre *</span>
              <input
                type="text"
                name="equipo"
                value={formData.equipo}
                onChange={handleChange}
                className={inputClasses}
                placeholder="Nombre del equipo"
                required
              />
            </label>

            <label className={labelClasses}>
              <span>Cantidad *</span>
              <input
                type="number"
                name="cantidad"
                min="1"
                value={formData.cantidad}
                onChange={handleChange}
                className={inputClasses}
                required
              />
            </label>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className={labelClasses}>
              <span>Estado del Equipo *</span>
              <div className="relative">
                <select
                  name="estadoEquipo"
                  value={formData.estadoEquipo}
                  onChange={handleChange}
                  className={selectClasses}
                  required
                >
                  <option value="">Todos los estados</option>
                  <option value="Bueno">Bueno</option>
                  <option value="Regular">Regular</option>
                  <option value="Malo">Malo</option>
                  <option value="En_Reparacion">En reparación</option>
                  <option value="Danado">Dañado</option>
                </select>
                <ChevronDown className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 pointer-events-none right-4 top-1/2 dark:text-slate-500" />
              </div>
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
              />
            </label>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <label className={labelClasses}>
              <span>Fecha de Salida *</span>
              <input
                type="date"
                name="fechaSalida"
                value={formData.fechaSalida}
                onChange={handleChange}
                className={inputClasses}
                required
              />
            </label>

            <label className={labelClasses}>
              <span>Hora de Salida *</span>
              <input
                type="time"
                name="horaSalida"
                value={formData.horaSalida}
                onChange={handleChange}
                className={inputClasses}
                required
              />
            </label>

            <label className={labelClasses}>
              <span>Área/Proyecto *</span>
              <div className="relative">
                <select
                  name="areaProyecto"
                  value={formData.areaProyecto}
                  onChange={handleChange}
                  className={selectClasses}
                  required
                >
                  <option value="">Selecciona un área</option>
                  {areas.map(area => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 pointer-events-none right-4 top-1/2 dark:text-slate-500" />
              </div>
            </label>
          </div>

          <div className={dividerClasses}>
            <h3 className="text-base font-semibold text-gray-900 dark:text-slate-100">Información de Retorno (Opcional)</h3>

            <div className="grid gap-5 md:grid-cols-2">
              <label className={labelClasses}>
                <span>Fecha de Retorno</span>
                <input
                  type="date"
                  name="fechaRetorno"
                  value={formData.fechaRetorno}
                  onChange={handleChange}
                  className={inputClasses}
                />
              </label>

              <label className={labelClasses}>
                <span>Hora de Retorno</span>
                <input
                  type="time"
                  name="horaRetorno"
                  value={formData.horaRetorno}
                  onChange={handleChange}
                  className={inputClasses}
                />
              </label>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className={labelClasses}>
                <span>Estado de Retorno</span>
                <div className="relative">
                  <select
                    name="estadoRetorno"
                    value={formData.estadoRetorno}
                    onChange={handleChange}
                    className={selectClasses}
                  >
                    <option value="">Selecciona un estado</option>
                    <option value="Bueno">Bueno</option>
                    <option value="Regular">Regular</option>
                    <option value="Malo">Malo</option>
                    <option value="Danado">Dañado</option>
                  </select>
                  <ChevronDown className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 pointer-events-none right-4 top-1/2 dark:text-slate-500" />
                </div>
              </label>

              <label className={labelClasses}>
                <span>Responsable de Retorno</span>
                <input
                  type="text"
                  name="responsableRetorno"
                  value={formData.responsableRetorno}
                  onChange={handleChange}
                  className={inputClasses}
                  placeholder="Nombre del responsable de recepción"
                />
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-4 pt-6 border-t border-gray-200 dark:border-slate-800 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 text-sm font-semibold text-gray-600 transition-colors border border-gray-300 rounded-full hover:bg-gray-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900/60"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-sm font-semibold text-white transition-colors bg-blue-600 rounded-full shadow-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400"
            >
              Agregar Reporte
            </button>
          </div>
          </form>
        </div>
      </div>
    </div>
  );
};