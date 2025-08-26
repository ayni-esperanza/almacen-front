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
  const handleChange = (field: keyof ReportFiltersType, value: string) => {
    onFiltersChange({ [field]: value });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Filtros del Reporte</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tipo de Reporte */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Tipo de Reporte
          </label>
          <select
            value={filters.tipoReporte}
            onChange={(e) => handleChange('tipoReporte', e.target.value as 'area' | 'proyecto')}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
          >
            <option value="area">Por Área</option>
            <option value="proyecto">Por Proyecto</option>
          </select>
        </div>

        {/* Fecha Inicio */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Fecha Inicio
          </label>
          <input
            type="date"
            value={filters.fechaInicio}
            onChange={(e) => handleChange('fechaInicio', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Fecha Fin */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Fecha Fin
          </label>
          <input
            type="date"
            value={filters.fechaFin}
            onChange={(e) => handleChange('fechaFin', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Área (solo si el tipo es por área) */}
        {filters.tipoReporte === 'area' && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Área (Opcional)
            </label>
            <select
              value={filters.area || ''}
              onChange={(e) => handleChange('area', e.target.value || undefined)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
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
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Proyecto (Opcional)
            </label>
            <select
              value={filters.proyecto || ''}
              onChange={(e) => handleChange('proyecto', e.target.value || undefined)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
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
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm"
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
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm"
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
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm"
        >
          Año Actual
        </button>
      </div>
    </div>
  );
};
