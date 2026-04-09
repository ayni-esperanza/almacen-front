import { useState, useMemo } from 'react';
import { EquipmentTable } from '../features/equipment/components/EquipmentTable';
import { AddEquipmentForm } from '../features/equipment/components/AddEquipmentForm';
import { EditEquipmentForm } from '../features/equipment/components/EditEquipmentForm';
import { useEquipment } from '../features/equipment/hooks/useEquipment';
import { CreateEquipmentData, ReturnEquipmentData, UpdateEquipmentData } from '../shared/services/equipment.service';
import { EquipmentReport } from '../features/equipment/types';

export const EquipmentPage = () => {
  const [activeSubTab, setActiveSubTab] = useState<'continua' | 'fija'>('continua');
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
      <div className="bg-gray-50 border-b border-gray-200 dark:border-slate-700 dark:bg-slate-900 h-fit fade-section">
        <nav className="flex items-center px-2 overflow-x-auto sm:px-6 scrollbar-hide">
          <button
            onClick={() => setActiveSubTab('continua')}
            className={`px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeSubTab === 'continua'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:border-slate-600'
            }`}
          >
            Continua
          </button>
          <button
            onClick={() => setActiveSubTab('fija')}
            className={`px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeSubTab === 'fija'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:border-slate-600'
            }`}
          >
            Fija
          </button>
        </nav>
      </div>

      {activeSubTab === 'continua' ? (
        <div key="continua" className="fade-section">
          <EquipmentTable
            equipments={filteredEquipment}
            loading={equipmentData.loading}
            error={equipmentData.error}
            refetch={equipmentData.refetch}
            onReturn={equipmentData.returnEquipment}
            onEdit={handleOpenEdit}
            onAddEquipment={() => setShowAddForm(true)}
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
        </div>
      ) : (
        <div key="fija" className="fade-section">
          <div className="p-6 bg-white border shadow-lg rounded-xl dark:border-slate-800 dark:bg-slate-950">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-100">Sección Fija</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-slate-300">
              Esta sección está lista para implementar la lógica y componentes de equipos fijos.
            </p>
          </div>
        </div>
      )}

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
