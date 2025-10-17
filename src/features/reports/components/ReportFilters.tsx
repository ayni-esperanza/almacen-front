import React from 'react';
import { ReportFilters as ReportFiltersType } from '../types';

interface ReportFiltersProps {
  filters: ReportFiltersType;
  onFiltersChange: (filters: Partial<ReportFiltersType>) => void;
  areas: string[];
  proyectos: string[];
}

export const ReportFilters: React.FC<ReportFiltersProps> = ({
  filters,
  onFiltersChange,
  areas,
  proyectos
}) => {
  const handleChange = (field: keyof ReportFiltersType, value: string | undefined) => {
    onFiltersChange({ [field]: value });
  };

  const containerClasses = 'rounded-2xl border border-transparent bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-950';
  const labelClasses = 'block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2';
  const inputClasses = 'w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-700 transition focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-green-400 dark:focus:ring-green-500/30';
  const quickFilterButtonClasses = 'rounded-full bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:bg-blue-500 dark:hover:bg-blue-400';

  return (
    <div className={containerClasses}>
      <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-slate-100">Filtros del Reporte</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tipo de Reporte */}
        <div>
          <label className={labelClasses}>
            Tipo de Reporte
          </label>
          <select
            value={filters.tipoReporte}
            onChange={(e) => handleChange('tipoReporte', e.target.value as 'area' | 'proyecto')}
            className={inputClasses}
          >
            <option value="area">Por Área</option>
            <option value="proyecto">Por Proyecto</option>
          </select>
        </div>

        {/* Fecha Inicio */}
        <div>
          <label className={labelClasses}>
            Fecha Inicio
          </label>
          <input
            type="date"
            value={filters.fechaInicio}
            onChange={(e) => handleChange('fechaInicio', e.target.value)}
            className={inputClasses}
          />
        </div>

        {/* Fecha Fin */}
        <div>
          <label className={labelClasses}>
            Fecha Fin
          </label>
          <input
            type="date"
            value={filters.fechaFin}
            onChange={(e) => handleChange('fechaFin', e.target.value)}
            className={inputClasses}
          />
        </div>

        {/* Área (solo si el tipo es por área) */}
        {filters.tipoReporte === 'area' && (
          <div>
            <label className={labelClasses}>
              Área (Opcional)
            </label>
            <select
              value={filters.area || ''}
              onChange={(e) => handleChange('area', e.target.value || undefined)}
              className={inputClasses}
            >
              <option value="">Todas las áreas</option>
              {areas.map(area => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>
        )}

        {/* Proyecto (solo si el tipo es por proyecto) */}
        {filters.tipoReporte === 'proyecto' && (
          <div>
            <label className={labelClasses}>
              Proyecto (Opcional)
            </label>
            <select
              value={filters.proyecto || ''}
              onChange={(e) => handleChange('proyecto', e.target.value || undefined)}
              className={inputClasses}
            >
              <option value="">Todos los proyectos</option>
              {proyectos.map(proyecto => (
                <option key={proyecto} value={proyecto}>{proyecto}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Botones de acción rápida */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => {
            const today = new Date();
            const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
            const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            
            onFiltersChange({
              fechaInicio: firstDay.toISOString().split('T')[0],
              fechaFin: lastDay.toISOString().split('T')[0]
            });
          }}
          className={quickFilterButtonClasses}
        >
          Mes Actual
        </button>
        
        <button
          onClick={() => {
            const today = new Date();
            const firstDay = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const lastDay = new Date(today.getFullYear(), today.getMonth(), 0);
            
            onFiltersChange({
              fechaInicio: firstDay.toISOString().split('T')[0],
              fechaFin: lastDay.toISOString().split('T')[0]
            });
          }}
          className={quickFilterButtonClasses}
        >
          Mes Anterior
        </button>
        
        <button
          onClick={() => {
            const today = new Date();
            const firstDay = new Date(today.getFullYear(), 0, 1);
            const lastDay = new Date(today.getFullYear(), 11, 31);
            
            onFiltersChange({
              fechaInicio: firstDay.toISOString().split('T')[0],
              fechaFin: lastDay.toISOString().split('T')[0]
            });
          }}
          className={quickFilterButtonClasses}
        >
          Año Actual
        </button>
      </div>
    </div>
  );
};
