import React, { useState, useEffect, useCallback, useRef } from "react";
import { X } from "lucide-react";
import {
  CreateProductData,
  inventoryService,
} from "../../../shared/services/inventory.service";
import { Provider } from "../../providers/types";
import { providersService } from "../../providers/services/providers.service";
import { useModalScrollLock } from "../../../shared/hooks/useModalScrollLock";
import { useEscapeKey } from "../../../shared/hooks/useEscapeKey";
import { useClickOutside } from "../../../shared/hooks/useClickOutside";
import { SearchableSelect } from "../../../shared/components/SearchableSelect";
import { AddOptionModal } from "../../../shared/components/AddOptionModal";

interface AddProductFormProps {
  onSubmit: (data: CreateProductData) => void;
  onCancel: () => void;
  areas: string[];
  categorias?: string[];
  onCreateArea: (name: string) => Promise<void>;
  onCreateCategoria: (name: string) => Promise<void>;
}

export const AddProductForm: React.FC<AddProductFormProps> = ({
  onSubmit,
  onCancel,
  areas,
  categorias: categoriasFromProps,
  onCreateArea,
  onCreateCategoria,
}) => {
  // Bloquear scroll de la ventana cuando está abierta la modal
  useModalScrollLock(true);
  // Cerrar modal con tecla ESC
  useEscapeKey(onCancel);
  // Referencia para detectar clicks fuera de la modal
  const modalRef = useRef<HTMLDivElement>(null);
  // Cerrar modal al hacer click fuera
  useClickOutside(modalRef, onCancel, true);

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
    ubicacion: "",
    categoria: "",
  });

  const [providers, setProviders] = useState<Provider[]>([]);

  const [showUbicacionModal, setShowUbicacionModal] = useState(false);
  const [showCategoriaModal, setShowCategoriaModal] = useState(false);
  const [ubicaciones, setUbicaciones] = useState<string[]>(areas);
  const [categorias, setCategorias] = useState<string[]>(
    categoriasFromProps || []
  );

  // Sincronizar ubicaciones cuando cambian las areas
  useEffect(() => {
    setUbicaciones(areas);
  }, [areas]);

  // Sincronizar categorías cuando cambian las props
  useEffect(() => {
    if (categoriasFromProps) {
      setCategorias(categoriasFromProps);
    }
  }, [categoriasFromProps]);

  // Cargar proveedores al montar el componente
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
    setUbicaciones(data);
    return data;
  }, []);

  // Función para buscar categorías desde la API
  const fetchCategorias = useCallback(async (searchTerm: string) => {
    const data = await inventoryService.getCategorias(searchTerm);
    setCategorias(data);
    return data;
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
    const { name, value } = e.target;
    
    // Si es el campo código, convertir a mayúsculas y limitar a 6 caracteres
    if (name === 'codigo') {
      const upperCaseValue = value.toUpperCase().slice(0, 6);
      setFormData({
        ...formData,
        [name]: upperCaseValue,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const labelClasses =
    "block text-xs font-semibold text-gray-700 dark:text-slate-200 mb-1";
  const inputClasses =
    "w-full rounded-xl border border-gray-300 px-3 py-1.5 text-sm text-gray-700 transition focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-green-400 dark:focus:ring-green-500/30";
  const selectClasses =
    "w-full rounded-xl border border-gray-300 px-3 py-1.5 text-sm text-gray-700 transition focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-green-400 dark:focus:ring-green-500/30";
  const dividerClasses = "border-t border-gray-200 pt-2 dark:border-slate-800";
  const iconButtonClasses =
    "flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-green-500 text-white transition-colors hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm dark:bg-slate-950/70">
      <div
        ref={modalRef}
        className="w-full max-w-3xl max-h-[95vh] overflow-y-auto rounded-3xl border border-transparent bg-white shadow-2xl transition-colors dark:border-slate-800 dark:bg-slate-950"
      >
        <div className="px-4 py-2 text-white bg-gradient-to-r from-green-500 to-green-600">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold">Nuevo Producto</h2>
            <button
              onClick={onCancel}
              className="p-1 text-white transition-colors rounded-full hover:bg-white/20 dark:hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <form
          onSubmit={handleSubmit}
          autoComplete="off"
          className="px-4 pt-4 pb-4 space-y-2 bg-white dark:bg-slate-950"
        >
          <div className="grid gap-2 md:grid-cols-2">
            <div className="space-y-2">
              <div>
                <label className={labelClasses}>Código del Producto *</label>
                <input
                  type="text"
                  name="codigo"
                  value={formData.codigo}
                  onChange={handleChange}
                  className={inputClasses}
                  required
                  maxLength={6}
                  minLength={6}
                  pattern="[A-Z0-9]{6}"
                  title="El código debe tener exactamente 6 caracteres en mayúsculas"
                  placeholder="Ej: ABC123"
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
                  step="0.01"
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
                  onFocus={(e) => e.target.select()}
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
                  <SearchableSelect
                    name="ubicacion"
                    label="Ubicación"
                    value={formData.ubicacion}
                    onChange={(value) =>
                      setFormData({ ...formData, ubicacion: value })
                    }
                    fetchOptions={fetchUbicaciones}
                    placeholder="Estante dentro del almacén"
                    required
                  />
                </div>
                <button
                  type="button"
                  className={iconButtonClasses}
                  onClick={() => setShowUbicacionModal(true)}
                  title="Agregar nueva ubicación"
                >
                  <span className="text-lg font-bold">+</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
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
                  <SearchableSelect
                    name="categoria"
                    label="Categoría"
                    value={formData.categoria}
                    onChange={(value) =>
                      setFormData({ ...formData, categoria: value })
                    }
                    fetchOptions={fetchCategorias}
                    placeholder="Selecciona una categoría"
                    required
                  />
                </div>
                <button
                  type="button"
                  className={iconButtonClasses}
                  onClick={() => setShowCategoriaModal(true)}
                  title="Agregar nueva categoría"
                >
                  <span className="text-lg font-bold">+</span>
                </button>
              </div>
            </div>
          </div>

          <div
            className={`flex flex-col gap-2 ${dividerClasses} sm:flex-row sm:justify-end`}
          >
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-1.5 text-sm font-semibold text-gray-700 transition-colors border border-gray-300 rounded-full hover:bg-gray-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900/60"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-sm font-semibold text-white transition-colors bg-green-500 rounded-full shadow-md hover:bg-green-600 dark:bg-green-500 dark:hover:bg-green-400"
            >
              Agregar Producto
            </button>
          </div>
        </form>
        {/* Modales para agregar opción */}
        <AddOptionModal
          isOpen={showUbicacionModal}
          onClose={() => setShowUbicacionModal(false)}
          onSubmit={async (option: string) => {
            if (option) {
              await onCreateArea(option); // Guardar en BD
              if (!ubicaciones.includes(option))
                setUbicaciones([...ubicaciones, option]);
            }
            setShowUbicacionModal(false);
          }}
          title="Nueva Ubicación"
          label="Ubicación *"
        />
        <AddOptionModal
          isOpen={showCategoriaModal}
          onClose={() => setShowCategoriaModal(false)}
          onSubmit={async (option: string) => {
            if (option) {
              await onCreateCategoria(option); // Guardar en BD
              if (!categorias.includes(option))
                setCategorias([...categorias, option]);
            }
            setShowCategoriaModal(false);
          }}
          title="Nueva Categoría"
          label="Categoría *"
        />
      </div>
    </div>
  );
};
