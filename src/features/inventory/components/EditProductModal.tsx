import React, { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { Product } from "../types";
import { Provider } from "../../providers/types";
import { providersService } from "../../providers/services/providers.service";
import { useModalScrollLock } from "../../../shared/hooks/useModalScrollLock";
import { useEscapeKey } from "../../../shared/hooks/useEscapeKey";
import { useClickOutside } from "../../../shared/hooks/useClickOutside";
import { SearchableSelect } from "../../../shared/components/SearchableSelect";
import { inventoryService } from "../../../shared/services/inventory.service";
import { ConfirmModal } from "../../../shared/components/ConfirmModal";

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onEdit: (product: Product) => void;
  onDelete?: (product: Product) => void | Promise<void>;
}

export const EditProductModal: React.FC<EditProductModalProps> = ({
  isOpen,
  onClose,
  product,
  onEdit,
  onDelete,
}) => {
  // Bloquear scroll cuando la modal está abierta
  useModalScrollLock(isOpen);
  // Cerrar modal con tecla ESC
  useEscapeKey(onClose, isOpen);
  // Referencia para detectar clicks fuera de la modal
  const modalRef = useRef<HTMLDivElement>(null);
  // Cerrar modal al hacer click fuera
  useClickOutside(modalRef, onClose, isOpen);

  // Opciones para los combos
  const [providers, setProviders] = useState<Provider[]>([]);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [nombre, setNombre] = useState(product?.nombre || "");
  const [codigo, setCodigo] = useState(product?.codigo || "");
  const [costoUnitario, setCostoUnitario] = useState(
    product?.costoUnitario || 0,
  );
  const [ubicacion, setUbicacion] = useState(product?.ubicacion || "");
  const [stockActual, setStockActual] = useState(product?.stockActual || 0);
  const [stockMinimo, setStockMinimo] = useState(product?.stockMinimo ?? 1);
  const [unidadMedida, setUnidadMedida] = useState(product?.unidadMedida || "");
  const [providerId, setProviderId] = useState(product?.providerId || 0);
  const [marca, setMarca] = useState(product?.marca || "");
  const [categoria, setCategoria] = useState(product?.categoria || "");
  const unidadMedidaOptions = [
    { value: "und", label: "Unidad (und)" },
    { value: "lt", label: "Litro (lt)" },
    { value: "kg", label: "Kilogramo (kg)" },
    { value: "m", label: "Metro (m)" },
    { value: "m2", label: "Metro cuadrado (m²)" },
    { value: "m3", label: "Metro cúbico (m³)" },
    { value: "pza", label: "Pieza (pza)" },
    { value: "caja", label: "Caja" },
    { value: "rollo", label: "Rollo" },
    { value: "par", label: "Par" },
  ];
  const inputClasses =
    "w-full rounded-xl border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-emerald-400 dark:focus:ring-emerald-500/30";
  const labelClasses =
    "block text-xs font-semibold text-gray-700 mb-1 dark:text-slate-200";

  useEffect(() => {
    const loadProviders = async () => {
      const data = await providersService.getAllProviders();
      setProviders(data);
    };
    loadProviders();
  }, []);

  // Función para buscar ubicaciones desde la API
  const fetchUbicaciones = useCallback(async (searchTerm: string) => {
    const data = await inventoryService.getUbicaciones(searchTerm);
    return data;
  }, []);

  // Función para buscar categorías desde la API
  const fetchCategorias = useCallback(async (searchTerm: string) => {
    const data = await inventoryService.getCategorias(searchTerm);
    return data;
  }, []);
  useEffect(() => {
    if (product) {
      setNombre(product.nombre);
      setCodigo(product.codigo);
      setCostoUnitario(product.costoUnitario);
      setUbicacion(product.ubicacion);
      setStockActual(product.stockActual);
      setStockMinimo(product.stockMinimo ?? 1);
      setUnidadMedida(product.unidadMedida);
      setProviderId(product.providerId);
      setMarca(product.marca || "");
      setCategoria(product.categoria || "");
    }
  }, [product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    onEdit({
      ...product,
      nombre,
      codigo,
      costoUnitario,
      ubicacion,
      stockActual,
      stockMinimo,
      unidadMedida,
      providerId,
      marca,
      categoria,
    });
    onClose();
  };

  const handleDelete = async () => {
    if (!product || !onDelete) return;
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!product || !onDelete) {
      setConfirmDeleteOpen(false);
      return;
    }

    try {
      setIsConfirmingDelete(true);
      await onDelete(product);
      onClose();
    } catch (error) {
      console.error(error);
      alert("Error al eliminar");
    } finally {
      setIsConfirmingDelete(false);
      setConfirmDeleteOpen(false);
    }
  };

  if (!isOpen || !product) return null;

  const modalContent = (
    <>
      <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-2 py-3 backdrop-blur-sm dark:bg-slate-950/70 sm:items-center sm:overflow-y-visible sm:p-4">
        <div
          ref={modalRef}
          className="w-full max-w-3xl max-h-[95vh] overflow-hidden rounded-3xl bg-white shadow-2xl dark:border dark:border-slate-800 dark:bg-slate-950 flex flex-col"
        >
          <div className="flex-shrink-0 px-4 py-2 text-white rounded-t-3xl bg-gradient-to-r from-green-500 to-green-600">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold">Editar Producto</h2>
              <button
                onClick={onClose}
                className="p-1 text-white transition-colors rounded-full hover:bg-white hover:bg-opacity-20"
              >
                ×
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-4">
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {/* Columna izquierda */}
                <div className="space-y-2">
                  <div>
                    <label className={labelClasses}>
                      Código del Producto *
                    </label>
                    <input
                      type="text"
                      value={codigo}
                      onChange={(e) => setCodigo(e.target.value)}
                      className={inputClasses}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClasses}>Costo Unitario *</label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={costoUnitario}
                      onChange={(e) => setCostoUnitario(Number(e.target.value))}
                      className={inputClasses}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClasses}>Stock Actual *</label>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={stockActual}
                      onChange={(e) => setStockActual(Number(e.target.value))}
                      className={inputClasses}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClasses}>Proveedor *</label>
                    <SearchableSelect
                      name="providerId"
                      value={providerId ? String(providerId) : ""}
                      onChange={(value) =>
                        setProviderId(value ? parseInt(value) : 0)
                      }
                      options={providers.map((provider) => ({
                        value: String(provider.id),
                        label: provider.name,
                      }))}
                      placeholder="Selecciona un proveedor"
                      required
                    />
                  </div>
                  <div className="flex items-end gap-3">
                    <div className="w-full">
                      <SearchableSelect
                        name="ubicacion"
                        label="Ubicación"
                        value={ubicacion}
                        onChange={(value) => setUbicacion(value)}
                        fetchOptions={fetchUbicaciones}
                        placeholder="Estante dentro del Almacén"
                        required
                      />
                    </div>
                  </div>
                </div>
                {/* Columna derecha */}
                <div className="space-y-2">
                  <div>
                    <label className={labelClasses}>
                      Nombre del Producto *
                    </label>
                    <input
                      type="text"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      className={inputClasses}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClasses}>Unidad de medida *</label>
                    <SearchableSelect
                      name="unidadMedida"
                      value={unidadMedida}
                      onChange={(value) => setUnidadMedida(value)}
                      options={unidadMedidaOptions}
                      placeholder="Seleccionar unidad"
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClasses}>Stock Mínimo *</label>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={stockMinimo}
                      onChange={(e) => setStockMinimo(Number(e.target.value))}
                      className={inputClasses}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClasses}>Marca *</label>
                    <input
                      type="text"
                      value={marca}
                      onChange={(e) => setMarca(e.target.value)}
                      className={inputClasses}
                      required
                    />
                  </div>
                  <div className="flex items-end gap-3">
                    <div className="w-full">
                      <SearchableSelect
                        name="categoria"
                        label="Categoría"
                        value={categoria}
                        onChange={(value) => setCategoria(value)}
                        fetchOptions={fetchCategorias}
                        placeholder="Selecciona una Categoría"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 mt-2 border-t border-gray-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-1.5 text-sm font-semibold text-red-600 transition-colors border border-red-200 rounded-full hover:bg-red-50 dark:border-red-500/40 dark:text-red-200 dark:hover:bg-red-500/10"
                >
                  Eliminar
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-1.5 text-sm font-semibold text-gray-700 transition-colors border border-gray-300 rounded-full hover:bg-gray-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-sm font-semibold text-white transition-colors bg-green-500 rounded-full hover:bg-green-600 dark:bg-emerald-500 dark:hover:bg-emerald-400"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>

          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmDeleteOpen}
        title="Eliminar producto"
        message={`¿Eliminar definitivamente "${product?.nombre ?? "este producto"}"?`}
        confirmLabel="Eliminar"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDeleteOpen(false)}
        isProcessing={isConfirmingDelete}
        destructive
      />
    </>
  );

  return createPortal(modalContent, document.body);
};
