import React from 'react';
import { MovementEntry, MovementExit } from '../types/index.ts';
import { Pagination } from '../../../shared/components/Pagination';
import { TableWithFixedHeader } from '../../../shared/components/TableWithFixedHeader';
import { usePagination } from '../../../shared/hooks/usePagination';
import { useSelectableRowClick } from '../../../shared/hooks/useSelectableRowClick';
import { TrendingUp, TrendingDown, Search } from 'lucide-react';

interface MovementTableProps {
  movements: (MovementEntry | MovementExit)[];
  type: 'entrada' | 'salida';
  onEditEntry?: (movement: MovementEntry) => void;
  onEditExit?: (movement: MovementExit) => void;
}

interface MovementRowProps {
  movement: MovementEntry | MovementExit;
  isEntry: boolean;
  onEditEntry?: (movement: MovementEntry) => void;
  onEditExit?: (movement: MovementExit) => void;
}

const MovementRow: React.FC<MovementRowProps> = ({ movement, isEntry, onEditEntry, onEditExit }) => {
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
      style={{ cursor: (isEntry && onEditEntry) || (!isEntry && onEditExit) ? 'pointer' : 'default', userSelect: 'text' }}
      className="border-b border-gray-100 transition-colors dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800"
    >
      <td className="px-4 py-4 text-gray-700 dark:text-slate-300 select-text">{movement.fecha}</td>
      <td className="px-4 py-4 font-medium text-gray-900 dark:text-slate-100 select-text">{movement.codigoProducto}</td>
      {isEntry ? (
        <>
          <td className="px-4 py-4 text-gray-700 dark:text-slate-300 select-text">{movement.descripcion}</td>
          <td className="px-4 py-4 font-medium text-gray-900 dark:text-slate-100 select-text">{movement.cantidad}</td>
          <td className="px-4 py-4 text-gray-600 dark:text-slate-400 select-text">{movement.area || '-'}</td>
          <td className="px-4 py-4 font-medium text-green-600 dark:text-emerald-400 select-text">S/ {movement.precioUnitario.toFixed(2)}</td>
        </>
      ) : (
        <>
          <td className="px-4 py-4 text-gray-700 dark:text-slate-300 select-text">{movement.descripcion}</td>
          <td className="px-4 py-4 text-gray-600 dark:text-slate-400 select-text">{movement.area || '-'}</td>
          <td className="px-4 py-4 text-gray-600 dark:text-slate-400 select-text">
            {'proyecto' in movement ? movement.proyecto || '-' : '-'}
          </td>
          <td className="px-4 py-4 text-gray-600 dark:text-slate-400 select-text">{movement.responsable || '-'}</td>
          <td className="px-4 py-4 font-medium text-gray-900 dark:text-slate-100 select-text">{movement.cantidad}</td>
        </>
      )}
    </tr>
  );
};

export const MovementTable: React.FC<MovementTableProps> = ({ movements, type, onEditEntry, onEditExit }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  
  const filteredMovements = movements.filter(movement =>
    movement.codigoProducto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    movement.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (movement.responsable && movement.responsable.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const {
    paginatedData: paginatedMovements,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    handlePageChange,
    handleItemsPerPageChange,
  } = usePagination({ data: filteredMovements, initialItemsPerPage: 15 });

  const isEntry = type === 'entrada';
  const gradientColor = isEntry ? 'from-green-500 to-green-600 dark:from-green-600 dark:to-emerald-700' : 'from-red-500 to-red-600 dark:from-red-600 dark:to-rose-700';
  const titleText = isEntry ? 'Entradas de Productos' : 'Salidas de Productos';
  const icon = isEntry ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />;

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-lg dark:bg-slate-900 dark:border dark:border-slate-700">
      <div className={`bg-gradient-to-r ${gradientColor} text-white py-4 px-6`}>
        <div className="flex items-center space-x-3">
          {icon}
          <h2 className="text-xl font-bold">{titleText}</h2>
        </div>
      </div>
      
      {/* Search Filter */}
      <div className="border-b bg-gray-50 p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400 dark:text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por código, descripción o responsable..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:ring-emerald-500"
          />
        </div>
      </div>
      
      <TableWithFixedHeader maxHeight="600px">
        <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-slate-900">
          <tr className="border-b border-gray-200 dark:border-slate-700">
            <th className="bg-gray-50 px-4 py-4 text-left font-semibold text-gray-700 dark:bg-slate-900 dark:text-slate-200">Fecha</th>
            <th className="bg-gray-50 px-4 py-4 text-left font-semibold text-gray-700 dark:bg-slate-900 dark:text-slate-200">Código</th>
            {isEntry ? (
              <>
                <th className="bg-gray-50 px-4 py-4 text-left font-semibold text-gray-700 dark:bg-slate-900 dark:text-slate-200">Nombre</th>
                <th className="bg-gray-50 px-4 py-4 text-left font-semibold text-gray-700 dark:bg-slate-900 dark:text-slate-200">Cantidad</th>
                <th className="bg-gray-50 px-4 py-4 text-left font-semibold text-gray-700 dark:bg-slate-900 dark:text-slate-200">Área</th>
                <th className="bg-gray-50 px-4 py-4 text-left font-semibold text-gray-700 dark:bg-slate-900 dark:text-slate-200">Costo U.</th>
              </>
            ) : (
              <>
                <th className="bg-gray-50 px-4 py-4 text-left font-semibold text-gray-700 dark:bg-slate-900 dark:text-slate-200">Nombre</th>
                <th className="bg-gray-50 px-4 py-4 text-left font-semibold text-gray-700 dark:bg-slate-900 dark:text-slate-200">Área</th>
                <th className="bg-gray-50 px-4 py-4 text-left font-semibold text-gray-700 dark:bg-slate-900 dark:text-slate-200">Proyecto</th>
                <th className="bg-gray-50 px-4 py-4 text-left font-semibold text-gray-700 dark:bg-slate-900 dark:text-slate-200">Responsable</th>
                <th className="bg-gray-50 px-4 py-4 text-left font-semibold text-gray-700 dark:bg-slate-900 dark:text-slate-200">Cantidad</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {paginatedMovements.length === 0 ? (
            <tr>
              <td
                colSpan={isEntry ? 6 : 7}
                className="px-4 py-10 text-center text-sm text-gray-500 dark:text-slate-400"
              >
                No se encontraron {isEntry ? 'entradas' : 'salidas'} con los filtros aplicados.
              </td>
            </tr>
          ) : (
            paginatedMovements.map((movement) => (
              <MovementRow
                key={movement.id}
                movement={movement}
                isEntry={isEntry}
                onEditEntry={onEditEntry}
                onEditExit={onEditExit}
              />
            ))
          )}
        </tbody>
      </TableWithFixedHeader>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />
    </div>
  );
};
