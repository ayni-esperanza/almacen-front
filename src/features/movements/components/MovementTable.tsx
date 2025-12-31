import React, { useEffect, useState } from "react";
import { MovementEntry, MovementExit } from "../types/index.ts";
import { Pagination } from "../../../shared/components/Pagination";
import { usePagination } from "../../../shared/hooks/usePagination";
import { useSelectableRowClick } from "../../../shared/hooks/useSelectableRowClick";
import {
  TrendingUp,
  TrendingDown,
  Search,
  Download,
  Plus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

interface MovementTableProps {
  movements: (MovementEntry | MovementExit)[];
  type: "entrada" | "salida";
  onEditEntry?: (movement: MovementEntry) => void;
  onEditExit?: (movement: MovementExit) => void;
  onExportPdf?: () => void;
  onAddMovement?: () => void;
  onDataFiltered?: (data: (MovementEntry | MovementExit)[]) => void;
}

interface MovementRowProps {
  movement: MovementEntry | MovementExit;
  isEntry: boolean;
  onEditEntry?: (movement: MovementEntry) => void;
  onEditExit?: (movement: MovementExit) => void;
}

type SortKey = "fecha" | "area";
type SortDirection = "asc" | "desc";

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

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
      style={{
        cursor:
          (isEntry && onEditEntry) || (!isEntry && onEditExit)
            ? "pointer"
            : "default",
        userSelect: "text",
      }}
      className="transition-colors border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800"
    >
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
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const [sortConfig, setSortConfig] = useState<SortConfig>(() => {
    try {
      const saved = localStorage.getItem("movementTableSortConfig");
      return saved ? JSON.parse(saved) : { key: "fecha", direction: "desc" };
    } catch {
      return { key: "fecha", direction: "desc" };
    }
  });

  useEffect(() => {
    localStorage.setItem("movementTableSortConfig", JSON.stringify(sortConfig));
  }, [sortConfig]);

  const handleSort = (key: SortKey) => {
    setSortConfig((current) => {
      if (current.key === key) {
        return {
          key,
          direction: current.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  };

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
    return filtered.sort((a, b) => {
      if (sortConfig.key === "area") {
        const areaA = (a.area || "").toLowerCase();
        const areaB = (b.area || "").toLowerCase();

        if (areaA < areaB) return sortConfig.direction === "asc" ? -1 : 1;
        if (areaA > areaB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      }

      // Use parseDateString function to read "20/08/2025" correctly
      const dateA = parseDateString(a.fecha);
      const dateB = parseDateString(b.fecha);

      return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
    });
  }, [movements, searchTerm, sortConfig]);

  const {
    paginatedData: paginatedMovements,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    handlePageChange,
    handleItemsPerPageChange,
  } = usePagination({
    data: filteredAndSortedMovements,
    initialItemsPerPage: 100,
  });

  // Notify parent component whenever paginatedMovements changes
  // This must be placed AFTER usePagination
  useEffect(() => {
    if (onDataFiltered) {
      // Send ONLY what is visible in the current table page
      onDataFiltered(paginatedMovements);
    }
  }, [paginatedMovements, onDataFiltered]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const isEntry = type === "entrada";
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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center flex-1 w-full gap-2 sm:gap-3">
              <div className="relative flex-1 sm:max-w-md">
                <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2 sm:w-5 sm:h-5 dark:text-slate-500" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full py-2 pl-10 pr-4 text-sm text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-emerald-400 dark:focus:ring-emerald-500/30"
                />
              </div>
              {onExportPdf && (
                <button
                  onClick={onExportPdf}
                  className="flex items-center justify-center px-3 py-2 space-x-2 text-sm font-medium text-white transition-colors bg-green-500 rounded-lg shadow-md sm:px-4 hover:bg-green-600 whitespace-nowrap"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Exportar PDF</span>
                  <span className="sm:hidden">PDF</span>
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              {onAddMovement && (
                <button
                  onClick={onAddMovement}
                  className="flex items-center justify-center flex-1 px-3 py-2 space-x-2 text-sm font-medium text-white transition-colors bg-green-500 rounded-lg shadow-md sm:flex-none sm:px-6 hover:bg-green-600 whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {paginatedMovements.length === 0 ? (
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
            <div className="overflow-x-auto md:overflow-visible">
              <table className="min-w-[880px] w-full text-xs text-gray-700 dark:text-slate-200">
                <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-slate-900">
                  <tr className="border-b border-gray-200 dark:border-slate-800">
                    <th
                      onClick={() => handleSort("fecha")}
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
                          Cantidad
                        </th>
                        <th
                          onClick={() => handleSort("area")}
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
                        <th
                          onClick={() => handleSort("area")}
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
                  {paginatedMovements.map((movement) => (
                    <MovementRow
                      key={movement.id}
                      movement={movement}
                      isEntry={isEntry}
                      onEditEntry={onEditEntry}
                      onEditExit={onEditExit}
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
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </>
        )}
      </div>
    </>
  );
};
