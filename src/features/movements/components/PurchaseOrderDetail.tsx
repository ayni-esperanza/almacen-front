import { useState, useEffect, useCallback } from "react";
import { X, Plus, Trash2, Save } from "lucide-react";
import { PurchaseOrder, PurchaseOrderProduct } from "../types/purchases.ts";
import { purchaseOrdersService } from "../services/purchase-orders.service.ts";
import { ConfirmModal } from "../../../shared/components/ConfirmModal.tsx";
import { useBulkSelection } from "../../../shared/hooks/useBulkSelection";

interface PurchaseOrderDetailProps {
  order: PurchaseOrder;
  onClose: () => void;
  onRefresh?: () => void; // Opcional hasta que el backend esté listo
}

interface ProductFormData {
  fecha: string;
  codigo: string;
  nombre: string;
  area: string;
  proyecto: string;
  responsable: string;
  cantidad: number;
  costoUnitario: number;
}

export const PurchaseOrderDetail = ({
  order,
  onClose,
}: PurchaseOrderDetailProps) => {
  const [products, setProducts] = useState<PurchaseOrderProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<PurchaseOrderProduct | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    fecha: new Date().toISOString().split("T")[0],
    codigo: "",
    nombre: "",
    area: "",
    proyecto: "",
    responsable: "",
    cantidad: 1,
    costoUnitario: 0,
  });

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await purchaseOrdersService.getPurchaseOrderProducts(order.id);
      setProducts(data);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  }, [order.id]);

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
  } = useBulkSelection<PurchaseOrderProduct>({
    getId: (product) => product.id,
    deleteItem: async (id) => {
      // TODO: Implementar cuando el backend esté listo
      console.log("Eliminando producto con id:", id);
      return true;
    },
    refetch: loadProducts,
  });

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleAddProduct = () => {
    setShowAddForm(true);
    setEditingProduct(null);
    setFormData({
      fecha: new Date().toISOString().split("T")[0],
      codigo: "",
      nombre: "",
      area: "",
      proyecto: "",
      responsable: "",
      cantidad: 1,
      costoUnitario: 0,
    });
  };

  const handleEditProduct = (product: PurchaseOrderProduct) => {
    setEditingProduct(product);
    setShowAddForm(true);
    setFormData({
      fecha: product.fecha,
      codigo: product.codigo,
      nombre: product.nombre,
      area: product.area,
      proyecto: product.proyecto,
      responsable: product.responsable,
      cantidad: product.cantidad,
      costoUnitario: product.costoUnitario,
    });
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        // TODO: Descomentar cuando el backend esté listo
        // await purchaseOrdersService.updatePurchaseOrderProduct(
        //   order.id,
        //   editingProduct.id,
        //   formData
        // );
        console.log("Actualizando producto:", formData);
        alert("Funcionalidad disponible cuando el backend esté listo");
      } else {
        // TODO: Descomentar cuando el backend esté listo
        // await purchaseOrdersService.addProductToPurchaseOrder(order.id, formData);
        console.log("Agregando producto:", formData);
        alert("Funcionalidad disponible cuando el backend esté listo");
      }
      // await loadProducts();
      // onRefresh();
      setShowAddForm(false);
      setEditingProduct(null);
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Error al guardar el producto");
    }
  };



  const totalCantidad = products.reduce((sum, p) => sum + p.cantidad, 0);
  const totalCosto = products.reduce((sum, p) => sum + p.subtotal, 0);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="relative w-full max-w-5xl bg-white rounded-lg shadow-xl dark:bg-slate-900 max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header con degradado */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                Orden de Compra: {order.codigo}
              </h2>
              <p className="text-sm text-orange-100 mt-1">
                Fecha: {order.fecha}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-orange-100 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Contenido scrollable */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
              Productos
            </h3>
            <div className="flex gap-2">
              {selectedIds.size > 0 && (
                <button
                  onClick={() => requestBulkDelete()}
                  className="inline-flex items-center px-3 py-2 text-xs font-medium text-white transition-colors bg-red-500 rounded-lg hover:bg-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-1.5" />
                  Eliminar ({selectedIds.size})
                </button>
              )}
              <button
                onClick={handleAddProduct}
                className="inline-flex items-center px-3 py-2 text-xs font-medium text-white transition-colors bg-orange-500 rounded-lg hover:bg-orange-600"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Agregar Producto
              </button>
            </div>
          </div>

          {showAddForm && (
            <form
              onSubmit={handleSubmitProduct}
              className="p-4 mb-4 border border-gray-200 rounded-lg dark:border-slate-700"
            >
              <h4 className="mb-3 text-sm font-semibold text-gray-900 dark:text-slate-100">
                {editingProduct ? "Editar Producto" : "Nuevo Producto"}
              </h4>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700 dark:text-slate-300">
                    Fecha *
                  </label>
                  <input
                    type="date"
                    value={formData.fecha}
                    onChange={(e) =>
                      setFormData({ ...formData, fecha: e.target.value })
                    }
                    required
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700 dark:text-slate-300">
                    Código *
                  </label>
                  <input
                    type="text"
                    value={formData.codigo}
                    onChange={(e) =>
                      setFormData({ ...formData, codigo: e.target.value })
                    }
                    required
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700 dark:text-slate-300">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) =>
                      setFormData({ ...formData, nombre: e.target.value })
                    }
                    required
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700 dark:text-slate-300">
                    Área *
                  </label>
                  <input
                    type="text"
                    value={formData.area}
                    onChange={(e) =>
                      setFormData({ ...formData, area: e.target.value })
                    }
                    required
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700 dark:text-slate-300">
                    Proyecto *
                  </label>
                  <input
                    type="text"
                    value={formData.proyecto}
                    onChange={(e) =>
                      setFormData({ ...formData, proyecto: e.target.value })
                    }
                    required
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700 dark:text-slate-300">
                    Responsable *
                  </label>
                  <input
                    type="text"
                    value={formData.responsable}
                    onChange={(e) =>
                      setFormData({ ...formData, responsable: e.target.value })
                    }
                    required
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700 dark:text-slate-300">
                    Cantidad *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={formData.cantidad}
                    onChange={(e) =>
                      setFormData({ ...formData, cantidad: parseInt(e.target.value) || 1 })
                    }
                    required
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700 dark:text-slate-300">
                    Costo U. *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.costoUnitario}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        costoUnitario: parseFloat(e.target.value) || 0,
                      })
                    }
                    required
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingProduct(null);
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-medium text-white bg-orange-500 rounded hover:bg-orange-600"
                >
                  <Save className="inline w-4 h-4 mr-1" />
                  Guardar
                </button>
              </div>
            </form>
          )}

          <div className="overflow-hidden border border-gray-200 rounded-lg dark:border-slate-700">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                <thead className="bg-gray-50 dark:bg-slate-800">
                  <tr>
                    <th className="w-12 py-3 text-xs text-center select-none">
                      <input
                        type="checkbox"
                        checked={areAllVisibleSelected(products)}
                        onChange={() => toggleAll(products)}
                        aria-label="Seleccionar todos los productos"
                        className="w-4 h-4 text-orange-600 border-gray-300 rounded cursor-pointer focus:ring-2 focus:ring-orange-500 dark:border-slate-600 dark:bg-slate-800"
                      />
                    </th>
                    <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 dark:bg-slate-900 dark:text-slate-300">
                      Fecha
                    </th>
                    <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 dark:bg-slate-900 dark:text-slate-300">
                      Código
                    </th>
                    <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 dark:bg-slate-900 dark:text-slate-300">
                      Nombre
                    </th>
                    <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 dark:bg-slate-900 dark:text-slate-300">
                      Área
                    </th>
                    <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 dark:bg-slate-900 dark:text-slate-300">
                      Proyecto
                    </th>
                    <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 dark:bg-slate-900 dark:text-slate-300">
                      Responsable
                    </th>
                    <th className="px-3 py-3 text-xs font-semibold text-right text-gray-700 dark:bg-slate-900 dark:text-slate-300">
                      Cantidad
                    </th>
                    <th className="px-3 py-3 text-xs font-semibold text-right text-gray-700 dark:bg-slate-900 dark:text-slate-300">
                      Costo U.
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-900 dark:divide-slate-800">
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-sm text-center text-gray-500">
                        Cargando productos...
                      </td>
                    </tr>
                  ) : products.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-sm text-center text-gray-500">
                        No hay productos agregados
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => {
                      const isSelected = selectedIds.has(product.id);
                      
                      return (
                        <tr
                          key={product.id}
                          onClick={(e) => {
                            // Verificar si el click fue en el checkbox o su contenedor
                            const target = e.target as HTMLElement;
                            const isCheckbox = target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'checkbox';
                            const isCheckboxCell = target.closest('td')?.classList.contains('select-none');
                            
                            if (!isCheckbox && !isCheckboxCell) {
                              handleEditProduct(product);
                            }
                          }}
                          onMouseEnter={() => handleMouseEnter(product.id)}
                          className="transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800"
                        >
                          <td
                            className="px-3 py-2 text-xs text-center select-none"
                            onMouseDown={(e) => {
                              if (e.button === 0) {
                                e.stopPropagation();
                                handleMouseDown(product.id, isSelected);
                              }
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                e.stopPropagation();
                                toggleSelection(product.id);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              aria-label={`Seleccionar producto ${product.codigo}`}
                              className="w-4 h-4 text-orange-600 border-gray-300 rounded cursor-pointer focus:ring-2 focus:ring-orange-500 dark:border-slate-600 dark:bg-slate-800"
                            />
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-700 select-text dark:text-slate-300">
                            {product.fecha}
                          </td>
                          <td className="px-3 py-2 text-xs font-medium text-gray-900 select-text dark:text-slate-100">
                            {product.codigo}
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-700 select-text dark:text-slate-300">
                            {product.nombre}
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-700 select-text dark:text-slate-300">
                            {product.area}
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-700 select-text dark:text-slate-300">
                            {product.proyecto}
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-700 select-text dark:text-slate-300">
                            {product.responsable}
                          </td>
                          <td className="px-3 py-2 text-xs text-right text-gray-900 select-text dark:text-slate-100">
                            {product.cantidad}
                          </td>
                          <td className="px-3 py-2 text-xs text-right text-gray-700 select-text dark:text-slate-300">
                            S/ {product.costoUnitario.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                {products.length > 0 && (
                  <tfoot className="bg-gray-50 dark:bg-slate-800">
                    <tr>
                      <td
                        colSpan={7}
                        className="px-3 py-2 text-xs font-semibold text-right text-gray-900 dark:text-slate-100"
                      >
                        TOTALES:
                      </td>
                      <td className="px-3 py-2 text-xs font-bold text-right text-gray-900 dark:text-slate-100">
                        {totalCantidad}
                      </td>
                      <td className="px-3 py-2 text-xs font-bold text-right text-gray-900 dark:text-slate-100">
                        S/ {totalCosto.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
          
          </div>
          
          {/* Footer fijo */}
          <div className="border-t border-gray-200 dark:border-slate-800 px-6 py-4 bg-white dark:bg-slate-900">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-white transition-colors bg-gray-600 rounded-lg hover:bg-gray-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmState.open}
        title={
          confirmState.mode === "bulk"
            ? `Eliminar ${selectedIds.size} productos`
            : "Eliminar producto"
        }
        message={
          confirmState.mode === "bulk"
            ? `¿Está seguro de eliminar ${selectedIds.size} productos seleccionados?`
            : "¿Está seguro de eliminar este producto?"
        }
        confirmLabel={
          confirmState.mode === "bulk"
            ? `Eliminar ${selectedIds.size} productos`
            : "Eliminar producto"
        }
        onConfirm={handleConfirmDelete}
        onCancel={closeConfirm}
        isProcessing={isConfirming}
        destructive
      />
    </>
  );
};
