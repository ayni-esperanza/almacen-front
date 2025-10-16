import { useState } from 'react';
import { Plus } from 'lucide-react';
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
  const equipmentData = useEquipment();

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
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => setShowAddForm(true)}
          className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center space-x-2 font-medium shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Reporte</span>
        </button>
      </div>

      <EquipmentTable
        equipments={equipmentData.equipment}
        loading={equipmentData.loading}
        error={equipmentData.error}
        refetch={equipmentData.refetch}
        onReturn={equipmentData.returnEquipment}
        onEdit={handleOpenEdit}
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
