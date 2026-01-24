import React, { useEffect, useMemo, useState } from "react";
import { PurchaseOrder } from "../types/purchases.ts";
import { Pagination } from "../../../shared/components/Pagination";
import { useSelectableRowClick } from "../../../shared/hooks/useSelectableRowClick";
import { useBulkSelection } from "../../../shared/hooks/useBulkSelection";
import { useSort, SortColumnConfig } from "../../../shared/hooks/useSort";
import { ConfirmModal } from "../../../shared/components/ConfirmModal";
import {
  Search,
  Download,
  Plus,
  Calendar,
  ShoppingCart,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  Trash2,
} from "lucide-react";

interface PurchaseOrderTableProps {
  purchaseOrders: PurchaseOrder[];
  onSelectOrder?: (order: PurchaseOrder) => void;
  onEditOrder?: (order: PurchaseOrder) => void;
  onExportPdf?: () => void;
  onAddOrder?: () => void;
  startDate?: string;
  endDate?: string;
  onStartDateChange?: (date: string) => void;
  onEndDateChange?: (date: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  refetch?: () => Promise<void>;
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (limit: number) => void;
  deletePurchaseOrder?: (id: number) => Promise<boolean>;
}

interface PurchaseOrderRowProps {
  order: PurchaseOrder;
  onSelectOrder?: (order: PurchaseOrder) => void;
  onEditOrder?: (order: PurchaseOrder) => void;
  isSelected: boolean;
  onToggleSelect: () => void;
  onMouseDownSelect: (isSelected: boolean) => void;
  onMouseEnterRow: () => void;
}

type SortKey = "fecha" | "codigo";

// Helper function to convert "DD/MM/YYYY" to a numeric timestamp
const parseDateString = (dateStr: string | undefined): number => {
  if (!dateStr) return 0;
  if (dateStr.includes("T") || dateStr.includes("-")) {
    return new Date(dateStr).getTime();
  }
  const parts = dateStr.split("/");
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day).getTime();
  }
  return 0;
};

const PurchaseOrderRow: React.FC<PurchaseOrderRowProps> = ({
  order,
  onSelectOrder,
  onEditOrder,
  isSelected,
  onToggleSelect,
  onMouseDownSelect,
  onMouseEnterRow,
}) => {
  const handleRowClick = useSelectableRowClick(() => {
    if (onSelectOrder) {
      onSelectOrder(order);
    }
  });

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onEditOrder) {
      onEditOrder(order);
    }
  };

  return (
    <tr
      onClick={handleRowClick}
      onContextMenu={handleContextMenu}
      onMouseEnter={onMouseEnterRow}
      className="transition-colors border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer select-text"
    >
      <td
        className="px-3 py-2 text-xs text-center select-none"
        onMouseDown={(e) => {
          if (e.button === 0) {
            e.stopPropagation();
            onMouseDownSelect(isSelected);
          }
        }}
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onToggleSelect();
          }}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Seleccionar orden ${order.codigo}`}
          className="w-4 h-4 text-orange-600 border-gray-300 rounded cursor-pointer focus:ring-2 focus:ring-orange-500 dark:border-slate-600 dark:bg-slate-800"
        />
      </td>
      <td className="px-3 py-2 text-xs text-gray-700 select-text dark:text-slate-300">
        {order.fecha}
      </td>
      <td className="px-3 py-2 text-xs font-medium text-gray-900 select-text dark:text-slate-100">
        {order.codigo}
      </td>
      <td className="px-3 py-2 text-xs font-medium text-gray-900 text-right select-text dark:text-slate-100">
        {order.cantidad}
      </td>
      <td className="px-3 py-2 text-xs font-medium text-orange-600 text-right select-text dark:text-orange-400">
        S/ {order.costo.toFixed(2)}
      </td>
    </tr>
  );
};

export const PurchaseOrderTable: React.FC<PurchaseOrderTableProps> = ({
  purchaseOrders,
  onSelectOrder,
  onEditOrder,
  onExportPdf,
  onAddOrder,
  startDate = "",
  endDate = "",
  onStartDateChange,
  onEndDateChange,
  searchTerm,
  setSearchTerm,
  refetch,
  currentPage,
  itemsPerPage,
  totalPages,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
  deletePurchaseOrder,
}) => {
  const [showDateFilters, setShowDateFilters] = useState(false);

  const orderSortColumns = useMemo<Record<SortKey, SortColumnConfig<PurchaseOrder>>>(
    () => ({
      fecha: {
        selector: (order: PurchaseOrder) => order.fecha,
        comparator: (a: PurchaseOrder, b: PurchaseOrder) =>
          parseDateString(a.fecha) - parseDateString(b.fecha),
      },
      codigo: {
        selector: (order: PurchaseOrder) => order.codigo,
        type: "string",
        locale: "es",
      },
    }),
    []
  );

  const { sortConfig, toggleSort, sortData } = useSort<PurchaseOrder, SortKey>({
    defaultKey: "fecha",
    defaultDirection: "desc",
    storageKey: "purchaseOrderTableSortConfig",
    columns: orderSortColumns,
  });

  const getSortIcon = (columnKey: SortKey) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown className="w-3 h-3 text-gray-400 opacity-50" />;
    }
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="w-3 h-3 text-orange-600 dark:text-orange-400" />
    ) : (
      <ArrowDown className="w-3 h-3 text-orange-600 dark:text-orange-400" />
    );
  };

  const sortedOrders = React.useMemo(() => {
    return sortData(purchaseOrders);
  }, [purchaseOrders, sortData]);

  const {
    selectedIds,
    toggleSelection,
    toggleAll,
    handleMouseDown,
    handleMouseEnter,
    areAllVisibleSelected,
    requestBulkDelete,
    handleConfirmDelete,
    confirmState,
    closeConfirm,
    isConfirming,
  } = useBulkSelection<PurchaseOrder>({
    getId: (order) => order.id,
    deleteItem: (id) => deletePurchaseOrder?.(id) ?? Promise.resolve(false),
    refetch,
  });

  useEffect(() => {
    if (refetch) {
      refetch();
    }
  }, [startDate, endDate, searchTerm, currentPage, itemsPerPage]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <>
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 text-white py-3 px-4 sm:py-4 sm:px-6 shadow-sm">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <ShoppingCart className="w-6 h-6" />
          <h2 className="text-lg font-bold sm:text-xl">Órdenes de Compra</h2>
        </div>
      </div>

      <div className="flex flex-col bg-white border border-transparent shadow-lg dark:border-slate-800 dark:bg-slate-950">
        <div className="sticky top-[163px] z-20 p-3 bg-white border-b border-gray-200/70 sm:p-4 dark:border-slate-800/70 dark:bg-slate-900 shadow-sm">
          <div className="flex flex-col gap-3">
            {/* Fila de búsqueda, filtros y acciones */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center flex-1 w-full gap-2 sm:gap-3">
                <div className="relative flex-1 sm:max-w-md">
                  <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2 sm:w-5 sm:h-5 dark:text-slate-500" />
                  <input
                    type="text"
                    placeholder="Buscar por código, proveedor..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full py-2 pl-10 pr-4 text-sm text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-orange-400 dark:focus:ring-orange-500/30"
                  />
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setShowDateFilters((prev) => !prev)}
                    aria-pressed={showDateFilters}
                    aria-label="Mostrar u ocultar filtros de fecha"
                    className="p-2 text-gray-600 transition-colors border border-gray-300 rounded-lg hover:bg-gray-100 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-800 h-[38px]"
                  >
                    <Filter className="w-4 h-4" />
                  </button>

                  <div
                    className={`flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 overflow-hidden transition-all duration-300 ease-in-out ${
                      showDateFilters
                        ? "max-w-[800px] opacity-100"
                        : "max-w-0 opacity-0"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400 dark:text-slate-400" />
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => onStartDateChange?.(e.target.value)}
                        className="w-full py-2 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200"
                      />
                      <span className="text-sm text-gray-500">a</span>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => onEndDateChange?.(e.target.value)}
                        className="w-full py-2 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 sm:gap-3">
                {selectedIds.size > 0 && (
                  <button
                    onClick={() => requestBulkDelete()}
                    className="flex items-center px-3 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-1.5" />
                    Eliminar ({selectedIds.size})
                  </button>
                )}
                {onExportPdf && (
                  <button
                    onClick={onExportPdf}
                    className="inline-flex items-center px-3 py-2 text-xs font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700"
                  >
                    <Download className="w-4 h-4 mr-1.5" />
                    Exportar PDF
                  </button>
                )}
                {onAddOrder && (
                  <button
                    onClick={onAddOrder}
                    className="inline-flex items-center px-3 py-2 text-xs font-medium text-white transition-colors bg-orange-500 rounded-lg hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700"
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    Nueva Orden
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-800">
              <tr>
                <th className="px-3 py-3 text-xs text-center select-none">
                  <input
                    type="checkbox"
                    checked={areAllVisibleSelected(sortedOrders)}
                    onChange={() => toggleAll(sortedOrders)}
                    aria-label="Seleccionar todas las órdenes"
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded cursor-pointer focus:ring-2 focus:ring-orange-500 dark:border-slate-600 dark:bg-slate-800"
                  />
                </th>
                <th
                  onClick={() => toggleSort("fecha")}
                  className="px-3 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase cursor-pointer select-none group hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-700"
                >
                  <div className="flex items-center gap-1">
                    Fecha
                    {getSortIcon("fecha")}
                  </div>
                </th>
                <th
                  onClick={() => toggleSort("codigo")}
                  className="px-3 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase cursor-pointer select-none group hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-700"
                >
                  <div className="flex items-center gap-1">
                    Orden de Compra
                    {getSortIcon("codigo")}
                  </div>
                </th>
                <th className="px-3 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase dark:text-slate-400">
                  Cantidad
                </th>
                <th className="px-3 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase dark:text-slate-400">
                  Costo
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-900 dark:divide-slate-800">
              {sortedOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-sm text-center text-gray-500 dark:text-slate-400"
                  >
                    No se encontraron órdenes de compra
                  </td>
                </tr>
              ) : (
                sortedOrders.map((order) => (
                  <PurchaseOrderRow
                    key={order.id}
                    order={order}
                    onSelectOrder={onSelectOrder}
                    onEditOrder={onEditOrder}
                    isSelected={selectedIds.has(order.id)}
                    onToggleSelect={() => toggleSelection(order.id)}
                    onMouseDownSelect={(isSelected) =>
                      handleMouseDown(order.id, isSelected)
                    }
                    onMouseEnterRow={() => handleMouseEnter(order.id)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={totalItems}
          onPageChange={onPageChange}
          onItemsPerPageChange={onItemsPerPageChange}
        />
      </div>

      <ConfirmModal
        isOpen={confirmState.open}
        title={
          confirmState.mode === "bulk"
            ? `Eliminar ${selectedIds.size} órdenes`
            : "Eliminar orden de compra"
        }
        message={
          confirmState.mode === "bulk"
            ? `¿Está seguro de eliminar ${selectedIds.size} órdenes seleccionadas?`
            : "¿Está seguro de eliminar esta orden de compra?"
        }
        confirmLabel={
          confirmState.mode === "bulk"
            ? `Eliminar ${selectedIds.size} órdenes`
            : "Eliminar orden"
        }
        onConfirm={handleConfirmDelete}
        onCancel={closeConfirm}
        isProcessing={isConfirming}
        destructive
      />
    </>
  );
};
