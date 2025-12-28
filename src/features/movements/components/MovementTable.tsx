import React from "react";
import { MovementEntry, MovementExit } from "../types/index.ts";
import { Pagination } from "../../../shared/components/Pagination";
import { usePagination } from "../../../shared/hooks/usePagination";
import { useSelectableRowClick } from "../../../shared/hooks/useSelectableRowClick";
import { TrendingUp, TrendingDown, Search, Download, Plus } from "lucide-react";

interface MovementTableProps {
  movements: (MovementEntry | MovementExit)[];
  type: "entrada" | "salida";
  onEditEntry?: (movement: MovementEntry) => void;
  onEditExit?: (movement: MovementExit) => void;
  onExportPdf?: () => void;
  onAddMovement?: () => void;
}

interface MovementRowProps {
  movement: MovementEntry | MovementExit;
  isEntry: boolean;
  onEditEntry?: (movement: MovementEntry) => void;
  onEditExit?: (movement: MovementExit) => void;
}

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
      className="border-b border-gray-100 transition-colors dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800"
    >
      <td className="px-3 py-2 text-xs text-gray-700 dark:text-slate-300 select-text">
        {movement.fecha}
      </td>
      <td className="px-3 py-2 text-xs font-medium text-gray-900 dark:text-slate-100 select-text">
        {movement.codigoProducto}
      </td>
      {isEntry ? (
        <>
          <td className="px-3 py-2 text-xs text-gray-700 dark:text-slate-300 select-text">
            {movement.descripcion}
          </td>
          <td className="px-3 py-2 text-xs font-medium text-gray-900 dark:text-slate-100 select-text">
            {movement.cantidad}
          </td>
          <td className="px-3 py-2 text-xs text-gray-600 dark:text-slate-400 select-text">
            {movement.area || "-"}
          </td>
          <td className="px-3 py-2 text-xs font-medium text-green-600 dark:text-emerald-400 select-text">
            S/ {movement.precioUnitario.toFixed(2)}
          </td>
        </>
      ) : (
        <>
          <td className="px-3 py-2 text-xs text-gray-700 dark:text-slate-300 select-text">
            {movement.descripcion}
          </td>
          <td className="px-3 py-2 text-xs text-gray-600 dark:text-slate-400 select-text">
            {movement.area || "-"}
          </td>
          <td className="px-3 py-2 text-xs text-gray-600 dark:text-slate-400 select-text">
            {"proyecto" in movement ? movement.proyecto || "-" : "-"}
          </td>
          <td className="px-3 py-2 text-xs text-gray-600 dark:text-slate-400 select-text">
            {movement.responsable || "-"}
          </td>
          <td className="px-3 py-2 text-xs font-medium text-gray-900 dark:text-slate-100 select-text">
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
}) => {
  const [searchTerm, setSearchTerm] = React.useState("");

  // SOLUCIÓN: Usar useMemo para evitar recálculos innecesarios
  const filteredMovements = React.useMemo(
    () =>
      movements.filter(
        (movement) =>
          movement.codigoProducto
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          movement.descripcion
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (movement.responsable &&
            movement.responsable
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
      ),
    [movements, searchTerm] // Solo recalcular cuando movements o searchTerm cambien
  );

  const {
    paginatedData: paginatedMovements,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    handlePageChange,
    handleItemsPerPageChange,
  } = usePagination({
    data: filteredMovements,
    initialItemsPerPage: 100,
  });

  // SOLUCIÓN: Manejar el cambio de búsqueda de manera controlada
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
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
    <div className="flex flex-col bg-white border border-transparent shadow-lg rounded-xl dark:border-slate-800 dark:bg-slate-950">
      {/* Header de la tabla - Responsive */}
      <div className={`flex-shrink-0 bg-gradient-to-r ${gradientColor} text-white py-3 px-4 sm:py-4 sm:px-6 rounded-t-xl`}>
        <div className="flex items-center space-x-2 sm:space-x-3">
          {icon}
          <h2 className="text-lg font-bold sm:text-xl">{titleText}</h2>
        </div>
      </div>

      {/* Search Filter - Responsive */}
      <div className="flex-shrink-0 p-3 bg-white border-b border-gray-200/70 sm:p-4 dark:border-slate-800/70 dark:bg-slate-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 w-full sm:max-w-md">
            <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2 sm:w-5 sm:h-5 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-emerald-400 dark:focus:ring-emerald-500/30"
            />
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
            {onExportPdf && (
              <button
                onClick={onExportPdf}
                className="flex items-center justify-center flex-1 px-3 py-2 space-x-2 text-sm font-medium text-white transition-colors bg-green-500 rounded-lg shadow-md sm:flex-none sm:px-6 hover:bg-green-600 whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Exportar PDF</span>
                <span className="sm:hidden">PDF</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {paginatedMovements.length === 0 ? (
        <div className="p-8 text-center text-gray-500 dark:text-slate-400">
          {isEntry ? <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-slate-600" /> : <TrendingDown className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-slate-600" />}
          <p>
            No se encontraron {isEntry ? "entradas" : "salidas"} con los filtros aplicados.
          </p>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-auto" style={{ maxHeight: '600px' }}>
            <table className="w-full text-xs text-gray-700 dark:text-slate-200">
              <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-slate-950">
                <tr className="border-b border-gray-200 dark:border-slate-800">
                  <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                    Fecha
                  </th>
                  <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                    Código
                  </th>
                  {isEntry ? (
                    <>
                      <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                        Nombre
                      </th>
                      <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                        Cantidad
                      </th>
                      <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                        Área
                      </th>
                      <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                        Costo U.
                      </th>
                    </>
                  ) : (
                    <>
                      <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                        Nombre
                      </th>
                      <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                        Área
                      </th>
                      <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                        Proyecto
                      </th>
                      <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                        Responsable
                      </th>
                      <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                        Cantidad
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
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

          <div className="flex-shrink-0">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </div>
        </>
      )}
    </div>
  );
};
