import { useState, useMemo } from 'react';
import { EquipmentTable } from '../features/equipment/components/EquipmentTable';
import { AddEquipmentForm } from '../features/equipment/components/AddEquipmentForm';
import { EditEquipmentForm } from '../features/equipment/components/EditEquipmentForm';
import { useEquipment } from '../features/equipment/hooks/useEquipment';
import { CreateEquipmentData, ReturnEquipmentData, UpdateEquipmentData } from '../shared/services/equipment.service';
import { EquipmentReport } from '../features/equipment/types';

export const EquipmentPage = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentReport | null>(null);
  const [showAll, setShowAll] = useState(false);
  const equipmentData = useEquipment();

  // Filtrar equipos según el estado del toggle
  const filteredEquipment = useMemo(() => {
    if (showAll) {
      return equipmentData.equipment;
    }
    // Mostrar solo equipos sin retorno (fechaRetorno es null o undefined)
    return equipmentData.equipment.filter(eq => !eq.fechaRetorno);
  }, [equipmentData.equipment, showAll]);

  const handleAddEquipment = async (data: CreateEquipmentData) => {
    try {
      await equipmentData.createEquipmentReport(data);
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding equipment:', error);
    }
  };

  const handleOpenEdit = (equipment: EquipmentReport) => {
    setSelectedEquipment(equipment);
    setShowEditForm(true);
  };

  const handleUpdateEquipment = async (data: UpdateEquipmentData) => {
    if (!selectedEquipment) return;
    await equipmentData.updateEquipment(selectedEquipment.id, data);
  };

  const handleUpdateReturn = async (data: ReturnEquipmentData) => {
    if (!selectedEquipment) return;
    await equipmentData.returnEquipment(selectedEquipment.id, data);
  };

  const handleCloseEdit = () => {
    setShowEditForm(false);
    setSelectedEquipment(null);
  };

  return (
    <>
      <EquipmentTable
        equipments={filteredEquipment}
        loading={equipmentData.loading}
        error={equipmentData.error}
        refetch={equipmentData.refetch}
        onReturn={equipmentData.returnEquipment}
        onEdit={handleOpenEdit}
        onAddEquipment={() => setShowAddForm(true)}
        showAllToggle={
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showAll}
                onChange={(e) => setShowAll(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Mostrar historial completo
              </span>
            </label>
            
            {!showAll && (
              <span className="text-xs text-gray-500 dark:text-slate-400">
                ({filteredEquipment.length} sin retorno)
              </span>
            )}
            
            {showAll && (
              <span className="text-xs text-gray-500 dark:text-slate-400">
                ({filteredEquipment.length} total)
              </span>
            )}
          </div>
        }
      />

      {showAddForm && (
        <AddEquipmentForm
          onSubmit={handleAddEquipment}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {showEditForm && selectedEquipment && (
        <EditEquipmentForm
          equipment={selectedEquipment}
          onSubmit={handleUpdateEquipment}
          onSubmitReturn={handleUpdateReturn}
          onCancel={handleCloseEdit}
        />
      )}
    </>
  );
};
