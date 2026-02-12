import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, ShoppingCart } from "lucide-react";
import { MovementTable } from "../features/movements/components/MovementTable.tsx";
import { AddMovementForm } from "../features/movements/components/AddMovementForm.tsx";
import { useMovements } from "../features/movements/hooks/useMovements.ts";
import {
  movementsService,
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
import { PurchaseOrderTable } from "../features/movements/components/PurchaseOrderTable.tsx";
import { PurchaseOrderForm } from "../features/movements/components/PurchaseOrderForm.tsx";
import { PurchaseOrderDetail } from "../features/movements/components/PurchaseOrderDetail.tsx";
import { usePurchaseOrders } from "../features/movements/hooks/usePurchaseOrders.ts";
import { PurchaseOrder } from "../features/movements/types/purchases.ts";
import {
  CreatePurchaseOrderData,
  UpdatePurchaseOrderData,
} from "../features/movements/services/purchase-orders.service.ts";

export const MovementsPage = () => {
  const [activeSubTab, setActiveSubTab] = useState<
    "entradas" | "salidas" | "compras"
  >("entradas");
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<MovementEntry | null>(
    null,
  );
  const [selectedExit, setSelectedExit] = useState<MovementExit | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    type: "entry" | "exit" | null;
    target: MovementEntry | MovementExit | null;
  }>({ open: false, type: null, target: null });
  const movementsData = useMovements();

  // Estados para Purchase Orders
  const [showPurchaseOrderForm, setShowPurchaseOrderForm] = useState(false);
  const [selectedPurchaseOrder, setSelectedPurchaseOrder] =
    useState<PurchaseOrder | null>(null);
  const [showPurchaseOrderDetail, setShowPurchaseOrderDetail] = useState(false);
  const [editingPurchaseOrder, setEditingPurchaseOrder] =
    useState<PurchaseOrder | null>(null);
  const purchaseOrdersData = usePurchaseOrders();

  const { user } = useAuth();

  // Limpiar cuando se cambie de pestaña
  useEffect(() => {
    setSelectedEntry(null);
    setSelectedExit(null);
    if (!movementsData.loading) {
      setHasLoaded(true);
    }
    // Cargar órdenes de compra cuando se seleccione esa pestaña
    if (activeSubTab === "compras") {
      purchaseOrdersData.fetchPurchaseOrders();
    }
  }, [
    activeSubTab,
    movementsData.entries,
    movementsData.exits,
    movementsData.loading,
  ]);

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
    if (isExportingPdf) return;
    setIsExportingPdf(true);
    try {
      const userName =
        user?.firstName && user?.lastName
          ? `${user.firstName} ${user.lastName}`
          : user?.username || "Usuario";

      // Recopilar filtros activos para mostrar en el PDF
      const activeFilters: string[] = [];
      if (movementsData.filterEPP) activeFilters.push("EPP");
      if (movementsData.filterArea)
        activeFilters.push(`Área: ${movementsData.filterArea}`);
      if (movementsData.filterProyecto && activeSubTab === "salidas")
        activeFilters.push(`Proyecto: ${movementsData.filterProyecto}`);
      if (movementsData.filterResponsable && activeSubTab === "salidas")
        activeFilters.push(`Responsable: ${movementsData.filterResponsable}`);
      if (movementsData.startDate)
        activeFilters.push(`Desde: ${movementsData.startDate}`);
      if (movementsData.endDate)
        activeFilters.push(`Hasta: ${movementsData.endDate}`);

      // Obtener TODOS los datos filtrados (sin paginación) para el PDF
      // Usamos el total real del servidor para no hardcodear un límite arbitrario
      const totalForExport =
        activeSubTab === "entradas"
          ? movementsData.entriesTotalItems
          : movementsData.exitsTotalItems;

      if (!totalForExport || totalForExport === 0) {
        alert("No hay datos con los filtros aplicados para exportar.");
        return;
      }

      // Límite de seguridad: avisar si hay muchos registros
      const MAX_EXPORT = 50000;
      if (totalForExport > MAX_EXPORT) {
        const proceed = confirm(
          `Se exportarán ${totalForExport.toLocaleString()} registros. Esto puede tardar. ¿Desea continuar?`,
        );
        if (!proceed) return;
      }

      let dataToExport: MovementEntry[] | MovementExit[];
      const exportLimit = Math.min(totalForExport, MAX_EXPORT);

      if (activeSubTab === "entradas") {
        const response = await movementsService.getAllEntries(
          movementsData.startDate || undefined,
          movementsData.endDate || undefined,
          1,
          exportLimit,
          movementsData.filterEPP ? "epp" : undefined,
          movementsData.searchTermEntries || undefined,
          movementsData.filterArea || undefined,
          undefined,
        );
        dataToExport = response.data;
      } else {
        const response = await movementsService.getAllExits(
          movementsData.startDate || undefined,
          movementsData.endDate || undefined,
          1,
          exportLimit,
          movementsData.filterEPP ? "epp" : undefined,
          movementsData.searchTermExits || undefined,
          movementsData.filterArea || undefined,
          movementsData.filterProyecto || undefined,
          movementsData.filterResponsable || undefined,
        );
        dataToExport = response.data;
      }

      if (!dataToExport || dataToExport.length === 0) {
        alert("No hay datos con los filtros aplicados para exportar.");
        return;
      }

      await movementsPDFService.exportMovements({
        type: activeSubTab === "entradas" ? "entradas" : "salidas",
        data: dataToExport,
        userName,
        activeFilters: activeFilters.length > 0 ? activeFilters : undefined,
      });
    } catch (error) {
      console.error("Error al exportar PDF:", error);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Handlers para Purchase Orders
  const handleAddPurchaseOrder = () => {
    setEditingPurchaseOrder(null);
    setShowPurchaseOrderForm(true);
  };

  const handleEditPurchaseOrder = (order: PurchaseOrder) => {
    setEditingPurchaseOrder(order);
    setShowPurchaseOrderForm(true);
  };

  const handleSelectPurchaseOrder = (order: PurchaseOrder) => {
    setSelectedPurchaseOrder(order);
    setShowPurchaseOrderDetail(true);
  };

  const handleSubmitPurchaseOrder = async (
    data: CreatePurchaseOrderData | UpdatePurchaseOrderData,
  ) => {
    try {
      if (editingPurchaseOrder) {
        await purchaseOrdersData.updatePurchaseOrder(
          editingPurchaseOrder.id,
          data as UpdatePurchaseOrderData,
        );
      } else {
        await purchaseOrdersData.createPurchaseOrder(
          data as CreatePurchaseOrderData,
        );
      }
      setShowPurchaseOrderForm(false);
      setEditingPurchaseOrder(null);
    } catch (error) {
      console.error("Error saving purchase order:", error);
      throw error;
    }
  };

  const handleDeletePurchaseOrder = async () => {
    if (!editingPurchaseOrder) return;
    if (confirm(`¿Eliminar la orden ${editingPurchaseOrder.codigo}?`)) {
      try {
        await purchaseOrdersData.deletePurchaseOrder(editingPurchaseOrder.id);
        setShowPurchaseOrderForm(false);
        setEditingPurchaseOrder(null);
      } catch (error) {
        console.error("Error deleting purchase order:", error);
      }
    }
  };

  const deletePurchaseOrderById = async (id: number): Promise<boolean> => {
    try {
      await purchaseOrdersData.deletePurchaseOrder(id);
      return true;
    } catch (error) {
      console.error("No se pudo eliminar la orden de compra:", error);
      alert(error instanceof Error ? error.message : "Error al eliminar");
      return false;
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
          <button
            onClick={() => setActiveSubTab("compras")}
            className={`flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeSubTab === "compras"
                ? "border-orange-500 text-orange-600 dark:text-orange-400"
                : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:border-slate-600"
            }`}
          >
            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Compras</span>
          </button>
        </nav>
      </div>

      {movementsData.loading && !hasLoaded && activeSubTab !== "compras" ? (
        <div className="flex flex-col items-center justify-center gap-4 p-8 text-gray-600 dark:text-slate-300 fade-section">
          <div
            className="w-12 h-12 border-b-2 border-green-500 rounded-full animate-spin"
            aria-label="Cargando movimientos"
          />
          <p className="text-sm font-medium">Cargando movimientos...</p>
        </div>
      ) : activeSubTab === "entradas" ? (
        <div key="entradas" className="fade-section">
          <MovementTable
            movements={movementsData.entries}
            type="entrada"
            onEditEntry={setSelectedEntry}
            onExportPdf={handleExportPdf}
            isExportingPdf={isExportingPdf}
            onAddMovement={() => setShowAddForm(true)}
            startDate={movementsData.startDate}
            endDate={movementsData.endDate}
            onStartDateChange={movementsData.setStartDate}
            onEndDateChange={movementsData.setEndDate}
            filterEPP={movementsData.filterEPP}
            setFilterEPP={movementsData.setFilterEPP}
            searchTerm={movementsData.searchTermEntries}
            setSearchTerm={movementsData.setSearchTermEntries}
            filterArea={movementsData.filterArea}
            setFilterArea={movementsData.setFilterArea}
            filterProyecto={movementsData.filterProyecto}
            setFilterProyecto={movementsData.setFilterProyecto}
            filterResponsable={movementsData.filterResponsable}
            setFilterResponsable={movementsData.setFilterResponsable}
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
      ) : activeSubTab === "salidas" ? (
        <div key="salidas" className="fade-section">
          <MovementTable
            movements={movementsData.exits}
            type="salida"
            onEditExit={setSelectedExit}
            onExportPdf={handleExportPdf}
            isExportingPdf={isExportingPdf}
            onAddMovement={() => setShowAddForm(true)}
            startDate={movementsData.startDate}
            endDate={movementsData.endDate}
            onStartDateChange={movementsData.setStartDate}
            onEndDateChange={movementsData.setEndDate}
            filterEPP={movementsData.filterEPP}
            setFilterEPP={movementsData.setFilterEPP}
            searchTerm={movementsData.searchTermExits}
            setSearchTerm={movementsData.setSearchTermExits}
            filterArea={movementsData.filterArea}
            setFilterArea={movementsData.setFilterArea}
            filterProyecto={movementsData.filterProyecto}
            setFilterProyecto={movementsData.setFilterProyecto}
            filterResponsable={movementsData.filterResponsable}
            setFilterResponsable={movementsData.setFilterResponsable}
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
      ) : (
        <div
          key={`compras-${purchaseOrdersData.purchaseOrders.length}`}
          className="fade-section"
        >
          <PurchaseOrderTable
            purchaseOrders={purchaseOrdersData.purchaseOrders}
            onSelectOrder={handleSelectPurchaseOrder}
            onEditOrder={handleEditPurchaseOrder}
            onAddOrder={handleAddPurchaseOrder}
            startDate={purchaseOrdersData.startDate}
            endDate={purchaseOrdersData.endDate}
            onStartDateChange={purchaseOrdersData.setStartDate}
            onEndDateChange={purchaseOrdersData.setEndDate}
            searchTerm={purchaseOrdersData.searchTerm}
            setSearchTerm={purchaseOrdersData.setSearchTerm}
            refetch={purchaseOrdersData.refetch}
            currentPage={purchaseOrdersData.currentPage}
            itemsPerPage={purchaseOrdersData.itemsPerPage}
            totalPages={purchaseOrdersData.totalPages}
            totalItems={purchaseOrdersData.totalItems}
            onPageChange={purchaseOrdersData.setCurrentPage}
            onItemsPerPageChange={purchaseOrdersData.setItemsPerPage}
            deletePurchaseOrder={deletePurchaseOrderById}
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

      {showPurchaseOrderForm && (
        <PurchaseOrderForm
          order={editingPurchaseOrder || undefined}
          onSubmit={handleSubmitPurchaseOrder}
          onCancel={() => {
            setShowPurchaseOrderForm(false);
            setEditingPurchaseOrder(null);
          }}
          onDelete={
            editingPurchaseOrder ? handleDeletePurchaseOrder : undefined
          }
        />
      )}

      {showPurchaseOrderDetail && selectedPurchaseOrder && (
        <PurchaseOrderDetail
          order={selectedPurchaseOrder}
          onClose={() => {
            setShowPurchaseOrderDetail(false);
            setSelectedPurchaseOrder(null);
          }}
          onRefresh={purchaseOrdersData.refetch}
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
                  (confirmState.target as MovementExit | null)?.descripcion ??
                  ""
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
