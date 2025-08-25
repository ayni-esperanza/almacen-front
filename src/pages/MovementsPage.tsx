import { useState } from 'react';
import { Plus } from 'lucide-react';
import { MovementTable } from '../features/movements/components/MovementTable';
import { AddMovementForm } from '../features/movements/components/AddMovementForm';
import { entradas, salidas } from '../features/inventory/data/mockData';
import { MovementEntry, MovementExit } from '../features/movements/types';

export const MovementsPage = () => {
  const [activeSubTab, setActiveSubTab] = useState<'entradas' | 'salidas'>('entradas');
  const [showAddForm, setShowAddForm] = useState(false);
  const [movementEntries, setMovementEntries] = useState<MovementEntry[]>(entradas);
  const [movementExits, setMovementExits] = useState<MovementExit[]>(salidas);

  const handleAddMovement = (data: any) => {
    if (activeSubTab === 'entradas') {
      setMovementEntries([data, ...movementEntries]);
    } else {
      setMovementExits([data, ...movementExits]);
    }
    setShowAddForm(false);
  };

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    if (activeSubTab === 'salidas') {
      setMovementExits(movementExits.map(exit => 
        exit.id === id ? { ...exit, cantidad: newQuantity } : exit
      ));
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
        <MovementTable movements={movementEntries} type="entrada" />
      ) : (
        <MovementTable 
          movements={movementExits} 
          type="salida" 
          onUpdateQuantity={handleUpdateQuantity} 
        />
      )}

      {showAddForm && (
        <AddMovementForm
          type={activeSubTab}
          onSubmit={handleAddMovement}
          onCancel={() => setShowAddForm(false)}
        />
      )}
    </>
  );
};
