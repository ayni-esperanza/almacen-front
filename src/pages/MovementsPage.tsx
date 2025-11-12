import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { MovementTable } from "../features/movements/components/MovementTable.tsx";
import { AddMovementForm } from "../features/movements/components/AddMovementForm.tsx";
import { useMovements } from "../features/movements/hooks/useMovements.ts";
import {
  CreateEntryData,
  CreateExitData,
  UpdateEntryData,
  UpdateExitData,
} from "../shared/services/movements.service.ts";
import {
  MovementEntry,
  MovementExit,
} from "../features/movements/types/index.ts";
import { EditMovementForm } from "../features/movements/components/EditMovementForm.tsx";
import { EditExitMovementForm } from "../features/movements/components/EditExitMovementForm.tsx";
import { movementsPDFService } from "../features/movements/services/movements-pdf.service.ts";
import { useAuth } from "../shared/hooks/useAuth.tsx";

export const MovementsPage = () => {
  const [activeSubTab, setActiveSubTab] = useState<"entradas" | "salidas">(
    "entradas"
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<MovementEntry | null>(
    null
  );
  const [selectedExit, setSelectedExit] = useState<MovementExit | null>(null);
  const movementsData = useMovements();
  const { user } = useAuth();

  useEffect(() => {
    setSelectedEntry(null);
    setSelectedExit(null);
  }, [activeSubTab]);

  const handleAddMovement = async (data: CreateEntryData | CreateExitData) => {
    try {
      if (activeSubTab === "entradas") {
        await movementsData.createEntry(data as CreateEntryData);
      } else {
        await movementsData.createExit(data as CreateExitData);
      }
      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding movement:", error);
    }
  };

  const handleUpdateEntry = async (data: UpdateEntryData) => {
    if (!selectedEntry) return;
    try {
      await movementsData.updateEntry(selectedEntry.id, data);
      setSelectedEntry(null);
    } catch (error) {
      console.error("Error updating entry:", error);
      throw error;
    }
  };

  const handleUpdateExit = async (data: UpdateExitData) => {
    if (!selectedExit) return;
    try {
      await movementsData.updateExit(selectedExit.id, data);
      setSelectedExit(null);
    } catch (error) {
      console.error("Error updating exit:", error);
      throw error;
    }
  };

  const handleExportPdf = async () => {
    try {
      const userName =
        user?.firstName && user?.lastName
          ? `${user.firstName} ${user.lastName}`
          : user?.username || "Usuario";
      const data =
        activeSubTab === "entradas"
          ? movementsData.entries
          : movementsData.exits;

      await movementsPDFService.exportMovements({
        type: activeSubTab,
        data,
        userName,
      });
    } catch (error) {
      console.error("Error al exportar PDF:", error);
    }
  };

  return (
    <>
      {/* Navegación secundaria estilo pestañas */}
      <div className="mb-6 border-b border-gray-200 dark:border-slate-800">
        <nav className="flex -mb-px space-x-8">
          <button
            onClick={() => setActiveSubTab("entradas")}
            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
              activeSubTab === "entradas"
                ? "border-green-500 text-green-600 dark:text-emerald-400"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:border-slate-700"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Entradas</span>
          </button>
          <button
            onClick={() => setActiveSubTab("salidas")}
            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
              activeSubTab === "salidas"
                ? "border-red-500 text-red-600 dark:text-rose-400"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:border-slate-700"
            }`}
          >
            <TrendingDown className="w-4 h-4" />
            <span>Salidas</span>
          </button>
        </nav>
      </div>

      {activeSubTab === "entradas" ? (
        <MovementTable
          movements={movementsData.entries}
          type="entrada"
          onEditEntry={setSelectedEntry}
          onExportPdf={handleExportPdf}
          onAddMovement={() => setShowAddForm(true)}
        />
      ) : (
        <MovementTable
          movements={movementsData.exits}
          type="salida"
          onEditExit={setSelectedExit}
          onExportPdf={handleExportPdf}
          onAddMovement={() => setShowAddForm(true)}
        />
      )}

      {showAddForm && (
        <AddMovementForm
          type={activeSubTab === "entradas" ? "entrada" : "salida"}
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
