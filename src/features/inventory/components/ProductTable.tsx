import React, { useMemo } from "react";
import { Product } from "../types";
import { ProductTableRow } from "./ProductTableRow";
import { Pagination } from "../../../shared/components/Pagination";
import {
  Package,
  Search,
  AlertCircle,
  Plus,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { ConfirmModal } from "../../../shared/components/ConfirmModal";
import { UpdateProductData } from "../../../shared/services/inventory.service";
import { useBulkSelection } from "../../../shared/hooks/useBulkSelection";
import { useSort, SortColumnConfig } from "../../../shared/hooks/useSort";

interface ProductTableProps {
  products: Product[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  searchTerm: string;
  filterEPP: boolean;
  setFilterEPP: (filter: boolean) => void;
  setSearchTerm: (term: string) => void;
  refetch: () => Promise<void>;
  updateProduct: (
    id: number,
    productData: UpdateProductData
  ) => Promise<Product | null>;
  deleteProduct: (id: number) => Promise<boolean>;
  createArea: (name: string) => Promise<void>;
  createCategoria: (name: string) => Promise<void>;
  onAddProduct?: () => void;
  // Pagination props
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  loading,
  refreshing,
  error,
  searchTerm,
  filterEPP,
  setFilterEPP,
  setSearchTerm,
  refetch,
  updateProduct,
  deleteProduct,
  createArea,
  createCategoria,
  onAddProduct,
  page,
  limit,
  totalPages,
  totalItems,
  setPage,
  setLimit,
}) => {
  type SortKey = "nombre";

  const productSortColumns = useMemo<
    Record<SortKey, SortColumnConfig<Product>>
  >(
    () => ({
      nombre: {
        selector: (product: Product) => product.nombre,
        type: "string",
        locale: "es",
      },
    }),
    []
  );

  const { sortConfig, toggleSort, sortData } = useSort<Product, SortKey>({
    defaultKey: "nombre",
    defaultDirection: "asc",
    storageKey: "productTableSortConfig",
    columns: productSortColumns,
  });

  const getNameSortIcon = () => {
    if (sortConfig.key !== "nombre") {
      return <ArrowUpDown className="w-3 h-3 text-gray-400 opacity-50" />;
    }
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="w-3 h-3 text-green-600 dark:text-green-400" />
    ) : (
      <ArrowDown className="w-3 h-3 text-green-600 dark:text-green-400" />
    );
  };

  const {
    selectedIds,
    toggleSelection,
    toggleAll,
    handleMouseDown,
    handleMouseEnter,
    areAllVisibleSelected,
    requestBulkDelete,
    requestSingleDelete,
    handleConfirmDelete,
    confirmState,
    closeConfirm,
    isConfirming,
    isRefreshing,
  } = useBulkSelection<Product>({
    getId: (product) => product.id,
    deleteItem: deleteProduct,
    refetch,
  });

  // Ordenar productos localmente (filtrado y paginación se hace en backend)
  const sortedProducts = React.useMemo(() => {
    return sortData(products);
  }, [products, sortData]);
  const searchInputClasses =
    "w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-emerald-400 dark:focus:ring-emerald-500/30";
  if (loading && !isRefreshing && !refreshing) {
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
    <>
      {/* Header - sticky */}
      <div className="px-6 py-4 text-white shadow-sm bg-gradient-to-r from-green-500 to-green-600">
        <div className="flex items-center space-x-3">
          <Package className="w-6 h-6" />
          <h2 className="text-xl font-bold">Inventario de Productos</h2>
        </div>
      </div>

      {/* Filters + Table Container */}
      <div className="flex flex-col bg-white border border-transparent shadow-lg dark:border-slate-800 dark:bg-slate-950">
        {/* Search Filter sticky */}
        <div className="sticky top-[109px] z-30 p-4 bg-white border-b border-gray-200/70 dark:border-slate-800/70 dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center flex-1 gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2 dark:text-slate-500" />
                <input
                  type="text"
                  placeholder="Buscar por código, descripción o proveedor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={searchInputClasses}
                />
              </div>
              <button
                onClick={() => setFilterEPP(!filterEPP)}
                className={`flex items-center flex-shrink-0 px-4 py-2 font-medium transition-all rounded-lg shadow-md whitespace-nowrap ${
                  filterEPP
                    ? "bg-green-500 text-white hover:bg-green-600"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                <span>EPP</span>
              </button>
            </div>
            <div className="flex items-center gap-3">
              {selectedIds.size > 0 && (
                <button
                  onClick={() => requestBulkDelete()}
                  className="flex items-center flex-shrink-0 px-4 py-2 space-x-2 font-medium text-white transition-colors bg-red-500 rounded-lg shadow-md hover:bg-red-600 whitespace-nowrap"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Eliminar ({selectedIds.size})</span>
                </button>
              )}
              {onAddProduct && (
                <button
                  onClick={onAddProduct}
                  className="flex items-center flex-shrink-0 px-6 py-2 space-x-2 font-medium text-white transition-colors bg-green-500 rounded-lg shadow-md hover:bg-green-600 whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar Producto</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Contenido scrolleable */}
        {sortedProducts.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-slate-400">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-slate-600" />
            <p>{"No se encontraron productos"}</p>
          </div>
        ) : (
          <>
            <div
              key={`${sortConfig.key}-${sortConfig.direction}-${page}-${limit}-${searchTerm}`}
              className="overflow-x-auto md:overflow-visible fade-section"
            >
              <table className="min-w-[960px] w-full text-xs text-gray-700 dark:text-slate-200">
                {/* Header de tabla */}
                <thead className="bg-gray-50 dark:bg-slate-900">
                  <tr className="border-b border-gray-200 dark:border-slate-800">
                    <th className="px-3 py-3 text-xs font-semibold text-center text-gray-700 shadow-sm bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={areAllVisibleSelected(sortedProducts)}
                        onChange={() => toggleAll(sortedProducts)}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded cursor-pointer focus:ring-2 focus:ring-green-500 dark:border-slate-600 dark:bg-slate-800"
                      />
                    </th>
                    <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 shadow-sm bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                      Código
                    </th>
                    <th
                      onClick={() => toggleSort("nombre")}
                      className="px-3 py-3 text-xs font-semibold text-left text-gray-700 transition-colors shadow-sm cursor-pointer select-none bg-gray-50 dark:bg-slate-900 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                    >
                      <span className="inline-flex items-center gap-1">
                        Nombre
                        {getNameSortIcon()}
                      </span>
                    </th>
                    <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 shadow-sm bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                      Ubicación
                    </th>
                    <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 shadow-sm bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                      Salidas
                    </th>
                    <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 shadow-sm bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                      Stock Actual
                    </th>
                    <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 shadow-sm bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                      Unidad
                    </th>
                    <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 shadow-sm bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                      Proveedor
                    </th>
                    <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 shadow-sm bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                      Marca
                    </th>
                    <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 shadow-sm bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                      Categoría
                    </th>
                    <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 shadow-sm bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                      Costo Unitario
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100 dark:divide-slate-800 dark:bg-slate-950">
                  {sortedProducts.map((product) => (
                    <ProductTableRow
                      key={product.id}
                      product={product}
                      onEdit={updateProduct}
                      onDelete={(p) => requestSingleDelete(p)}
                      onCreateArea={createArea}
                      onCreateCategoria={createCategoria}
                      isSelected={selectedIds.has(product.id)}
                      onToggleSelect={() => toggleSelection(product.id)}
                      onMouseDown={() =>
                        handleMouseDown(product.id, selectedIds.has(product.id))
                      }
                      onMouseEnter={() => handleMouseEnter(product.id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={limit}
              onPageChange={setPage}
              onItemsPerPageChange={setLimit}
            />
          </>
        )}
      </div>
      <ConfirmModal
        isOpen={confirmState.open}
        title={
          confirmState.mode === "bulk"
            ? "Eliminar productos"
            : "Eliminar producto"
        }
        message={
          confirmState.mode === "bulk"
            ? `¿Seguro que deseas eliminar ${selectedIds.size} producto(s)?`
            : `¿Seguro que deseas eliminar "${
                confirmState.target?.nombre ?? ""
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
