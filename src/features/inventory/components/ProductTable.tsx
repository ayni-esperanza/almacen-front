import React from "react";
import { Product } from "../types";
import { ProductTableRow } from "./ProductTableRow";
import { Pagination } from "../../../shared/components/Pagination";
import { usePagination } from "../../../shared/hooks/usePagination";
import { Package, Search, AlertCircle, Plus, Trash2 } from "lucide-react";
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
  deleteProduct: (id: number) => Promise<boolean>;
  createArea: (name: string) => Promise<void>;
  createCategoria: (name: string) => Promise<void>;
  onAddProduct?: () => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  loading,
  error,
  searchTerm,
  setSearchTerm,
  refetch,
  updateProduct,
  deleteProduct,
  createArea,
  createCategoria,
  onAddProduct,
}) => {
  // Estado para selección múltiple
  const [selectedIds, setSelectedIds] = React.useState<Set<number>>(new Set());
  const [isSelecting, setIsSelecting] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // Funciones de selección
  const toggleSelection = (id: number) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === paginatedProducts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedProducts.map((p) => p.id)));
    }
  };

  const handleMouseDown = (id: number, isSelectedRow: boolean) => {
    // Iniciar arrastre sin alternar todavía; el toggle inicial ocurre en el checkbox
    setIsDragging(true);
    setIsSelecting(!isSelectedRow);
  };

  const handleMouseEnter = (id: number) => {
    if (isDragging) {
      if (isSelecting && !selectedIds.has(id)) {
        toggleSelection(id);
      } else if (!isSelecting && selectedIds.has(id)) {
        toggleSelection(id);
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener("mouseup", handleMouseUp);
      return () => document.removeEventListener("mouseup", handleMouseUp);
    }
  }, [isDragging]);

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    
    const confirmed = window.confirm(
      `¿Estás seguro de que deseas eliminar ${selectedIds.size} producto(s)?`
    );
    
    if (!confirmed) return;

    try {
      setIsRefreshing(true);
      const deletePromises = Array.from(selectedIds).map((id) =>
        deleteProduct(id)
      );
      await Promise.all(deletePromises);
      setSelectedIds(new Set());
      await refetch();
    } catch (error) {
      console.error("Error deleting products:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Filtrar Y Ordenar productos localmente usando useMemo
  const filteredProducts = React.useMemo(() => {
    // Primero filtramos
    const filtered = products.filter((product) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        product.codigo.toLowerCase().includes(searchLower) ||
        product.nombre.toLowerCase().includes(searchLower) ||
        (product.provider?.name &&
          product.provider.name.toLowerCase().includes(searchLower))
      );
    });

    // ordenamos por fecha de creación (createdAt) descendente (más nuevo primero)
    return filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA; // Descendente: B - A
    });
  }, [products, searchTerm]);

  const {
    paginatedData: paginatedProducts,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    handlePageChange,
    handleItemsPerPageChange,
  } = usePagination({ data: filteredProducts, initialItemsPerPage: 100 });
  const searchInputClasses =
    "w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-emerald-400 dark:focus:ring-emerald-500/30";
  if (loading && !isRefreshing) {
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
            <div className="flex items-center gap-3">
              {selectedIds.size > 0 && (
                <button
                  onClick={handleDeleteSelected}
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
        {filteredProducts.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-slate-400">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-slate-600" />
            <p>
              {products.length === 0
                ? "No se encontraron productos"
                : "No se encontraron productos con los filtros aplicados"}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto md:overflow-visible">
              <table className="min-w-[960px] w-full text-xs text-gray-700 dark:text-slate-200">
                {/* Header de tabla - STICKY */}
                <thead className="sticky top-[174px] z-20 bg-gray-50 dark:bg-slate-900">
                  <tr className="border-b border-gray-200 dark:border-slate-800">
                  <th className="px-3 py-3 text-xs font-semibold text-center text-gray-700 shadow-sm bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === paginatedProducts.length && paginatedProducts.length > 0}
                      onChange={toggleAll}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded cursor-pointer focus:ring-2 focus:ring-green-500 dark:border-slate-600 dark:bg-slate-800"
                    />
                  </th>
                  <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 shadow-sm bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                    Código
                  </th>
                  <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 shadow-sm bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                    Nombre
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
                {paginatedProducts.map((product) => (
                  <ProductTableRow
                    key={product.id}
                    product={product}
                    onEdit={updateProduct}
                    onDelete={async (p) => {
                      try {
                        setIsRefreshing(true);
                        const deleted = await deleteProduct(p.id);
                        if (deleted) {
                          await refetch();
                        }
                      } finally {
                        setIsRefreshing(false);
                      }
                    }}
                    onCreateArea={createArea}
                    onCreateCategoria={createCategoria}
                    isSelected={selectedIds.has(product.id)}
                    onToggleSelect={() => toggleSelection(product.id)}
                    onMouseDown={() => handleMouseDown(product.id, selectedIds.has(product.id))}
                    onMouseEnter={() => handleMouseEnter(product.id)}
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
