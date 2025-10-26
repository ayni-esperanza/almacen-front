import React from "react";
import { Product } from "../types";
import { ProductTableRow } from "./ProductTableRow";
import { Pagination } from "../../../shared/components/Pagination";
import { TableWithFixedHeader } from "../../../shared/components/TableWithFixedHeader";
import { usePagination } from "../../../shared/hooks/usePagination";
import { Package, Search, AlertCircle } from "lucide-react";
import InventoryDashboard from "./InventoryDashboard";
import { UpdateProductData } from "../../../shared/services/inventory.service";

interface ProductTableProps {
  products: Product[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  refetch: () => Promise<void>;
  updateProduct: (
    id: number,
    productData: UpdateProductData
  ) => Promise<Product | null>;
  areas: string[];
  categorias: string[];
  createArea: (name: string) => Promise<void>;
  createCategoria: (name: string) => Promise<void>;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  loading,
  error,
  searchTerm,
  setSearchTerm,
  refetch,
  updateProduct,
  areas,
  categorias,
  createArea,
  createCategoria,
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
  const searchInputClasses =
    "w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-emerald-400 dark:focus:ring-emerald-500/30";
  if (loading) {
    return (
      <div className="overflow-hidden bg-white border border-transparent shadow-lg rounded-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="px-6 py-4 text-white bg-gradient-to-r from-green-500 to-green-600">
          <div className="flex items-center space-x-3">
            <Package className="w-6 h-6" />
            <h2 className="text-xl font-bold">Inventario de Productos</h2>
          </div>
        </div>
        <div className="p-8 text-center">
          <div className="w-12 h-12 mx-auto border-b-2 border-green-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 dark:text-slate-300">
            Cargando productos...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="overflow-hidden bg-white border border-transparent shadow-lg rounded-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="px-6 py-4 text-white bg-gradient-to-r from-green-500 to-green-600">
          <div className="flex items-center space-x-3">
            <Package className="w-6 h-6" />
            <h2 className="text-xl font-bold">Inventario de Productos</h2>
          </div>
        </div>
        <div className="p-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <p className="mb-4 text-red-600 dark:text-rose-300">{error}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-white border border-transparent shadow-lg rounded-xl dark:border-slate-800 dark:bg-slate-950">
      <div className="px-6 py-4 text-white bg-gradient-to-r from-green-500 to-green-600">
        <div className="flex items-center space-x-3">
          <Package className="w-6 h-6" />
          <h2 className="text-xl font-bold">Inventario de Productos</h2>
        </div>
      </div>
      <InventoryDashboard />
      {/* Search Filter */}
      <div className="p-4 border-b border-gray-200/70 bg-gray-50 dark:border-slate-800/70 dark:bg-slate-950/80">
        <div className="relative max-w-md">
          <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2 dark:text-slate-500" />
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
          <Package className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-slate-600" />
          <p>No se encontraron productos</p>
        </div>
      ) : (
        <>
          <TableWithFixedHeader maxHeight="600px">
            <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-slate-950">
              <tr className="border-b border-gray-200 dark:border-slate-800">
                <th className="px-4 py-4 font-semibold text-left text-gray-700 bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                  Código
                </th>
                <th className="px-4 py-4 font-semibold text-left text-gray-700 bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                  Nombre
                </th>
                <th className="px-4 py-4 font-semibold text-left text-gray-700 bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                  Ubicación
                </th>
                <th className="px-4 py-4 font-semibold text-left text-gray-700 bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                  Salidas
                </th>
                <th className="px-4 py-4 font-semibold text-left text-gray-700 bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                  Stock Actual
                </th>
                <th className="px-4 py-4 font-semibold text-left text-gray-700 bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                  Unidad
                </th>
                <th className="px-4 py-4 font-semibold text-left text-gray-700 bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                  Proveedor
                </th>
                <th className="px-4 py-4 font-semibold text-left text-gray-700 bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                  Marca
                </th>
                <th className="px-4 py-4 font-semibold text-left text-gray-700 bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                  Categoría
                </th>
                <th className="px-4 py-4 font-semibold text-left text-gray-700 bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                  Costo Unitario
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map((product) => (
                <ProductTableRow
                  key={product.id}
                  product={product}
                  onEdit={updateProduct}
                  areas={areas}
                  categorias={categorias}
                  onCreateArea={createArea}
                  onCreateCategoria={createCategoria}
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
