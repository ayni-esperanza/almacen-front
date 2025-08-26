import { useState } from 'react';
import { Plus } from 'lucide-react';
import { EquipmentTable } from '../features/equipment/components/EquipmentTable';
import { AddEquipmentForm } from '../features/equipment/components/AddEquipmentForm';
import { useEquipment } from '../features/equipment/hooks/useEquipment';
import { CreateEquipmentData } from '../shared/services/equipment.service';

export const EquipmentPage = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const equipmentData = useEquipment();

  const handleAddEquipment = async (data: CreateEquipmentData) => {
    try {
      await equipmentData.createEquipmentReport(data);
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding equipment:', error);
    }
  };

  return (
    <>
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => setShowAddForm(true)}
          className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center space-x-2 font-medium shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar</span>
        </button>
      </div>

      <EquipmentTable 
        equipments={equipmentData.equipment}
        loading={equipmentData.loading}
        error={equipmentData.error}
        refetch={equipmentData.refetch}
        onReturn={equipmentData.returnEquipment}
      />

      {showAddForm && (
        <AddEquipmentForm
          onSubmit={handleAddEquipment}
          onCancel={() => setShowAddForm(false)}
        />
      )}
    </>
  );
};
