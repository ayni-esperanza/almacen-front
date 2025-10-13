import React from 'react';
import { MovementEntry, MovementExit } from '../types';
import { Pagination } from '../../../shared/components/Pagination';
import { TableWithFixedHeader } from '../../../shared/components/TableWithFixedHeader';
import { usePagination } from '../../../shared/hooks/usePagination';
import { TrendingUp, TrendingDown, Search, Plus, Minus } from 'lucide-react';

interface MovementTableProps {
  movements: (MovementEntry | MovementExit)[];
  type: 'entrada' | 'salida';
  onUpdateQuantity?: (id: string, newQuantity: number) => void;
}

export const MovementTable: React.FC<MovementTableProps> = ({ movements, type, onUpdateQuantity }) => {
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

  const handleQuantityChange = (id: number, delta: number) => {
    const movement = movements.find(m => m.id === id);
    if (movement && onUpdateQuantity) {
      const newQuantity = Math.max(1, movement.cantidad + delta);
      onUpdateQuantity(id.toString(), newQuantity);
    }
  };

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
            <th className="px-4 py-4 text-left font-semibold text-gray-700 bg-gray-50">Descripción</th>
            <th className="px-4 py-4 text-left font-semibold text-gray-700 bg-gray-50">Precio Unit.</th>
            <th className="px-4 py-4 text-left font-semibold text-gray-700 bg-gray-50">Cantidad</th>
            {!isEntry && <th className="px-4 py-4 text-left font-semibold text-gray-700 bg-gray-50">Responsable</th>}
            {!isEntry && <th className="px-4 py-4 text-left font-semibold text-gray-700 bg-gray-50">Área</th>}
            {!isEntry && <th className="px-4 py-4 text-left font-semibold text-gray-700 bg-gray-50">Proyecto</th>}
          </tr>
        </thead>
        <tbody>
          {paginatedMovements.map((movement) => (
            <tr
              key={movement.id}
              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <td className="px-4 py-4 text-gray-700">{movement.fecha}</td>
              <td className="px-4 py-4 font-medium text-gray-900">{movement.codigoProducto}</td>
              <td className="px-4 py-4 text-gray-700">{movement.descripcion}</td>
              <td className="px-4 py-4 font-medium text-green-600">S/ {movement.precioUnitario.toFixed(2)}</td>
              <td className="px-4 py-4 text-center">
                {!isEntry && onUpdateQuantity ? (
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => handleQuantityChange(movement.id, -1)}
                      className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      disabled={movement.cantidad <= 1}
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-medium min-w-[2rem] text-center">{movement.cantidad}</span>
                    <button
                      onClick={() => handleQuantityChange(movement.id, 1)}
                      className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <span className="font-medium">{movement.cantidad}</span>
                )}
              </td>
              {!isEntry && (
                <>
                  <td className="px-4 py-4 text-gray-600">{movement.responsable || '-'}</td>
                  <td className="px-4 py-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                      {movement.area || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-gray-600">
                    {'proyecto' in movement ? movement.proyecto || '-' : '-'}
                  </td>
                </>
              )}
            </tr>
          ))}
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
