import React from 'react';
import { EquipmentReport } from '../types';
import { Pagination } from '../../../shared/components/Pagination';
import { TableWithFixedHeader } from '../../../shared/components/TableWithFixedHeader';
import { usePagination } from '../../../shared/hooks/usePagination';
import { useSelectableRowClick } from '../../../shared/hooks/useSelectableRowClick';
import { Wrench, Search } from 'lucide-react';
import { ReturnEquipmentData } from '../../../shared/services/equipment.service';

interface EquipmentTableProps {
  equipments: EquipmentReport[];
  loading?: boolean;
  error?: string | null;
  refetch?: () => Promise<void>;
  onReturn?: (id: number, returnData: ReturnEquipmentData) => Promise<EquipmentReport | null>;
  onEdit?: (equipment: EquipmentReport) => void;
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
      className="border-b border-gray-100 bg-white text-sm text-gray-600 transition hover:bg-blue-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
    >
      <td className="px-4 py-4 font-medium text-gray-700 dark:text-slate-100 select-text">{equipment.serieCodigo}</td>
      <td className="px-4 py-4 font-medium text-gray-700 dark:text-slate-100 select-text">{equipment.equipo}</td>
      <td className="px-4 py-4 text-center font-semibold text-gray-700 dark:text-slate-100 select-text">{equipment.cantidad}</td>
      <td className="px-4 py-4 text-gray-600 dark:text-slate-300 select-text">{equipment.areaProyecto}</td>
      <td className="px-4 py-4 text-gray-600 dark:text-slate-300 select-text">{equipment.responsable}</td>
      <td className="px-4 py-4">
        <span
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold ${salidaStatus.badgeClass}`}
        >
          <span className={`h-2 w-2 rounded-full ${salidaStatus.dotClass}`} />
          {salidaStatus.label}
        </span>
      </td>
      <td className="px-4 py-4 text-gray-600 dark:text-slate-300 select-text">{equipment.fechaSalida}</td>
      <td className="px-4 py-4 text-gray-600 dark:text-slate-300 select-text">{equipment.horaSalida}</td>
      <td className="border-l border-blue-100 px-4 py-4 dark:border-blue-500/20">
        <span
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold ${retornoStatus.badgeClass}`}
        >
          <span className={`h-2 w-2 rounded-full ${retornoStatus.dotClass}`} />
          {retornoStatus.label}
        </span>
      </td>
      <td className="px-4 py-4 text-gray-600 dark:text-slate-300 select-text">{equipment.fechaRetorno ?? '-'}</td>
      <td className="px-4 py-4 text-gray-600 dark:text-slate-300 select-text">{equipment.horaRetorno ?? '-'}</td>
      <td className="px-4 py-4 text-gray-600 dark:text-slate-300 select-text">{equipment.responsableRetorno ?? '-'}</td>
    </tr>
  );
};

export const EquipmentTable: React.FC<EquipmentTableProps> = ({ equipments, onEdit }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const searchInputClasses = 'w-full rounded-full border border-gray-300 bg-white py-2 pl-12 pr-4 text-sm text-gray-700 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-blue-400 dark:focus:ring-blue-500/40';
  
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

  const {
    paginatedData: paginatedEquipments,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    handlePageChange,
    handleItemsPerPageChange,
  } = usePagination({ data: filteredEquipments, initialItemsPerPage: 15 });

  return (
    <div className="overflow-hidden rounded-xl border border-transparent bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 text-white">
        <div className="flex items-center gap-3">
          <Wrench className="h-6 w-6" />
          <h2 className="text-xl font-semibold">Reporte de Salidas de Herramientas/Equipos</h2>
        </div>
      </div>

      <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="relative max-w-xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por equipo, código, responsable o área..."
            value={searchTerm}
            onChange={event => setSearchTerm(event.target.value)}
            className={searchInputClasses}
          />
        </div>
      </div>

      <TableWithFixedHeader maxHeight="600px">
        <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-slate-900">
          <tr className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:bg-slate-900 dark:text-slate-400">
            <th className="px-4 py-3 text-left">Código</th>
            <th className="px-4 py-3 text-left">Nombre</th>
            <th className="px-4 py-3 text-center">Cantidad</th>
            <th className="px-4 py-3 text-left">Área/Proyecto</th>
            <th className="px-4 py-3 text-left">Responsable</th>
            <th className="px-4 py-3 text-left">Estado</th>
            <th className="px-4 py-3 text-left">Fecha de S.</th>
            <th className="px-4 py-3 text-left">Hora de S.</th>
            <th className="border-l border-blue-100 px-4 py-3 text-left dark:border-blue-500/20">Estado R.</th>
            <th className="px-4 py-3 text-left">Fecha de R.</th>
            <th className="px-4 py-3 text-left">Hora de R.</th>
            <th className="px-4 py-3 text-left">Responsable</th>
          </tr>
        </thead>
        <tbody>
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
      </TableWithFixedHeader>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />
    </div>
  );
};
