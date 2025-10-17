import React from 'react';
import { Product } from '../types';
import { ProductTableRow } from './ProductTableRow';
import { Pagination } from '../../../shared/components/Pagination';
import { TableWithFixedHeader } from '../../../shared/components/TableWithFixedHeader';
import { usePagination } from '../../../shared/hooks/usePagination';
import { Package, Search, AlertCircle } from 'lucide-react';
import InventoryDashboard from './InventoryDashboard';

interface ProductTableProps {
  products: Product[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  refetch: () => Promise<void>;
}

export const ProductTable: React.FC<ProductTableProps> = ({ 
  products, 
  loading, 
  error, 
  searchTerm, 
  setSearchTerm,
  refetch
}) => {
  const {
    paginatedData: paginatedProducts,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    handlePageChange,
    handleItemsPerPageChange,
  } = usePagination({ data: products, initialItemsPerPage: 15 });
  const searchInputClasses = 'w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-emerald-400 dark:focus:ring-emerald-500/30';
  if (loading) {
    return (
  <div className="overflow-hidden rounded-xl border border-transparent bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900">
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6">
          <div className="flex items-center space-x-3">
            <Package className="w-6 h-6" />
            <h2 className="text-xl font-bold">Inventario de Productos</h2>
          </div>
        </div>
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-slate-300">Cargando productos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
  <div className="overflow-hidden rounded-xl border border-transparent bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900">
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6">
          <div className="flex items-center space-x-3">
            <Package className="w-6 h-6" />
            <h2 className="text-xl font-bold">Inventario de Productos</h2>
          </div>
        </div>
        <div className="p-8 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <p className="mb-4 text-red-600 dark:text-rose-300">{error}</p>
          <button
            onClick={refetch}
            className="rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
  <div className="overflow-hidden rounded-xl border border-transparent bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900">
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6">
        <div className="flex items-center space-x-3">
          <Package className="w-6 h-6" />
          <h2 className="text-xl font-bold">Inventario de Productos</h2>
        </div>
      </div>
      <InventoryDashboard />
      {/* Search Filter */}
      <div className="border-b border-gray-200 bg-gray-50 p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por código, descripción o proveedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={searchInputClasses}
          />
        </div>
      </div>
      
      {products.length === 0 ? (
        <div className="p-8 text-center text-gray-500 dark:text-slate-400">
          <Package className="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-slate-600" />
          <p>No se encontraron productos</p>
        </div>
      ) : (
        <>
          <TableWithFixedHeader maxHeight="600px">
            <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-slate-900">
              <tr className="border-b border-gray-200">
                <th className="bg-gray-50 px-4 py-4 text-left font-semibold text-gray-700 dark:bg-slate-900 dark:text-slate-300">Código</th>
                <th className="bg-gray-50 px-4 py-4 text-left font-semibold text-gray-700 dark:bg-slate-900 dark:text-slate-300">Nombre</th>
                <th className="bg-gray-50 px-4 py-4 text-left font-semibold text-gray-700 dark:bg-slate-900 dark:text-slate-300">Ubicación</th>
                <th className="bg-gray-50 px-4 py-4 text-left font-semibold text-gray-700 dark:bg-slate-900 dark:text-slate-300">Salidas</th>
                <th className="bg-gray-50 px-4 py-4 text-left font-semibold text-gray-700 dark:bg-slate-900 dark:text-slate-300">Stock Actual</th>
                <th className="bg-gray-50 px-4 py-4 text-left font-semibold text-gray-700 dark:bg-slate-900 dark:text-slate-300">Unidad</th>
                <th className="bg-gray-50 px-4 py-4 text-left font-semibold text-gray-700 dark:bg-slate-900 dark:text-slate-300">Proveedor</th>
                <th className="bg-gray-50 px-4 py-4 text-left font-semibold text-gray-700 dark:bg-slate-900 dark:text-slate-300">Marca</th>
                <th className="bg-gray-50 px-4 py-4 text-left font-semibold text-gray-700 dark:bg-slate-900 dark:text-slate-300">Categoría</th>
                <th className="bg-gray-50 px-4 py-4 text-left font-semibold text-gray-700 dark:bg-slate-900 dark:text-slate-300">Costo Unitario</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map((product) => (
                <ProductTableRow
                  key={product.id}
                  product={product}
                  onEdit={refetch}
                />
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
        </>
      )}
    </div>
  );
};
