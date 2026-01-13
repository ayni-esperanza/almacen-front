import React, { useEffect, useMemo, useState } from "react";
import { MovementEntry, MovementExit } from "../types/index.ts";
import { Pagination } from "../../../shared/components/Pagination";
import { useSelectableRowClick } from "../../../shared/hooks/useSelectableRowClick";
import { useBulkSelection } from "../../../shared/hooks/useBulkSelection";
import { useSort, SortColumnConfig } from "../../../shared/hooks/useSort";
import { ConfirmModal } from "../../../shared/components/ConfirmModal";
import {
  TrendingUp,
  TrendingDown,
  Search,
  Download,
  Plus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Calendar,
  Trash2,
  Filter,
  RefreshCw,
} from "lucide-react";

interface MovementTableProps {
  movements: (MovementEntry | MovementExit)[];
  type: "entrada" | "salida";
  onEditEntry?: (movement: MovementEntry) => void;
  onEditExit?: (movement: MovementExit) => void;
  onExportPdf?: () => void;
  onAddMovement?: () => void;
  onDataFiltered?: (data: (MovementEntry | MovementExit)[]) => void;
  startDate?: string;
  endDate?: string;
  onStartDateChange?: (date: string) => void;
  onEndDateChange?: (date: string) => void;
  deleteMovement: (id: number, type: "entrada" | "salida") => Promise<boolean>;
  refetchMovements?: () => Promise<void>;
  // Server-side pagination
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (limit: number) => void;
}

interface MovementRowProps {
  movement: MovementEntry | MovementExit;
  isEntry: boolean;
  onEditEntry?: (movement: MovementEntry) => void;
  onEditExit?: (movement: MovementExit) => void;
  isSelected: boolean;
  onToggleSelect: () => void;
  onMouseDownSelect: (isSelected: boolean) => void;
  onMouseEnterRow: () => void;
}

type SortKey = "fecha" | "area";

// Helper function to convert "DD/MM/YYYY" to a numeric timestamp
const parseDateString = (dateStr: string | undefined): number => {
  if (!dateStr) return 0;
  // If it comes as ISO (e.g., created_at), process normally
  if (dateStr.includes("T") || dateStr.includes("-")) {
    return new Date(dateStr).getTime();
  }
  // Process DD/MM/YYYY format
  const parts = dateStr.split("/");
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // JS months are 0-11
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day).getTime();
  }
  return 0;
};

const MovementRow: React.FC<MovementRowProps> = ({
  movement,
  isEntry,
  onEditEntry,
  onEditExit,
  isSelected,
  onToggleSelect,
  onMouseDownSelect,
  onMouseEnterRow,
}) => {
  const handleRowClick = useSelectableRowClick(() => {
    if (isEntry && onEditEntry) {
      onEditEntry(movement as MovementEntry);
    } else if (!isEntry && onEditExit) {
      onEditExit(movement as MovementExit);
    }
  });

  return (
    <tr
      onClick={handleRowClick}
      onMouseEnter={onMouseEnterRow}
      className="transition-colors border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 [&]:cursor-pointer [&]:select-text"
      style={{
        cursor:
          (isEntry && onEditEntry) || (!isEntry && onEditExit)
            ? "pointer"
            : "default",
      }}
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
          aria-label={`Seleccionar movimiento ${movement.codigoProducto}`}
          className="w-4 h-4 text-green-600 border-gray-300 rounded cursor-pointer focus:ring-2 focus:ring-green-500 dark:border-slate-600 dark:bg-slate-800"
        />
      </td>
      <td className="px-3 py-2 text-xs text-gray-700 select-text dark:text-slate-300">
        {movement.fecha}
      </td>
      <td className="px-3 py-2 text-xs font-medium text-gray-900 select-text dark:text-slate-100">
        {movement.codigoProducto}
      </td>
      {isEntry ? (
        <>
          <td className="px-3 py-2 text-xs text-gray-700 select-text dark:text-slate-300">
            {movement.descripcion}
          </td>
          <td className="px-3 py-2 text-xs text-gray-600 select-text dark:text-slate-400">
            {("categoria" in movement && movement.categoria) || "-"}
          </td>
          <td className="px-3 py-2 text-xs font-medium text-gray-900 select-text dark:text-slate-100">
            {movement.cantidad}
          </td>
          <td className="px-3 py-2 text-xs text-gray-600 select-text dark:text-slate-400">
            {movement.area || "-"}
          </td>
          <td className="px-3 py-2 text-xs font-medium text-green-600 select-text dark:text-emerald-400">
            S/ {movement.precioUnitario.toFixed(2)}
          </td>
        </>
      ) : (
        <>
          <td className="px-3 py-2 text-xs text-gray-700 select-text dark:text-slate-300">
            {movement.descripcion}
          </td>
          <td className="px-3 py-2 text-xs text-gray-600 select-text dark:text-slate-400">
            {("categoria" in movement && movement.categoria) || "-"}
          </td>
          <td className="px-3 py-2 text-xs text-gray-600 select-text dark:text-slate-400">
            {movement.area || "-"}
          </td>
          <td className="px-3 py-2 text-xs text-gray-600 select-text dark:text-slate-400">
            {"proyecto" in movement ? movement.proyecto || "-" : "-"}
          </td>
          <td className="px-3 py-2 text-xs text-gray-600 select-text dark:text-slate-400">
            {movement.responsable || "-"}
          </td>
          <td className="px-3 py-2 text-xs font-medium text-gray-900 select-text dark:text-slate-100">
            {movement.cantidad}
          </td>
        </>
      )}
    </tr>
  );
};

export const MovementTable: React.FC<MovementTableProps> = ({
  movements,
  type,
  onEditEntry,
  onEditExit,
  onExportPdf,
  onAddMovement,
  onDataFiltered,
  startDate = "",
  endDate = "",
  onStartDateChange,
  onEndDateChange,
  deleteMovement,
  refetchMovements,
  // Server-side pagination props
  currentPage,
  itemsPerPage,
  totalPages,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDateFilters, setShowDateFilters] = useState(false);

  const movementSortColumns = useMemo<
    Record<SortKey, SortColumnConfig<MovementEntry | MovementExit>>
  >(
    () => ({
      fecha: {
        selector: (movement: MovementEntry | MovementExit) => movement.fecha,
        comparator: (
          a: MovementEntry | MovementExit,
          b: MovementEntry | MovementExit
        ) => parseDateString(a.fecha) - parseDateString(b.fecha),
      },
      area: {
        selector: (movement: MovementEntry | MovementExit) =>
          movement.area ?? "",
        type: "string",
        locale: "es",
      },
    }),
    []
  );

  const { sortConfig, toggleSort, sortData } = useSort<
    MovementEntry | MovementExit,
    SortKey
  >({
    defaultKey: "fecha",
    defaultDirection: "desc",
    storageKey: "movementTableSortConfig",
    columns: movementSortColumns,
  });

  const getSortIcon = (columnKey: SortKey) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown className="w-3 h-3 text-gray-400 opacity-50" />;
    }
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="w-3 h-3 text-green-600 dark:text-green-400" />
    ) : (
      <ArrowDown className="w-3 h-3 text-green-600 dark:text-green-400" />
    );
  };

  const filteredAndSortedMovements = React.useMemo(() => {
    // Filter
    const filtered = movements.filter((movement) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        movement.codigoProducto.toLowerCase().includes(searchLower) ||
        movement.descripcion.toLowerCase().includes(searchLower) ||
        (movement.responsable &&
          movement.responsable.toLowerCase().includes(searchLower))
      );
    });

    // Sort
    return sortData(filtered);
  }, [movements, searchTerm, sortData]);

  useEffect(() => {
    if (onDataFiltered) {
      onDataFiltered(filteredAndSortedMovements);
    }
  }, [filteredAndSortedMovements, onDataFiltered]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const isEntry = type === "entrada";
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
  } = useBulkSelection<MovementEntry | MovementExit>({
    getId: (movement) => movement.id,
    deleteItem: (id) => deleteMovement(id, type),
    refetch: refetchMovements,
  });
  const gradientColor = isEntry
    ? "from-green-500 to-green-600 dark:from-green-600 dark:to-emerald-700"
    : "from-red-500 to-red-600 dark:from-red-600 dark:to-rose-700";
  const titleText = isEntry ? "Entradas de Productos" : "Salidas de Productos";
  const icon = isEntry ? (
    <TrendingUp className="w-6 h-6" />
  ) : (
    <TrendingDown className="w-6 h-6" />
  );

  return (
    <>
      <div
        className={`bg-gradient-to-r ${gradientColor} text-white py-3 px-4 sm:py-4 sm:px-6 shadow-sm`}
      >
        <div className="flex items-center space-x-2 sm:space-x-3">
          {icon}
          <h2 className="text-lg font-bold sm:text-xl">{titleText}</h2>
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
                    placeholder="Buscar por código, descripción o responsable..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full py-2 pl-10 pr-4 text-sm text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-emerald-400 dark:focus:ring-emerald-500/30"
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
                      <label className="text-sm font-medium text-gray-700 dark:text-slate-300 whitespace-nowrap">
                        Desde:
                      </label>
                      <div className="relative w-[160px]">
                        <Calendar
                          className="absolute w-4 h-4 text-green-500 transition-colors transform -translate-y-1/2 cursor-pointer left-3 top-1/2 dark:text-emerald-400 hover:text-green-600 dark:hover:text-emerald-300"
                          onClick={() => {
                            const input = document.getElementById(
                              "startDateInput"
                            ) as HTMLInputElement;
                            input?.showPicker?.();
                          }}
                        />
                        <input
                          id="startDateInput"
                          type="date"
                          value={startDate}
                          onChange={(e) => onStartDateChange?.(e.target.value)}
                          aria-label="Fecha de inicio del filtro"
                          className="w-[160px] py-2 pl-10 pr-3 text-sm text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-emerald-400 dark:focus:ring-emerald-500/30 [&::-webkit-calendar-picker-indicator]:hidden"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-slate-300 whitespace-nowrap">
                        Hasta:
                      </label>
                      <div className="relative w-[160px]">
                        <Calendar
                          className="absolute w-4 h-4 text-green-500 transition-colors transform -translate-y-1/2 cursor-pointer left-3 top-1/2 dark:text-emerald-400 hover:text-green-600 dark:hover:text-emerald-300"
                          onClick={() => {
                            const input = document.getElementById(
                              "endDateInput"
                            ) as HTMLInputElement;
                            input?.showPicker?.();
                          }}
                        />
                        <input
                          id="endDateInput"
                          type="date"
                          value={endDate}
                          onChange={(e) => onEndDateChange?.(e.target.value)}
                          aria-label="Fecha de fin del filtro"
                          className="w-[160px] py-2 pl-10 pr-3 text-sm text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-emerald-400 dark:focus:ring-emerald-500/30 [&::-webkit-calendar-picker-indicator]:hidden"
                        />
                      </div>
                    </div>

                    {(startDate || endDate) && (
                      <button
                        onClick={() => {
                          onStartDateChange?.("");
                          onEndDateChange?.("");
                        }}
                        className="p-2 text-gray-600 transition-colors border border-gray-300 rounded-lg hover:bg-gray-100 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-800"
                        aria-label="Limpiar fechas"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {onExportPdf && (
                  <button
                    onClick={onExportPdf}
                    aria-label="Descargar PDF"
                    className="flex items-center justify-center p-2 text-sm font-medium text-white transition-colors bg-green-500 rounded-lg shadow-md sm:px-3 sm:py-2 hover:bg-green-600 h-[36px]"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                {selectedIds.size > 0 && (
                  <button
                    onClick={requestBulkDelete}
                    className="flex items-center justify-center px-3 py-2 space-x-2 text-sm font-medium text-white transition-colors bg-red-500 rounded-lg shadow-md sm:px-4 hover:bg-red-600 whitespace-nowrap"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Eliminar ({selectedIds.size})</span>
                  </button>
                )}
                {onAddMovement && (
                  <button
                    onClick={onAddMovement}
                    className="flex items-center justify-center flex-1 px-3 py-2 space-x-2 text-sm font-medium text-center text-white transition-colors bg-green-500 rounded-lg shadow-md sm:flex-none sm:px-6 hover:bg-green-600 whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Agregar</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {filteredAndSortedMovements.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-slate-400">
            {isEntry ? (
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-slate-600" />
            ) : (
              <TrendingDown className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-slate-600" />
            )}
            <p>
              No se encontraron {isEntry ? "entradas" : "salidas"} con los
              filtros aplicados.
            </p>
          </div>
        ) : (
          <>
            <div
              key={`${sortConfig.key}-${sortConfig.direction}-${currentPage}-${itemsPerPage}-${searchTerm}-${startDate}-${endDate}`}
              className="overflow-x-auto md:overflow-visible fade-section"
            >
              <table className="min-w-[880px] w-full text-xs text-gray-700 dark:text-slate-200">
                <thead className="bg-gray-50 dark:bg-slate-900">
                  <tr className="border-b border-gray-200 dark:border-slate-800">
                    <th className="px-3 py-3 text-xs font-semibold text-center text-gray-700 shadow-sm bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={areAllVisibleSelected(
                          filteredAndSortedMovements
                        )}
                        onChange={() => toggleAll(filteredAndSortedMovements)}
                        aria-label="Seleccionar todos los movimientos visibles"
                        className="w-4 h-4 text-green-600 border-gray-300 rounded cursor-pointer focus:ring-2 focus:ring-green-500 dark:border-slate-600 dark:bg-slate-800"
                      />
                    </th>
                    <th
                      onClick={() => toggleSort("fecha")}
                      className="px-3 py-3 text-xs font-semibold text-left text-gray-700 transition-colors cursor-pointer select-none dark:bg-slate-900 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                    >
                      <div className="flex items-center gap-1">
                        Fecha
                        {getSortIcon("fecha")}
                      </div>
                    </th>
                    <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 dark:bg-slate-900 dark:text-slate-300">
                      Código
                    </th>
                    {isEntry ? (
                      <>
                        <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 dark:bg-slate-900 dark:text-slate-300">
                          Nombre
                        </th>
                        <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 dark:bg-slate-900 dark:text-slate-300">
                          Categoría
                        </th>
                        <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 dark:bg-slate-900 dark:text-slate-300">
                          Cantidad
                        </th>
                        <th
                          onClick={() => toggleSort("area")}
                          className="px-3 py-3 text-xs font-semibold text-left text-gray-700 transition-colors cursor-pointer select-none dark:bg-slate-900 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                        >
                          <div className="flex items-center gap-1">
                            Área
                            {getSortIcon("area")}
                          </div>
                        </th>
                        <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 dark:bg-slate-900 dark:text-slate-300">
                          Costo U.
                        </th>
                      </>
                    ) : (
                      <>
                        <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 dark:bg-slate-900 dark:text-slate-300">
                          Nombre
                        </th>
                        <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 dark:bg-slate-900 dark:text-slate-300">
                          Categoría
                        </th>
                        <th
                          onClick={() => toggleSort("area")}
                          className="px-3 py-3 text-xs font-semibold text-left text-gray-700 transition-colors cursor-pointer select-none dark:bg-slate-900 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                        >
                          <div className="flex items-center gap-1">
                            Área
                            {getSortIcon("area")}
                          </div>
                        </th>
                        <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 dark:bg-slate-900 dark:text-slate-300">
                          Proyecto
                        </th>
                        <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 dark:bg-slate-900 dark:text-slate-300">
                          Responsable
                        </th>
                        <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 dark:bg-slate-900 dark:text-slate-300">
                          Cantidad
                        </th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100 dark:divide-slate-800 dark:bg-slate-950">
                  {filteredAndSortedMovements.map((movement) => (
                    <MovementRow
                      key={movement.id}
                      movement={movement}
                      isEntry={isEntry}
                      onEditEntry={onEditEntry}
                      onEditExit={onEditExit}
                      isSelected={selectedIds.has(movement.id)}
                      onToggleSelect={() => toggleSelection(movement.id)}
                      onMouseDownSelect={(isSelectedRow) =>
                        handleMouseDown(movement.id, isSelectedRow)
                      }
                      onMouseEnterRow={() => handleMouseEnter(movement.id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={onPageChange}
              onItemsPerPageChange={onItemsPerPageChange}
            />
          </>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmState.open}
        title={
          confirmState.mode === "bulk"
            ? "Eliminar movimientos"
            : isEntry
            ? "Eliminar entrada"
            : "Eliminar salida"
        }
        message={
          confirmState.mode === "bulk"
            ? `¿Seguro que deseas eliminar ${selectedIds.size} movimiento(s)?`
            : `¿Seguro que deseas eliminar "${
                confirmState.target?.descripcion ?? ""
              }"?`
        }
        confirmLabel={
          confirmState.mode === "bulk" ? "Eliminar seleccionados" : "Eliminar"
        }
        onConfirm={handleConfirmDelete}
        onCancel={closeConfirm}
        isProcessing={isConfirming}
        destructive
      />
    </>
  );
};
