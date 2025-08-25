import { useState } from 'react';
import { Plus } from 'lucide-react';
import { EquipmentTable } from '../features/equipment/components/EquipmentTable';
import { AddEquipmentForm } from '../features/equipment/components/AddEquipmentForm';
import { equipmentReports } from '../features/inventory/data/mockData';
import { EquipmentReport } from '../features/equipment/types';

export const EquipmentPage = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [equipments, setEquipments] = useState<EquipmentReport[]>(equipmentReports);

  const handleAddEquipment = (data: any) => {
    setEquipments([{ ...data, id: Date.now().toString() }, ...equipments]);
    setShowAddForm(false);
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

      <EquipmentTable equipments={equipments} />

      {showAddForm && (
        <AddEquipmentForm
          onSubmit={handleAddEquipment}
          onCancel={() => setShowAddForm(false)}
        />
      )}
    </>
  );
};
