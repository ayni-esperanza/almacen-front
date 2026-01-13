import { useEffect, useState, useCallback } from "react";
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
import { ConfirmModal } from "../shared/components/ConfirmModal.tsx";

export const MovementsPage = () => {
  const [activeSubTab, setActiveSubTab] = useState<"entradas" | "salidas">(
    "entradas"
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<MovementEntry | null>(
    null
  );
  const [selectedExit, setSelectedExit] = useState<MovementExit | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    type: "entry" | "exit" | null;
    target: MovementEntry | MovementExit | null;
  }>({ open: false, type: null, target: null });
  const movementsData = useMovements();
  // Almacena los datos filtrados/ordenados que vienen de la tabla
  const [visibleData, setVisibleData] = useState<
    (MovementEntry | MovementExit)[]
  >([]);
  const { user } = useAuth();

  // Limpiar/Reiniciar visibleData cuando se cambie de pestaña
  useEffect(() => {
    setSelectedEntry(null);
    setSelectedExit(null);
    // Reiniciamos con todos los datos para evitar que se quede pegada data de la tab anterior momentáneamente
    setVisibleData(
      activeSubTab === "entradas" ? movementsData.entries : movementsData.exits
    );
    if (!movementsData.loading) {
      setHasLoaded(true);
    }
  }, [
    activeSubTab,
    movementsData.entries,
    movementsData.exits,
    movementsData.loading,
  ]);

  // Usamos useCallback para evitar re-renders infinitos en la tabla
  const handleDataFiltered = useCallback(
    (data: (MovementEntry | MovementExit)[]) => {
      setVisibleData(data);
    },
    []
  );

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
    setConfirmState({ open: true, type: "entry", target: entry });
  };

  const handleDeleteExit = async (exit: MovementExit) => {
    setConfirmState({ open: true, type: "exit", target: exit });
  };

  const deleteMovement = async (id: number, type: "entrada" | "salida") => {
    try {
      if (type === "entrada") {
        await movementsData.deleteEntry(id);
      } else {
        await movementsData.deleteExit(id);
      }
      return true;
    } catch (error) {
      console.error("No se pudo eliminar el movimiento:", error);
      alert(error instanceof Error ? error.message : "Error al eliminar");
      return false;
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmState.type || !confirmState.target) {
      setConfirmState({ open: false, type: null, target: null });
      return;
    }

    try {
      setIsConfirming(true);

      if (confirmState.type === "entry") {
        const entry = confirmState.target as MovementEntry;
        await movementsData.deleteEntry(entry.id);
        setSelectedEntry(null);
      } else {
        const exit = confirmState.target as MovementExit;
        await movementsData.deleteExit(exit.id);
        setSelectedExit(null);
      }
    } catch (error) {
      console.error("No se pudo eliminar el movimiento:", error);
      alert(error instanceof Error ? error.message : "Error al eliminar");
    } finally {
      setIsConfirming(false);
      setConfirmState({ open: false, type: null, target: null });
    }
  };

  const handleExportPdf = async () => {
    try {
      const userName =
        user?.firstName && user?.lastName
          ? `${user.firstName} ${user.lastName}`
          : user?.username || "Usuario";

      // Usamos 'visibleData' en lugar de 'movementsData.entries/exits'
      const dataToExport = visibleData;

      if (!dataToExport || dataToExport.length === 0) {
        // Fallback por seguridad o mostrar alerta
        console.warn("No hay datos visibles para exportar");
        alert("No hay datos en la tabla para exportar.");
        return;
      }

      await movementsPDFService.exportMovements({
        type: activeSubTab,
        data: dataToExport as MovementEntry[] | MovementExit[],
        userName,
      });
    } catch (error) {
      console.error("Error al exportar PDF:", error);
    }
  };

  return (
    <>
      {/* Navegación secundaria estilo pestañas - STICKY */}
      <div className="sticky top-[109px] z-20 bg-gray-50 border-b border-gray-200 dark:border-slate-700 dark:bg-slate-900 h-fit fade-section">
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

      {movementsData.loading && !hasLoaded ? (
        <div className="flex flex-col items-center justify-center gap-4 p-8 text-gray-600 dark:text-slate-300 fade-section">
          <div
            className="w-12 h-12 border-b-2 border-green-500 rounded-full animate-spin"
            aria-label="Cargando movimientos"
          />
          <p className="text-sm font-medium">Cargando movimientos...</p>
        </div>
      ) : activeSubTab === "entradas" ? (
        <div
          key={`entradas-${movementsData.startDate}-${movementsData.endDate}-${movementsData.entries.length}`}
          className="fade-section"
        >
          <MovementTable
            movements={movementsData.entries}
            type="entrada"
            onEditEntry={setSelectedEntry}
            onExportPdf={handleExportPdf}
            onAddMovement={() => setShowAddForm(true)}
            onDataFiltered={handleDataFiltered}
            startDate={movementsData.startDate}
            endDate={movementsData.endDate}
            onStartDateChange={movementsData.setStartDate}
            onEndDateChange={movementsData.setEndDate}
            filterEPP={movementsData.filterEPP}
            setFilterEPP={movementsData.setFilterEPP}
            deleteMovement={deleteMovement}
            refetchMovements={() => movementsData.refetchEntries()}
            currentPage={movementsData.entriesPage}
            itemsPerPage={movementsData.entriesLimit}
            totalPages={movementsData.entriesTotalPages}
            totalItems={movementsData.entriesTotalItems}
            onPageChange={movementsData.setEntriesPage}
            onItemsPerPageChange={movementsData.setEntriesLimit}
          />
        </div>
      ) : (
        <div
          key={`salidas-${movementsData.startDate}-${movementsData.endDate}-${movementsData.exits.length}`}
          className="fade-section"
        >
          <MovementTable
            movements={movementsData.exits}
            type="salida"
            onEditExit={setSelectedExit}
            onExportPdf={handleExportPdf}
            onAddMovement={() => setShowAddForm(true)}
            onDataFiltered={handleDataFiltered}
            startDate={movementsData.startDate}
            endDate={movementsData.endDate}
            onStartDateChange={movementsData.setStartDate}
            onEndDateChange={movementsData.setEndDate}
            filterEPP={movementsData.filterEPP}
            setFilterEPP={movementsData.setFilterEPP}
            deleteMovement={deleteMovement}
            refetchMovements={() => movementsData.refetchExits()}
            currentPage={movementsData.exitsPage}
            itemsPerPage={movementsData.exitsLimit}
            totalPages={movementsData.exitsTotalPages}
            totalItems={movementsData.exitsTotalItems}
            onPageChange={movementsData.setExitsPage}
            onItemsPerPageChange={movementsData.setExitsLimit}
          />
        </div>
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

      <ConfirmModal
        isOpen={confirmState.open}
        title={
          confirmState.type === "entry"
            ? "Eliminar entrada"
            : confirmState.type === "exit"
            ? "Eliminar salida"
            : "Eliminar movimiento"
        }
        message={
          confirmState.type === "entry"
            ? `¿Eliminar definitivamente la entrada de "${
                (confirmState.target as MovementEntry | null)?.descripcion ?? ""
              }"?`
            : confirmState.type === "exit"
            ? `¿Eliminar definitivamente la salida de "${
                (confirmState.target as MovementExit | null)?.descripcion ?? ""
              }"?`
            : ""
        }
        confirmLabel={
          confirmState.type === "entry" ? "Eliminar entrada" : "Eliminar salida"
        }
        onConfirm={handleConfirmDelete}
        onCancel={() =>
          setConfirmState({ open: false, type: null, target: null })
        }
        isProcessing={isConfirming}
        destructive
      />
    </>
  );
};
