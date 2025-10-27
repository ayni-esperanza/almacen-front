import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Product } from "../types";
import { Provider } from "../../providers/types";
import { providersService } from "../../providers/services/providers.service";
import { useModalScrollLock } from "../../../shared/hooks/useModalScrollLock";
import { AddOptionModal } from "../../../shared/components/AddOptionModal";
import { SearchableSelect } from "../../../shared/components/SearchableSelect";
import { inventoryService } from "../../../shared/services/inventory.service";

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onEdit: (product: Product) => void;
  onCreateArea: (name: string) => Promise<void>;
  onCreateCategoria: (name: string) => Promise<void>;
}

export const EditProductModal: React.FC<EditProductModalProps> = ({
  isOpen,
  onClose,
  product,
  onEdit,
  onCreateArea,
  onCreateCategoria,
}) => {
  // Bloquear scroll cuando la modal está abierta
  useModalScrollLock(isOpen);

  // Opciones para los combos
  const [providers, setProviders] = useState<Provider[]>([]);
  const [showUbicacionModal, setShowUbicacionModal] = useState(false);
  const [showCategoriaModal, setShowCategoriaModal] = useState(false);
  const [nombre, setNombre] = useState(product?.nombre || "");
  const [codigo, setCodigo] = useState(product?.codigo || "");
  const [costoUnitario, setCostoUnitario] = useState(
    product?.costoUnitario || 0
  );
  const [ubicacion, setUbicacion] = useState(product?.ubicacion || "");
  const [stockActual, setStockActual] = useState(product?.stockActual || 0);
  const [stockMinimo, setStockMinimo] = useState(product?.stockMinimo || 0);
  const [unidadMedida, setUnidadMedida] = useState(product?.unidadMedida || "");
  const [providerId, setProviderId] = useState(product?.providerId || 0);
  const [marca, setMarca] = useState(product?.marca || "");
  const [categoria, setCategoria] = useState(product?.categoria || "");
  const inputClasses =
    "w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-emerald-400 dark:focus:ring-emerald-500/30";
  const labelClasses =
    "block text-sm font-semibold text-gray-700 mb-2 dark:text-slate-200";

  useEffect(() => {
    const loadProviders = async () => {
      const data = await providersService.getAllProviders();
      setProviders(data);
    };
    loadProviders();
  }, []);

  // Función para buscar ubicaciones desde la API
  const fetchUbicaciones = useCallback(async (searchTerm: string) => {
    const data = await inventoryService.getAreas(searchTerm);
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
      setStockMinimo(product.stockMinimo || 0);
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

  if (!isOpen || !product) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm dark:bg-slate-950/70">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl dark:border dark:border-slate-800 dark:bg-slate-950 flex flex-col">
        <div className="flex-shrink-0 px-6 py-4 text-white rounded-t-2xl bg-gradient-to-r from-green-500 to-green-600">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Editar Producto</h2>
            <button
              onClick={onClose}
              className="p-1 text-white transition-colors rounded-full hover:bg-white hover:bg-opacity-20"
            >
              ×
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Columna izquierda */}
              <div className="space-y-6">
                <div>
                  <label className={labelClasses}>Código del Producto *</label>
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
                    value={stockActual}
                    onChange={(e) => setStockActual(Number(e.target.value))}
                    className={inputClasses}
                    required
                  />
                </div>
                <div>
                  <label className={labelClasses}>Proveedor *</label>
                  <select
                    value={providerId}
                    onChange={(e) => setProviderId(parseInt(e.target.value))}
                    className={`${inputClasses} appearance-none`}
                    required
                  >
                    <option value="">Selecciona un Proveedor</option>
                    {providers.map((provider) => (
                      <option key={provider.id} value={provider.id}>
                        {provider.name}
                      </option>
                    ))}
                  </select>
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
                  <button
                    type="button"
                    onClick={() => setShowUbicacionModal(true)}
                    className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-green-500 text-white transition-colors hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-500"
                    title="Agregar nueva ubicación"
                  >
                    <span className="text-xl font-bold">+</span>
                  </button>
                </div>
              </div>
              {/* Columna derecha */}
              <div className="space-y-6">
                <div>
                  <label className={labelClasses}>Nombre del Producto *</label>
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
                  <select
                    value={unidadMedida}
                    onChange={(e) => setUnidadMedida(e.target.value)}
                    className={`${inputClasses} appearance-none`}
                    required
                  >
                    <option value="">Seleccionar unidad</option>
                    <option value="und">Unidad (und)</option>
                    <option value="lt">Litro (lt)</option>
                    <option value="kg">Kilogramo (kg)</option>
                    <option value="m">Metro (m)</option>
                    <option value="m2">Metro cuadrado (m²)</option>
                    <option value="m3">Metro cúbico (m³)</option>
                    <option value="pza">Pieza (pza)</option>
                    <option value="caja">Caja</option>
                    <option value="rollo">Rollo</option>
                    <option value="par">Par</option>
                  </select>
                </div>
                <div>
                  <label className={labelClasses}>Stock Mínimo *</label>
                  <input
                    type="number"
                    min={0}
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
                  <button
                    type="button"
                    onClick={() => setShowCategoriaModal(true)}
                    className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-green-500 text-white transition-colors hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-500"
                    title="Agregar nueva categoría"
                  >
                    <span className="text-xl font-bold">+</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-4 pt-8 mt-8 border-t border-gray-200 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 font-medium text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-3 font-medium text-white transition-colors bg-green-500 rounded-lg hover:bg-green-600 dark:bg-emerald-500 dark:hover:bg-emerald-400"
              >
                Guardar Cambios
              </button>
            </div>
          </form>

          {/* Modales para agregar opciones */}
          <AddOptionModal
            isOpen={showUbicacionModal}
            onClose={() => setShowUbicacionModal(false)}
            onSubmit={async (name) => {
              await onCreateArea(name);
              setShowUbicacionModal(false);
            }}
            title="Nueva Ubicación"
            label="Ubicación *"
          />

          <AddOptionModal
            isOpen={showCategoriaModal}
            onClose={() => setShowCategoriaModal(false)}
            onSubmit={async (name) => {
              await onCreateCategoria(name);
              setShowCategoriaModal(false);
            }}
            title="Nueva Categoría"
            label="Categoría *"
          />
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
