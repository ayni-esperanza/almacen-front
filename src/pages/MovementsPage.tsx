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

  const handleDeleteEntry = async (entry: MovementEntry) => {
    try {
      await movementsData.deleteEntry(entry.id);
      setSelectedEntry(null); // Cerrar el modal/formulario
    } catch (error) {
      console.error("No se pudo eliminar la entrada:", error);
      // Mostrar toast o alerta de error aquí
      alert(error instanceof Error ? error.message : "Error al eliminar");
    }
  };

  const handleDeleteExit = async (exit: MovementExit) => {
    try {
      await movementsData.deleteExit(exit.id);
      setSelectedExit(null); // Cerrar el modal/formulario
    } catch (error) {
      console.error("No se pudo eliminar la salida:", error);
      alert(error instanceof Error ? error.message : "Error al eliminar");
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
      {/* Navegación secundaria estilo pestañas - STICKY */}
      <div className="sticky top-[109px] z-20 bg-gray-50 border-b border-gray-200 dark:border-slate-700 dark:bg-slate-900 h-fit">
        <nav className="flex items-center px-2 overflow-x-auto sm:px-6 scrollbar-hide">
          <button
            onClick={() => setActiveSubTab("entradas")}
            className={`flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeSubTab === "entradas"
                ? "border-green-500 text-green-600 dark:text-emerald-400"
                : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:border-slate-600"
            }`}
          >
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Entradas</span>
          </button>
          <button
            onClick={() => setActiveSubTab("salidas")}
            className={`flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeSubTab === "salidas"
                ? "border-red-500 text-red-600 dark:text-rose-400"
                : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:border-slate-600"
            }`}
          >
            <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5" />
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
          onDelete={handleDeleteEntry}
        />
      )}

      {selectedExit && (
        <EditExitMovementForm
          exit={selectedExit}
          onSubmit={handleUpdateExit}
          onCancel={() => setSelectedExit(null)}
          onDelete={handleDeleteExit}
        />
      )}
    </>
  );
};
