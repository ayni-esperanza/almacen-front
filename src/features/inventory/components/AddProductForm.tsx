import React, { useState, useEffect } from "react";
import { AddOptionModal } from "../../../shared/components/AddOptionModal";
import { X } from "lucide-react";
import { CreateProductData } from "../../../shared/services/inventory.service";
import { Provider } from "../../providers/types";
import { providersService } from "../../providers/services/providers.service";

interface AddProductFormProps {
  onSubmit: (data: CreateProductData) => void;
  onCancel: () => void;
  areas: string[];
}

export const AddProductForm: React.FC<AddProductFormProps> = ({
  onSubmit,
  onCancel,
  areas,
}) => {
  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    costoUnitario: "",
    ubicacion: "",
    entradas: "0",
    salidas: "0",
    stockActual: "0",
    stockMinimo: "0",
    unidadMedida: "",
    marca: "",
    providerId: "",
    categoria: "",
  });

  const [providers, setProviders] = useState<Provider[]>([]);

  const [showUbicacionModal, setShowUbicacionModal] = useState(false);
  const [showCategoriaModal, setShowCategoriaModal] = useState(false);
  const [ubicaciones, setUbicaciones] = useState<string[]>(areas);
  const [categorias, setCategorias] = useState<string[]>([
    "Herramientas",
    "Lubricantes",
  ]);

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
      ubicacion: formData.ubicacion,
      categoria: formData.categoria,
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
  const chipClasses =
    "inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-slate-800 dark:text-slate-200";
  const iconButtonClasses =
    "flex h-11 w-11 items-center justify-center rounded-full border border-gray-300 bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800";
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
              <div className="flex items-end gap-3">
                <div className="w-full">
                  <label className={labelClasses}>Ubicación *</label>
                  <div className="flex flex-col gap-2">
                    <select
                      name="ubicacion"
                      value={formData.ubicacion}
                      onChange={handleChange}
                      className={selectClasses}
                      required
                    >
                      <option value="">Estante dentro del almacén</option>
                      {ubicaciones.map((area) => (
                        <option key={area} value={area}>
                          {area}
                        </option>
                      ))}
                    </select>
                    <div className="flex flex-wrap gap-2">
                      {ubicaciones
                        .filter((u) => !areas.includes(u))
                        .map((area) => (
                          <span key={area} className={chipClasses}>
                            {area}
                            <button
                              type="button"
                              className="text-red-500 transition-colors hover:text-red-600"
                              onClick={() =>
                                setUbicaciones(
                                  ubicaciones.filter((u) => u !== area)
                                )
                              }
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className={iconButtonClasses}
                  onClick={() => setShowUbicacionModal(true)}
                >
                  <span className="text-xl font-bold">+</span>
                </button>
              </div>
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
              <div className="flex items-end gap-3">
                <div className="w-full">
                  <label className={labelClasses}>Categoría *</label>
                  <div className="flex flex-col gap-2">
                    <select
                      name="categoria"
                      value={formData.categoria}
                      onChange={handleChange}
                      className={selectClasses}
                      required
                    >
                      <option value="">Selecciona una categoría</option>
                      {categorias.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <div className="flex flex-wrap gap-2">
                      {categorias
                        .filter(
                          (c) => c !== "Herramientas" && c !== "Lubricantes"
                        )
                        .map((cat) => (
                          <span key={cat} className={chipClasses}>
                            {cat}
                            <button
                              type="button"
                              className="text-red-500 transition-colors hover:text-red-600"
                              onClick={() =>
                                setCategorias(
                                  categorias.filter((ca) => ca !== cat)
                                )
                              }
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className={iconButtonClasses}
                  onClick={() => setShowCategoriaModal(true)}
                >
                  <span className="text-xl font-bold">+</span>
                </button>
              </div>
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
        {/* Modales para agregar opción */}
        <AddOptionModal
          isOpen={showUbicacionModal}
          onClose={() => setShowUbicacionModal(false)}
          onSubmit={(option: string) => {
            if (option && !ubicaciones.includes(option))
              setUbicaciones([...ubicaciones, option]);
            setShowUbicacionModal(false);
          }}
          title="Nueva Ubicación"
          label="Ubicación *"
        />
        <AddOptionModal
          isOpen={showCategoriaModal}
          onClose={() => setShowCategoriaModal(false)}
          onSubmit={(option: string) => {
            if (option && !categorias.includes(option))
              setCategorias([...categorias, option]);
            setShowCategoriaModal(false);
          }}
          title="Nueva Categoría"
          label="Categoría *"
        />
      </div>
    </div>
  );
};
