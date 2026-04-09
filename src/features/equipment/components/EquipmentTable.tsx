import React from 'react';
import { EquipmentReport } from '../types';
import { Pagination } from '../../../shared/components/Pagination';
import { usePagination } from '../../../shared/hooks/usePagination';
import { useSelectableRowClick } from '../../../shared/hooks/useSelectableRowClick';
import { Wrench, Search, Plus } from 'lucide-react';
import { ReturnEquipmentData } from '../../../shared/services/equipment.service';

interface EquipmentTableProps {
  equipments: EquipmentReport[];
  loading?: boolean;
  error?: string | null;
  refetch?: () => Promise<void>;
  onReturn?: (id: number, returnData: ReturnEquipmentData) => Promise<EquipmentReport | null>;
  onEdit?: (equipment: EquipmentReport) => void;
  onAddEquipment?: () => void;
  showAllToggle?: React.ReactNode;
  headerTitle?: string;
}

const STATUS_PRESETS: Record<string, { label: string; badgeClass: string; dotClass: string }> = {
  bueno: {
    label: 'NORMAL',
    badgeClass: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/40 dark:bg-emerald-500/15 dark:text-emerald-200',
    dotClass: 'bg-emerald-500 dark:bg-emerald-400',
  },
  regular: {
    label: 'BAJO',
    badgeClass: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/40 dark:bg-amber-500/15 dark:text-amber-200',
    dotClass: 'bg-amber-500 dark:bg-amber-300',
  },
  malo: {
    label: 'CRÍTICO',
    badgeClass: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/40 dark:bg-rose-500/15 dark:text-rose-200',
    dotClass: 'bg-rose-500 dark:bg-rose-300',
  },
  dañado: {
    label: 'CRÍTICO',
    badgeClass: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/40 dark:bg-rose-500/15 dark:text-rose-200',
    dotClass: 'bg-rose-500 dark:bg-rose-300',
  },
  danado: {
    label: 'CRÍTICO',
    badgeClass: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/40 dark:bg-rose-500/15 dark:text-rose-200',
    dotClass: 'bg-rose-500 dark:bg-rose-300',
  },
  enrreparacion: {
    label: 'REPARACIÓN',
    badgeClass: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-400/40 dark:bg-sky-500/15 dark:text-sky-200',
    dotClass: 'bg-sky-500 dark:bg-sky-300',
  },
  enreparacion: {
    label: 'REPARACIÓN',
    badgeClass: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-400/40 dark:bg-sky-500/15 dark:text-sky-200',
    dotClass: 'bg-sky-500 dark:bg-sky-300',
  },
};

const getStatusBadge = (status?: string | null) => {
  if (!status) {
    return {
      label: 'SIN ESTADO',
      badgeClass: 'border-gray-200 bg-gray-50 text-gray-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200',
      dotClass: 'bg-gray-400 dark:bg-slate-400',
    };
  }

  const normalized = status.toLowerCase().replace(/[^a-z]/g, '');
  return STATUS_PRESETS[normalized] ?? {
    label: status.toUpperCase(),
    badgeClass: 'border-gray-200 bg-gray-50 text-gray-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200',
    dotClass: 'bg-gray-400 dark:bg-slate-400',
  };
};

interface EquipmentRowProps {
  equipment: EquipmentReport;
  salidaStatus: { label: string; badgeClass: string; dotClass: string };
  retornoStatus: { label: string; badgeClass: string; dotClass: string };
  onEdit?: (equipment: EquipmentReport) => void;
}

const EquipmentRow: React.FC<EquipmentRowProps> = ({ equipment, salidaStatus, retornoStatus, onEdit }) => {
  const handleRowClick = useSelectableRowClick(() => {
    if (onEdit) {
      onEdit(equipment);
    }
  });

  return (
    <tr
      onClick={handleRowClick}
      style={{ cursor: onEdit ? 'pointer' : 'default', userSelect: 'text' }}
      className="border-b border-gray-100 bg-white text-xs text-gray-600 transition hover:bg-blue-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
    >
      <td className="px-3 py-2 font-medium text-gray-700 dark:text-slate-100 select-text">{equipment.serieCodigo}</td>
      <td className="px-3 py-2 font-medium text-gray-700 dark:text-slate-100 select-text">{equipment.equipo}</td>
      <td className="px-3 py-2 text-center font-semibold text-gray-700 dark:text-slate-100 select-text">{equipment.cantidad}</td>
      <td className="px-3 py-2 text-gray-600 dark:text-slate-300 select-text">{equipment.areaProyecto}</td>
      <td className="px-3 py-2 text-gray-600 dark:text-slate-300 select-text">{equipment.responsable}</td>
      <td className="px-3 py-2">
        <span
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold ${salidaStatus.badgeClass}`}
        >
          <span className={`h-2 w-2 rounded-full ${salidaStatus.dotClass}`} />
          {salidaStatus.label}
        </span>
      </td>
      <td className="px-3 py-2 text-gray-600 dark:text-slate-300 select-text">{equipment.fechaSalida}</td>
      <td className="px-3 py-2 text-gray-600 dark:text-slate-300 select-text">{equipment.horaSalida}</td>
      <td className="border-l border-blue-100 px-3 py-2 dark:border-blue-500/20">
        <span
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold ${retornoStatus.badgeClass}`}
        >
          <span className={`h-2 w-2 rounded-full ${retornoStatus.dotClass}`} />
          {retornoStatus.label}
        </span>
      </td>
      <td className="px-3 py-2 text-gray-600 dark:text-slate-300 select-text">{equipment.fechaRetorno ?? '-'}</td>
      <td className="px-3 py-2 text-gray-600 dark:text-slate-300 select-text">{equipment.horaRetorno ?? '-'}</td>
      <td className="px-3 py-2 text-gray-600 dark:text-slate-300 select-text">{equipment.responsableRetorno ?? '-'}</td>
    </tr>
  );
};

export const EquipmentTable: React.FC<EquipmentTableProps> = ({ 
  equipments, 
  onEdit, 
  onAddEquipment,
  showAllToggle,
  headerTitle = 'Trazabilidad de Salidas de Herramientas, Equipos y EPP',
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [viewMode, setViewMode] = React.useState<'table' | 'grid'>('table');
  const [selectedArea, setSelectedArea] = React.useState<string | null>(null);
  
  const filteredEquipments = equipments.filter(equipment => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;

    return (
      equipment.equipo.toLowerCase().includes(term) ||
      equipment.serieCodigo.toLowerCase().includes(term) ||
      equipment.responsable.toLowerCase().includes(term) ||
      equipment.areaProyecto.toLowerCase().includes(term)
    );
  });

  const areaSummary = React.useMemo(() => {
    const counts = new Map<string, number>();

    filteredEquipments.forEach(equipment => {
      const area = equipment.areaProyecto?.trim() || 'Sin área';
      counts.set(area, (counts.get(area) ?? 0) + 1);
    });

    return Array.from(counts.entries())
      .map(([area, totalRegistros]) => ({ area, totalRegistros }))
      .sort((a, b) => a.area.localeCompare(b.area));
  }, [filteredEquipments]);

  const areaFilteredEquipments = React.useMemo(() => {
    if (!selectedArea) {
      return filteredEquipments;
    }

    return filteredEquipments.filter(equipment => {
      const area = equipment.areaProyecto?.trim() || 'Sin área';
      return area === selectedArea;
    });
  }, [filteredEquipments, selectedArea]);

  const {
    paginatedData: paginatedEquipments,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    handlePageChange,
    handleItemsPerPageChange,
  } = usePagination({ data: areaFilteredEquipments, initialItemsPerPage: 100 });

  return (
    <>
      {/* Header */}
      <div className="px-4 py-3 sm:px-6 sm:py-4 text-white bg-gradient-to-r from-blue-500 to-blue-600">
        <div className="flex items-center gap-2 sm:gap-3">
          <Wrench className="h-5 w-5 sm:h-6 sm:w-6" />
          <h2 className="text-base font-bold sm:text-xl">{headerTitle}</h2>
        </div>
      </div>

      {/* Filters + Table Container */}
      <div className="flex flex-col bg-white border border-transparent shadow-lg rounded-xl dark:border-slate-800 dark:bg-slate-950">
        {/* Search Filter - Responsive - sticky */}
        <div className="sticky top-[109px] z-20 p-3 bg-white border-b border-gray-200/70 sm:p-4 dark:border-slate-800/70 dark:bg-slate-900 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 w-full sm:max-w-md">
              <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2 sm:w-5 sm:h-5 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Buscar por equipo, serie, responsable o área..."
                value={searchTerm}
                onChange={event => setSearchTerm(event.target.value)}
                className="w-full py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-blue-400 dark:focus:ring-blue-500/30"
              />
            </div>
            <div className="flex flex-col items-start w-full gap-3 sm:flex-row sm:items-center sm:w-auto">
              <div className="inline-flex items-center p-1 border border-gray-200 rounded-lg bg-gray-50 dark:border-slate-700 dark:bg-slate-800/80">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                    viewMode === 'table'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:text-gray-800 dark:text-slate-300 dark:hover:text-slate-100'
                  }`}
                >
                  Tabla
                </button>
                <button
                  onClick={() => {
                    setViewMode('grid');
                    setSelectedArea(null);
                  }}
                  className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:text-gray-800 dark:text-slate-300 dark:hover:text-slate-100'
                  }`}
                >
                  Cuadrícula
                </button>
              </div>

              {showAllToggle}
              {onAddEquipment && (
                <button
                  onClick={onAddEquipment}
                  className="flex items-center justify-center w-full px-3 py-2 space-x-2 text-sm font-medium text-white transition-colors bg-blue-500 rounded-lg shadow-md sm:w-auto sm:px-6 hover:bg-blue-600 whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar Reporte</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {filteredEquipments.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-slate-400">
            <Wrench className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-slate-600" />
            <p>{equipments.length > 0 ? 'No se encontraron equipos con los filtros aplicados' : 'No hay equipos registrados'}</p>
          </div>
        ) : viewMode === 'table' ? (
          <>
            {selectedArea && (
              <div className="flex flex-col gap-2 px-4 pt-4 pb-1 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-gray-600 dark:text-slate-300">
                  Viendo registros del área: <span className="font-semibold text-gray-800 dark:text-slate-100">{selectedArea}</span>
                </p>
                <div className="flex items-center gap-2">
                  {onAddEquipment && (
                    <button
                      onClick={onAddEquipment}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400"
                    >
                      Agregar en esta área
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSelectedArea(null);
                      setViewMode('grid');
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-800"
                  >
                    Volver a cuadrícula
                  </button>
                </div>
              </div>
            )}

            <div
              key={`${currentPage}-${itemsPerPage}-${searchTerm}-${selectedArea ?? 'all'}`}
              className="overflow-x-auto md:overflow-visible fade-section"
            >
              <table className="min-w-[1100px] w-full text-xs text-gray-700 dark:text-slate-200">
                <thead className="bg-gray-50 dark:bg-slate-900">
                  <tr className="border-b border-gray-200 dark:border-slate-800">
                    <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 bg-gray-50 shadow-sm dark:bg-slate-900 dark:text-slate-300">Código</th>
                    <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 bg-gray-50 shadow-sm dark:bg-slate-900 dark:text-slate-300">Nombre</th>
                    <th className="px-3 py-3 text-xs font-semibold text-center text-gray-700 bg-gray-50 shadow-sm dark:bg-slate-900 dark:text-slate-300">Cantidad</th>
                    <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 bg-gray-50 shadow-sm dark:bg-slate-900 dark:text-slate-300">Área/Proyecto</th>
                    <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 bg-gray-50 shadow-sm dark:bg-slate-900 dark:text-slate-300">Responsable</th>
                    <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 bg-gray-50 shadow-sm dark:bg-slate-900 dark:text-slate-300">Estado</th>
                    <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 bg-gray-50 shadow-sm dark:bg-slate-900 dark:text-slate-300">Fecha de S.</th>
                    <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 bg-gray-50 shadow-sm dark:bg-slate-900 dark:text-slate-300">Hora de S.</th>
                    <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 bg-gray-50 shadow-sm dark:bg-slate-900 dark:text-slate-300 border-l border-blue-100 dark:border-blue-500/20">Estado R.</th>
                    <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 bg-gray-50 shadow-sm dark:bg-slate-900 dark:text-slate-300">Fecha de R.</th>
                    <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 bg-gray-50 shadow-sm dark:bg-slate-900 dark:text-slate-300">Hora de R.</th>
                    <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 bg-gray-50 shadow-sm dark:bg-slate-900 dark:text-slate-300">Responsable</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white dark:divide-slate-800 dark:bg-slate-950">
                  {paginatedEquipments.map(equipment => {
                    const salidaStatus = getStatusBadge(equipment.estadoEquipo);
                    const retornoStatus = getStatusBadge(equipment.estadoRetorno ?? null);

                    return (
                      <EquipmentRow
                        key={equipment.id}
                        equipment={equipment}
                        salidaStatus={salidaStatus}
                        retornoStatus={retornoStatus}
                        onEdit={onEdit}
                      />
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </>
        ) : (
          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {areaSummary.map(area => (
              <div
                key={area.area}
                role="button"
                tabIndex={0}
                onClick={() => {
                  setSelectedArea(area.area);
                  setViewMode('table');
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setSelectedArea(area.area);
                    setViewMode('table');
                  }
                }}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md hover:border-blue-300 cursor-pointer dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-500/50"
              >
                <p className="text-xs font-semibold tracking-wide text-blue-600 uppercase dark:text-blue-400">
                  Área
                </p>
                <h3 className="mt-1 text-base font-semibold text-gray-800 dark:text-slate-100">
                  {area.area}
                </h3>
                <div className="mt-4 flex items-end justify-between">
                  <span className="text-xs text-gray-500 dark:text-slate-400">Registros guardados</span>
                  <span className="text-2xl font-bold text-gray-800 dark:text-slate-100">
                    {area.totalRegistros}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
