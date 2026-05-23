import { useMemo, useState } from 'react';
import { EquipmentTable } from './EquipmentTable';
import { EquipmentReport } from '../types';

interface FixedEquipmentTableProps {
  onAddEquipment?: () => void;
  equipments: EquipmentReport[];
}

export const FixedEquipmentTable: React.FC<FixedEquipmentTableProps> = ({ onAddEquipment, equipments }) => {
  const [showAll, setShowAll] = useState(false);

  const filteredEquipments = useMemo(() => {
    const fixedEquipments = equipments;
    if (showAll) {
      return fixedEquipments;
    }

    return fixedEquipments.filter(eq => !eq.fechaRetorno);
  }, [equipments, showAll]);

  return (
    <EquipmentTable
      equipments={filteredEquipments}
      headerTitle="Trazabilidad Fija de Herramientas, Equipos y EPP"
      onAddEquipment={onAddEquipment}
      showAllToggle={
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showAll}
              onChange={(e) => setShowAll(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <span className="text-xs font-medium text-gray-700 sm:text-sm dark:text-slate-300">
              Mostrar historial completo
            </span>
          </label>

          {!showAll && (
            <span className="text-xs text-gray-500 dark:text-slate-400">
              ({filteredEquipments.length} sin retorno)
            </span>
          )}

          {showAll && (
            <span className="text-xs text-gray-500 dark:text-slate-400">
              ({filteredEquipments.length} total)
            </span>
          )}
        </div>
      }
    />
  );
};
