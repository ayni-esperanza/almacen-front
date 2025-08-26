import { useState } from 'react';
import { Plus } from 'lucide-react';
import { MovementTable } from '../features/movements/components/MovementTable';
import { AddMovementForm } from '../features/movements/components/AddMovementForm';
import { useMovements } from '../features/movements/hooks/useMovements';
import { CreateEntryData, CreateExitData } from '../shared/services/movements.service';

export const MovementsPage = () => {
  const [activeSubTab, setActiveSubTab] = useState<'entradas' | 'salidas'>('entradas');
  const [showAddForm, setShowAddForm] = useState(false);
  const movementsData = useMovements();

  const handleAddMovement = async (data: CreateEntryData | CreateExitData) => {
    try {
      if (activeSubTab === 'entradas') {
        await movementsData.createEntry(data as CreateEntryData);
      } else {
        await movementsData.createExit(data as CreateExitData);
      }
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding movement:', error);
    }
  };

  const handleUpdateQuantity = async (id: string, newQuantity: number) => {
    try {
      await movementsData.updateExitQuantity(parseInt(id), { cantidad: newQuantity });
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveSubTab('entradas')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeSubTab === 'entradas'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Entradas
            </button>
            <button
              onClick={() => setActiveSubTab('salidas')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeSubTab === 'salidas'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Salidas
            </button>
          </div>
          
          <button
            onClick={() => setShowAddForm(true)}
            className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center space-x-2 font-medium shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'entradas' ? (
        <MovementTable 
          movements={movementsData.entries} 
          type="entrada" 
        />
      ) : (
        <MovementTable 
          movements={movementsData.exits} 
          type="salida" 
          onUpdateQuantity={handleUpdateQuantity} 
        />
      )}

      {showAddForm && (
        <AddMovementForm
          type={activeSubTab === 'entradas' ? 'entrada' : 'salida'}
          onSubmit={handleAddMovement}
          onCancel={() => setShowAddForm(false)}
        />
      )}
    </>
  );
};
