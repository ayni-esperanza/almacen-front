import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Product } from "../types";
import { Provider } from "../../providers/types";
import { providersService } from "../../providers/services/providers.service";

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onEdit: (product: Product) => void;
}

export const EditProductModal: React.FC<EditProductModalProps> = ({
  isOpen,
  onClose,
  product,
  onEdit,
}) => {
  // Opciones para los combos (puedes reemplazar por props si lo deseas)
  const [ubicaciones, setUbicaciones] = useState<string[]>(["A1", "A2", "B1"]);
  const [categorias, setCategorias] = useState<string[]>([
    "Herramientas",
    "Lubricantes",
  ]);
  const [providers, setProviders] = useState<Provider[]>([]);
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
  const chipClasses =
    "inline-flex items-center rounded px-2 py-1 text-xs text-gray-700 bg-gray-100 dark:bg-slate-800 dark:text-slate-200";

  useEffect(() => {
    const loadProviders = async () => {
      const data = await providersService.getAllProviders();
      setProviders(data);
    };
    loadProviders();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl dark:border dark:border-slate-800 dark:bg-slate-950">
        <div className="px-6 py-4 text-white rounded-t-2xl bg-gradient-to-r from-green-500 to-green-600">
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
              <div className="flex items-end gap-2">
                <div className="w-full">
                  <label className={labelClasses}>Ubicación *</label>
                  <div className="flex flex-col gap-1">
                    <select
                      value={ubicacion}
                      onChange={(e) => setUbicacion(e.target.value)}
                      className={`${inputClasses} appearance-none`}
                      required
                    >
                      <option value="">Estante dentro del Almacén</option>
                      {ubicaciones.map((area) => (
                        <option key={area} value={area}>
                          {area}
                        </option>
                      ))}
                    </select>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {ubicaciones
                        .filter((u) => !["A1", "A2", "B1"].includes(u))
                        .map((area) => (
                          <span key={area} className={`${chipClasses}`}>
                            {area}
                            <button
                              type="button"
                              className="ml-1 text-red-500 dark:text-rose-300"
                              onClick={() =>
                                setUbicaciones(
                                  ubicaciones.filter((u) => u !== area)
                                )
                              }
                            >
                              x
                            </button>
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
                {/* Botón para agregar ubicación eliminado porque setShowUbicacionModal no existe */}
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
              <div className="flex items-end gap-2">
                <div className="w-full">
                  <label className={labelClasses}>Categoría *</label>
                  <div className="flex flex-col gap-1">
                    <select
                      value={categoria}
                      onChange={(e) => setCategoria(e.target.value)}
                      className={`${inputClasses} appearance-none`}
                      required
                    >
                      <option value="">Selecciona una Categoría</option>
                      {categorias.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {categorias
                        .filter(
                          (c) => c !== "Herramientas" && c !== "Lubricantes"
                        )
                        .map((cat) => (
                          <span key={cat} className={chipClasses}>
                            {cat}
                            <button
                              type="button"
                              className="ml-1 text-red-500 dark:text-rose-300"
                              onClick={() =>
                                setCategorias(
                                  categorias.filter((ca) => ca !== cat)
                                )
                              }
                            >
                              x
                            </button>
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
                {/* Botón para agregar categoría eliminado porque setShowCategoriaModal no existe */}
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
        {/* Modales para agregar opción */}
        {/* Puedes reutilizar AddOptionModal si lo tienes disponible */}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
