import { useEffect, useMemo, useState } from 'react';
import { Download, Plus } from 'lucide-react';
import { MovementTable } from '../features/movements/components/MovementTable.tsx';
import { AddMovementForm } from '../features/movements/components/AddMovementForm.tsx';
import { useMovements } from '../features/movements/hooks/useMovements.ts';
import { CreateEntryData, CreateExitData, UpdateEntryData, UpdateExitData } from '../shared/services/movements.service.ts';
import { MovementEntry, MovementExit } from '../features/movements/types/index.ts';
import { EditMovementForm } from '../features/movements/components/EditMovementForm.tsx';
import { EditExitMovementForm } from '../features/movements/components/EditExitMovementForm.tsx';

export const MovementsPage = () => {
  const [activeSubTab, setActiveSubTab] = useState<'entradas' | 'salidas'>('entradas');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<MovementEntry | null>(null);
  const [selectedExit, setSelectedExit] = useState<MovementExit | null>(null);
  const movementsData = useMovements();

  const sampleExitData = useMemo<MovementExit[]>(
    () => [
      {
        id: 999999,
        fecha: '17/10/2025',
        codigoProducto: 'AF2025',
        descripcion: 'Afloja Todo Aerosol 300ml',
        precioUnitario: 12,
        cantidad: 4,
        responsable: 'María Gonzales',
        area: 'MECANICA',
        proyecto: 'Proyecto Alfa',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],
    []
  );

  useEffect(() => {
    setSelectedEntry(null);
    setSelectedExit(null);
  }, [activeSubTab]);

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

  const handleUpdateEntry = async (data: UpdateEntryData) => {
    if (!selectedEntry) return;
    try {
      await movementsData.updateEntry(selectedEntry.id, data);
      setSelectedEntry(null);
    } catch (error) {
      console.error('Error updating entry:', error);
      throw error;
    }
  };

  const handleUpdateExit = async (data: UpdateExitData) => {
    if (!selectedExit) return;
    const existsInApi = movementsData.exits.some((exit) => exit.id === selectedExit.id);
    if (!existsInApi) {
      setSelectedExit(null);
      return;
    }
    try {
      await movementsData.updateExit(selectedExit.id, data);
      setSelectedExit(null);
    } catch (error) {
      console.error('Error updating exit:', error);
      throw error;
    }
  };

  const exitMovementsToDisplay = movementsData.exits.length > 0 ? movementsData.exits : sampleExitData;

  const handleExportPdf = () => {
    console.info('Exportar PDF aún no está implementado.');
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
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportPdf}
              className="flex items-center space-x-2 rounded-lg bg-green-500 px-5 py-2 text-sm font-medium text-white shadow-md transition-colors hover:bg-green-600"
            >
              <Download className="h-4 w-4" />
              <span>Exportar PDF</span>
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center space-x-2 rounded-lg bg-green-500 px-6 py-2 font-medium text-white shadow-md transition-colors hover:bg-green-600"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar</span>
            </button>
          </div>
        </div>
      </div>

      {activeSubTab === 'entradas' ? (
        <MovementTable 
          movements={movementsData.entries} 
          type="entrada" 
          onEditEntry={setSelectedEntry}
        />
      ) : (
        <MovementTable 
          movements={exitMovementsToDisplay} 
          type="salida"
          onEditExit={setSelectedExit}
        />
      )}

      {showAddForm && (
        <AddMovementForm
          type={activeSubTab === 'entradas' ? 'entrada' : 'salida'}
          onSubmit={handleAddMovement}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {selectedEntry && (
        <EditMovementForm
          entry={selectedEntry}
          onSubmit={handleUpdateEntry}
          onCancel={() => setSelectedEntry(null)}
        />
      )}

      {selectedExit && (
        <EditExitMovementForm
          exit={selectedExit}
          onSubmit={handleUpdateExit}
          onCancel={() => setSelectedExit(null)}
        />
      )}
    </>
  );
};
