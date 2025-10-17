import React, { useEffect, useState } from 'react';
import { ChevronDown, Wrench, X } from 'lucide-react';
import { EquipmentReport } from '../types';
import { areas } from '../../inventory/data/mockData';
import { ReturnEquipmentData, UpdateEquipmentData } from '../../../shared/services/equipment.service';

interface EditEquipmentFormProps {
  equipment: EquipmentReport;
  onSubmit: (data: UpdateEquipmentData) => Promise<void> | void;
  onCancel: () => void;
  onSubmitReturn?: (data: ReturnEquipmentData) => Promise<void> | void;
}

const EQUIPMENT_STATES: { value: UpdateEquipmentData['estadoEquipo']; label: string }[] = [
  { value: 'Bueno', label: 'Bueno' },
  { value: 'Regular', label: 'Regular' },
  { value: 'Malo', label: 'Malo' },
  { value: 'En_Reparacion', label: 'En reparación' },
  { value: 'Danado', label: 'Dañado' },
];

const RETURN_STATES: { value: ReturnEquipmentData['estadoRetorno']; label: string }[] = [
  { value: 'Bueno', label: 'Bueno' },
  { value: 'Regular', label: 'Regular' },
  { value: 'Malo', label: 'Malo' },
  { value: 'Danado', label: 'Dañado' },
];

type FormState = {
  equipo: string;
  serieCodigo: string;
  cantidad: string;
  estadoEquipo: UpdateEquipmentData['estadoEquipo'] | '';
  responsable: string;
  fechaSalida: string;
  horaSalida: string;
  areaProyecto: string;
  firma: string;
  fechaRetorno: string;
  horaRetorno: string;
  estadoRetorno: '' | ReturnEquipmentData['estadoRetorno'];
  firmaRetorno: string;
};

const normalizeEquipmentState = (
  value?: string | null,
): UpdateEquipmentData['estadoEquipo'] | '' => {
  if (!value) return '';
  const normalized = value.toLowerCase().replace(/[^a-z]/g, '');
  if (normalized.includes('repar')) return 'En_Reparacion';
  if (normalized.includes('dan')) return 'Danado';
  if (normalized.includes('malo')) return 'Malo';
  if (normalized.includes('regular')) return 'Regular';
  if (normalized.includes('bueno')) return 'Bueno';
  return '';
};

const normalizeReturnState = (
  value?: string | null,
): ReturnEquipmentData['estadoRetorno'] | '' => {
  if (!value) return '';
  const normalized = value.toLowerCase().replace(/[^a-z]/g, '');
  if (normalized.includes('dan')) return 'Danado';
  if (normalized.includes('malo')) return 'Malo';
  if (normalized.includes('regular')) return 'Regular';
  if (normalized.includes('bueno')) return 'Bueno';
  return '';
};

export const EditEquipmentForm: React.FC<EditEquipmentFormProps> = ({ equipment, onSubmit, onCancel, onSubmitReturn }) => {
  const [formData, setFormData] = useState<FormState>(() => ({
    equipo: equipment.equipo ?? '',
    serieCodigo: equipment.serieCodigo ?? '',
    cantidad: String(equipment.cantidad ?? 1),
    estadoEquipo: normalizeEquipmentState(equipment.estadoEquipo),
    responsable: equipment.responsable ?? '',
    fechaSalida: equipment.fechaSalida ?? '',
    horaSalida: equipment.horaSalida ?? '',
    areaProyecto: equipment.areaProyecto ?? '',
    firma: equipment.firma ?? '',
    fechaRetorno: equipment.fechaRetorno ?? '',
    horaRetorno: equipment.horaRetorno ?? '',
    estadoRetorno: normalizeReturnState(equipment.estadoRetorno),
    firmaRetorno: equipment.firmaRetorno ?? '',
  }));
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setFormData({
      equipo: equipment.equipo ?? '',
      serieCodigo: equipment.serieCodigo ?? '',
      cantidad: String(equipment.cantidad ?? 1),
      estadoEquipo: normalizeEquipmentState(equipment.estadoEquipo),
      responsable: equipment.responsable ?? '',
      fechaSalida: equipment.fechaSalida ?? '',
      horaSalida: equipment.horaSalida ?? '',
      areaProyecto: equipment.areaProyecto ?? '',
      firma: equipment.firma ?? '',
      fechaRetorno: equipment.fechaRetorno ?? '',
      horaRetorno: equipment.horaRetorno ?? '',
      estadoRetorno: normalizeReturnState(equipment.estadoRetorno),
      firmaRetorno: equipment.firmaRetorno ?? '',
    });
  }, [equipment]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const labelClasses = 'flex flex-col gap-2 text-sm font-semibold text-gray-700 dark:text-slate-200';
  const inputClasses = 'w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-700 transition disabled:cursor-not-allowed disabled:opacity-70 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:disabled:opacity-60 dark:focus:border-blue-400 dark:focus:ring-blue-500/30';
  const selectClasses = 'w-full appearance-none rounded-2xl border border-gray-300 px-4 py-3 pr-12 text-sm text-gray-700 transition disabled:cursor-not-allowed disabled:opacity-70 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:disabled:opacity-60 dark:focus:border-blue-400 dark:focus:ring-blue-500/30';
  const dividerClasses = 'space-y-6 border-t border-gray-200 pt-6 dark:border-slate-800';

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formData.estadoEquipo) {
      setErrorMessage('Selecciona un estado del equipo.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      await onSubmit({
        equipo: formData.equipo.trim(),
        serieCodigo: formData.serieCodigo.trim(),
        cantidad: parseInt(formData.cantidad, 10) || 1,
        estadoEquipo: formData.estadoEquipo,
        responsable: formData.responsable.trim(),
        fechaSalida: formData.fechaSalida,
        horaSalida: formData.horaSalida,
        areaProyecto: formData.areaProyecto,
        firma: formData.firma.trim(),
      });

      const hasReturnData = formData.fechaRetorno && formData.horaRetorno && formData.estadoRetorno && formData.firmaRetorno;
      if (hasReturnData && onSubmitReturn && formData.estadoRetorno) {
        await onSubmitReturn({
          fechaRetorno: formData.fechaRetorno,
          horaRetorno: formData.horaRetorno,
          estadoRetorno: formData.estadoRetorno as ReturnEquipmentData['estadoRetorno'],
          firmaRetorno: formData.firmaRetorno.trim(),
        });
      }

      onCancel();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo actualizar el reporte');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm dark:bg-slate-950/70">
      <div className="w-full max-w-4xl overflow-hidden rounded-[32px] border border-transparent bg-white shadow-2xl transition-colors dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center justify-between rounded-t-[32px] bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <Wrench className="h-6 w-6" />
            <h2 className="text-xl font-semibold">Editar Salida de Herramientas/Equipos</h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full p-1 transition-colors hover:bg-white/20"
            disabled={submitting}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
  <form onSubmit={handleSubmit} className="space-y-8 bg-white px-8 pb-8 pt-6 dark:bg-slate-950">
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
                disabled={submitting}
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
                disabled={submitting}
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
                disabled={submitting}
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
                  disabled={submitting}
                >
                  <option value="">Todos los estados</option>
                  {EQUIPMENT_STATES.map(state => (
                    <option key={state.value} value={state.value}>
                      {state.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
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
                disabled={submitting}
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
                disabled={submitting}
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
                disabled={submitting}
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
                  disabled={submitting}
                >
                  <option value="">Selecciona un área</option>
                  {areas.map(area => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
              </div>
            </label>
          </div>

          <label className={labelClasses}>
            <span>Firma *</span>
            <input
              type="text"
              name="firma"
              value={formData.firma}
              onChange={handleChange}
              className={inputClasses}
              placeholder="Firma del responsable"
              required
              disabled={submitting}
            />
          </label>

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
                  disabled={submitting}
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
                  disabled={submitting}
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
                    disabled={submitting}
                  >
                    <option value="">Selecciona un estado</option>
                    {RETURN_STATES.map(state => (
                      <option key={state.value} value={state.value}>
                        {state.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
                </div>
              </label>

              <label className={labelClasses}>
                <span>Firma de Retorno</span>
                <input
                  type="text"
                  name="firmaRetorno"
                  value={formData.firmaRetorno}
                  onChange={handleChange}
                  className={inputClasses}
                  placeholder="Nombre o firma de recepción"
                  disabled={submitting}
                />
              </label>
            </div>
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
              className="rounded-full border border-gray-300 px-6 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900/60"
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-full bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-md transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-blue-500 dark:hover:bg-blue-400"
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
