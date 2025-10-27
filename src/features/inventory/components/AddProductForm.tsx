import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { CreateProductData } from "../../../shared/services/inventory.service";
import { Provider } from "../../providers/types";
import { providersService } from "../../providers/services/providers.service";
import { useModalScrollLock } from "../../../shared/hooks/useModalScrollLock";
import { AsyncSelect } from "../../../shared";

interface AddProductFormProps {
  onSubmit: (data: CreateProductData) => void;
  onCancel: () => void;
}

export const AddProductForm: React.FC<AddProductFormProps> = ({
  onSubmit,
  onCancel,
}) => {
  // Bloquear scroll de la ventana cuando está abierta la modal
  useModalScrollLock(true);
  
  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    costoUnitario: "",
    entradas: "0",
    salidas: "0",
    stockActual: "0",
    stockMinimo: "0",
    unidadMedida: "",
    marca: "",
    providerId: "",
  });

  const [selectedCategoria, setSelectedCategoria] = useState<string | number | null>(null);
  const [selectedUbicacion, setSelectedUbicacion] = useState<string | number | null>(null);

  const [providers, setProviders] = useState<Provider[]>([]);

  // Cargar proveedores al montar el componente
  useEffect(() => {
    const loadProviders = async () => {
      const data = await providersService.getAllProviders();
      setProviders(data);
    };
    loadProviders();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Preparar datos según lo que espera el backend
    const productData = {
      codigo: formData.codigo,
      nombre: formData.nombre,
      costoUnitario: parseFloat(formData.costoUnitario) || 0,
      unidadMedida: formData.unidadMedida,
      stockActual: parseInt(formData.stockActual) || 0,
      stockMinimo: parseInt(formData.stockMinimo) || 0,
      providerId: parseInt(formData.providerId),
      marca: formData.marca,
      ubicacion: String(selectedUbicacion || ""),
      categoria: String(selectedCategoria || ""),
    };
    onSubmit(productData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const labelClasses =
    "block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2";
  const inputClasses =
    "w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-700 transition focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-green-400 dark:focus:ring-green-500/30";
  const selectClasses =
    "w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-700 transition focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-green-400 dark:focus:ring-green-500/30";
  const dividerClasses = "border-t border-gray-200 pt-8 dark:border-slate-800";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm dark:bg-slate-950/70">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-transparent bg-white shadow-2xl transition-colors dark:border-slate-800 dark:bg-slate-950">
        <div className="px-6 py-4 text-white bg-gradient-to-r from-green-500 to-green-600">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Nuevo Producto</h2>
            <button
              onClick={onCancel}
              className="p-1 text-white transition-colors rounded-full hover:bg-white/20 dark:hover:bg-white/10"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        <form
          onSubmit={handleSubmit}
          className="px-8 pt-6 pb-8 space-y-8 bg-white dark:bg-slate-950"
        >
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-6">
              <div>
                <label className={labelClasses}>Código del Producto *</label>
                <input
                  type="text"
                  name="codigo"
                  value={formData.codigo}
                  onChange={handleChange}
                  className={inputClasses}
                  required
                />
              </div>
              <div>
                <label className={labelClasses}>Costo Unitario *</label>
                <input
                  type="number"
                  name="costoUnitario"
                  value={formData.costoUnitario}
                  onChange={handleChange}
                  className={inputClasses}
                  min="0"
                  required
                />
              </div>
              <div>
                <label className={labelClasses}>Stock Total *</label>
                <input
                  type="number"
                  name="stockActual"
                  value={formData.stockActual || ""}
                  onChange={handleChange}
                  className={inputClasses}
                  min="0"
                  required
                />
              </div>
              <div>
                <label className={labelClasses}>Proveedor *</label>
                <select
                  name="providerId"
                  value={formData.providerId}
                  onChange={handleChange}
                  className={selectClasses}
                  required
                >
                  <option value="">Selecciona un proveedor</option>
                  {providers.map((provider) => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name}
                    </option>
                  ))}
                </select>
              </div>
              <AsyncSelect
                endpoint="/inventory/locations"
                label="Ubicación"
                placeholder="Estante dentro del almacén"
                value={selectedUbicacion}
                onChange={(value) => setSelectedUbicacion(value)}
                name="ubicacion"
                required
              />
            </div>

            <div className="space-y-6">
              <div>
                <label className={labelClasses}>Nombre del Producto *</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre || ""}
                  onChange={handleChange}
                  className={inputClasses}
                  required
                />
              </div>
              <div>
                <label className={labelClasses}>Unidad de medida *</label>
                <select
                  name="unidadMedida"
                  value={formData.unidadMedida}
                  onChange={handleChange}
                  className={selectClasses}
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
                  name="stockMinimo"
                  value={formData.stockMinimo || ""}
                  onChange={handleChange}
                  className={inputClasses}
                  min="0"
                  required
                />
              </div>
              <div>
                <label className={labelClasses}>Marca *</label>
                <input
                  type="text"
                  name="marca"
                  value={formData.marca || ""}
                  onChange={handleChange}
                  className={inputClasses}
                  required
                />
              </div>
              <AsyncSelect
                endpoint="/inventory/categories"
                label="Categoría"
                placeholder="Selecciona una categoría"
                value={selectedCategoria}
                onChange={(value) => setSelectedCategoria(value)}
                name="categoria"
                required
              />
            </div>
          </div>

          <div
            className={`flex flex-col gap-4 ${dividerClasses} sm:flex-row sm:justify-end`}
          >
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 text-sm font-semibold text-gray-700 transition-colors border border-gray-300 rounded-full hover:bg-gray-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900/60"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-3 text-sm font-semibold text-white transition-colors bg-green-500 rounded-full shadow-md hover:bg-green-600 dark:bg-green-500 dark:hover:bg-green-400"
            >
              Agregar Producto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
