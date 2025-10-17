import React from 'react';
import { MovementEntry, MovementExit } from '../types/index.ts';
import { Pagination } from '../../../shared/components/Pagination';
import { TableWithFixedHeader } from '../../../shared/components/TableWithFixedHeader';
import { usePagination } from '../../../shared/hooks/usePagination';
import { TrendingUp, TrendingDown, Search } from 'lucide-react';

interface MovementTableProps {
  movements: (MovementEntry | MovementExit)[];
  type: 'entrada' | 'salida';
  onEditEntry?: (movement: MovementEntry) => void;
  onEditExit?: (movement: MovementExit) => void;
}

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
  const gradientColor = isEntry ? 'from-green-500 to-green-600' : 'from-red-500 to-red-600';
  const titleText = isEntry ? 'Entradas de Productos' : 'Salidas de Productos';
  const icon = isEntry ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className={`bg-gradient-to-r ${gradientColor} text-white py-4 px-6`}>
        <div className="flex items-center space-x-3">
          {icon}
          <h2 className="text-xl font-bold">{titleText}</h2>
        </div>
      </div>
      
      {/* Search Filter */}
      <div className="p-4 bg-gray-50 border-b">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por código, descripción o responsable..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>
      
      <TableWithFixedHeader maxHeight="600px">
        <thead className="bg-gray-50 sticky top-0 z-10">
          <tr className="border-b border-gray-200">
            <th className="px-4 py-4 text-left font-semibold text-gray-700 bg-gray-50">Fecha</th>
            <th className="px-4 py-4 text-left font-semibold text-gray-700 bg-gray-50">Código</th>
            {isEntry ? (
              <>
                <th className="px-4 py-4 text-left font-semibold text-gray-700 bg-gray-50">Nombre</th>
                <th className="px-4 py-4 text-left font-semibold text-gray-700 bg-gray-50">Cantidad</th>
                <th className="px-4 py-4 text-left font-semibold text-gray-700 bg-gray-50">Área</th>
                <th className="px-4 py-4 text-left font-semibold text-gray-700 bg-gray-50">Costo U.</th>
              </>
            ) : (
              <>
                <th className="px-4 py-4 text-left font-semibold text-gray-700 bg-gray-50">Nombre</th>
                <th className="px-4 py-4 text-left font-semibold text-gray-700 bg-gray-50">Área</th>
                <th className="px-4 py-4 text-left font-semibold text-gray-700 bg-gray-50">Proyecto</th>
                <th className="px-4 py-4 text-left font-semibold text-gray-700 bg-gray-50">Responsable</th>
                <th className="px-4 py-4 text-left font-semibold text-gray-700 bg-gray-50">Cantidad</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {paginatedMovements.length === 0 ? (
            <tr>
              <td
                colSpan={isEntry ? 6 : 7}
                className="px-4 py-10 text-center text-sm text-gray-500"
              >
                No se encontraron {isEntry ? 'entradas' : 'salidas'} con los filtros aplicados.
              </td>
            </tr>
          ) : (
            paginatedMovements.map((movement) => (
              <tr
                key={movement.id}
                onClick={() => {
                  if (isEntry && onEditEntry) {
                    onEditEntry(movement as MovementEntry);
                  } else if (!isEntry && onEditExit) {
                    onEditExit(movement as MovementExit);
                  }
                }}
                className={`border-b border-gray-100 transition-colors ${
                  (isEntry && onEditEntry) || (!isEntry && onEditExit)
                    ? 'cursor-pointer hover:bg-gray-50'
                    : 'hover:bg-gray-50'
                }`}
              >
                <td className="px-4 py-4 text-gray-700">{movement.fecha}</td>
                <td className="px-4 py-4 font-medium text-gray-900">{movement.codigoProducto}</td>
                {isEntry ? (
                  <>
                    <td className="px-4 py-4 text-gray-700">{movement.descripcion}</td>
                    <td className="px-4 py-4 font-medium text-gray-900">{movement.cantidad}</td>
                    <td className="px-4 py-4 text-gray-600">{movement.area || '-'}</td>
                    <td className="px-4 py-4 font-medium text-green-600">S/ {movement.precioUnitario.toFixed(2)}</td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-4 text-gray-700">{movement.descripcion}</td>
                    <td className="px-4 py-4 text-gray-600">{movement.area || '-'}</td>
                    <td className="px-4 py-4 text-gray-600">
                      {'proyecto' in movement ? movement.proyecto || '-' : '-'}
                    </td>
                    <td className="px-4 py-4 text-gray-600">{movement.responsable || '-'}</td>
                    <td className="px-4 py-4 font-medium text-gray-900">{movement.cantidad}</td>
                  </>
                )}
              </tr>
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
