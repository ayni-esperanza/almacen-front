import React, { useState, useEffect, useRef } from "react";
import {
  ChevronDown,
  Wrench,
  X,
  Check,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { CreateEquipmentData } from "../../../shared/services/equipment.service";
import {
  inventoryService,
  Product,
} from "../../../shared/services/inventory.service";
import { useEscapeKey } from "../../../shared/hooks/useEscapeKey";
import { useClickOutside } from "../../../shared/hooks/useClickOutside";
import { SearchableSelect } from "../../../shared/components/SearchableSelect";
import DatePicker from "react-datepicker";
import { parseISO } from "date-fns";
import { es } from "date-fns/locale";

const AREAS_MOVIMIENTOS = [
  "Almacén",
  "Contabilidad",
  "Electricidad",
  "Extrusora",
  "Fibra",
  "Líneas de vida",
  "Mecánica",
  "Metalmecánica",
  "Oficina",
  "Pozos",
  "Torres de Enfriamiento",
];

interface AddEquipmentFormProps {
  onSubmit: (data: CreateEquipmentData) => void;
  onCancel: () => void;
  tipoRegistro: "continua" | "fija";
  initialArea?: string;
}

type EstadoEquipo = CreateEquipmentData["estadoEquipo"];
type EstadoRetorno = "" | "Bueno" | "Regular" | "Malo" | "Danado";

export const AddEquipmentForm: React.FC<AddEquipmentFormProps> = ({
  onSubmit,
  onCancel,
  tipoRegistro,
  initialArea,
}) => {
  // Cerrar modal con tecla ESC
  useEscapeKey(onCancel);
  // Referencia para detectar clicks fuera de la modal
  const modalRef = useRef<HTMLDivElement>(null);
  // Cerrar modal al hacer click fuera
  useClickOutside(modalRef, onCancel, true);

  const [formData, setFormData] = useState({
    equipo: "",
    serieCodigo: "",
    cantidad: "1",
    estadoEquipo: "" as "" | EstadoEquipo,
    responsable: "",
    fechaSalida: new Date().toISOString().split("T")[0],
    horaSalida: new Date().toTimeString().slice(0, 5),
    areaProyecto: "",
    fechaRetorno: "",
    horaRetorno: "",
    estadoRetorno: "" as EstadoRetorno,
    responsableRetorno: "",
  });
  const [isAutofilled, setIsAutofilled] = useState(false);
  const [searchingProduct, setSearchingProduct] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [inventoryProducts, setInventoryProducts] = useState<Product[]>([]);
  const [showProductList, setShowProductList] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [hasSelectedProduct, setHasSelectedProduct] = useState(false);

  useEffect(() => {
    if (!initialArea) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      areaProyecto: prev.areaProyecto || initialArea,
    }));
  }, [initialArea]);

  // Buscar productos en inventario cuando se escribe el codigo
  useEffect(() => {
    const searchTerm = formData.serieCodigo.trim();
    if (searchTerm.length < 2) {
      setInventoryProducts([]);
      setShowProductList(false);
      setSearchError(null);
      setSearchingProduct(false);
      setSelectedProduct(null);
      setIsAutofilled(false);
      return;
    }

    const debounceTimer = setTimeout(async () => {
      try {
        setSearchingProduct(true);
        const result = await inventoryService.getAllProducts(
          searchTerm,
          undefined,
          1,
          10
        );
        setInventoryProducts(result.data);

        const normalizedTerm = searchTerm.toLowerCase();
        const exactMatch = result.data.find(
          (item) => item.codigo.toLowerCase() === normalizedTerm
        );

        if (exactMatch) {
          setSelectedProduct(exactMatch);
          setHasSelectedProduct(true);
          setIsAutofilled(true);
          setFormData((prev) => ({
            ...prev,
            equipo: exactMatch.nombre,
          }));
          setShowProductList(false);
          setSearchError(null);
        } else {
          setSelectedProduct(null);
          setIsAutofilled(false);
          setShowProductList(!hasSelectedProduct && result.data.length > 0);
          setSearchError(
            result.data.length === 0 ? "Producto no encontrado" : null
          );
        }
      } catch (error) {
        console.error("Error searching products:", error);
        setSearchError("Error al buscar el producto");
        setInventoryProducts([]);
        setShowProductList(false);
        setSelectedProduct(null);
        setIsAutofilled(false);
      } finally {
        setSearchingProduct(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [formData.serieCodigo, hasSelectedProduct]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.estadoEquipo) {
      return;
    }

    // Verificar si hay datos de retorno completos (todos los campos deben estar llenos)
    const hasReturnData =
      formData.fechaRetorno &&
      formData.horaRetorno &&
      formData.estadoRetorno &&
      formData.responsableRetorno.trim();

    const equipmentData: CreateEquipmentData = {
      equipo: formData.equipo,
      serieCodigo: formData.serieCodigo,
      cantidad: parseInt(formData.cantidad, 10) || 1,
      estadoEquipo: formData.estadoEquipo,
      responsable: formData.responsable,
      tipo: tipoRegistro,
      fechaSalida: formData.fechaSalida,
      horaSalida: formData.horaSalida,
      areaProyecto: formData.areaProyecto,
    };

    // Agregar datos de retorno solo si están completos
    if (hasReturnData) {
      equipmentData.fechaRetorno = formData.fechaRetorno;
      equipmentData.horaRetorno = formData.horaRetorno;
      equipmentData.estadoRetorno = formData.estadoRetorno as
        | "Bueno"
        | "Regular"
        | "Malo"
        | "Danado";
      equipmentData.responsableRetorno = formData.responsableRetorno.trim();
    }

    onSubmit(equipmentData);
  };
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Si es el campo código, convertir a mayúsculas y limitar a 6 caracteres
    let processedValue = value;
    if (name === "serieCodigo") {
      processedValue = value.toUpperCase().slice(0, 6);
      setSelectedProduct(null);
      setIsAutofilled(false);
      setHasSelectedProduct(false);
      setSearchError(null);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));

    if (name === "serieCodigo") {
      setShowProductList(false);
    }
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setHasSelectedProduct(true);
    setIsAutofilled(true);
    setSearchError(null);
    setShowProductList(false);
    setFormData((prev) => ({
      ...prev,
      serieCodigo: product.codigo,
      equipo: product.nombre,
    }));
  };

  const labelClasses =
    "flex flex-col gap-1.5 text-xs font-semibold text-gray-700 dark:text-slate-200";
  const inputClasses =
    "w-full rounded-xl border border-gray-300 px-3 py-1.5 text-sm text-gray-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-500/30 [color-scheme:light] dark:[color-scheme:dark] cursor-pointer";
  const selectClasses =
    "w-full appearance-none rounded-xl border border-gray-300 px-3 py-1.5 pr-10 text-sm text-gray-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-500/30";
  const dividerClasses =
    "space-y-2 border-t border-gray-200 pt-2 dark:border-slate-800";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/50 backdrop-blur-sm dark:bg-slate-950/70">
      <div
        ref={modalRef}
        className="w-full max-w-3xl max-h-95vh overflow-hidden rounded-2xl sm:rounded-3xl bg-white shadow-2xl transition-colors dark:bg-slate-950 flex flex-col"
      >
        <div className="flex items-center justify-between rounded-t-2xl sm:rounded-t-3xl bg-gradient-to-r from-blue-500 to-blue-600 px-3 py-2 sm:px-4 text-white flex-shrink-0">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 sm:w-5 sm:h-5" />
            <h2 className="text-sm sm:text-base font-semibold">
              <span className="hidden sm:inline">Nueva Salida de Herramientas/Equipos</span>
              <span className="sm:hidden">Nuevo Reporte</span>
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1 transition-colors rounded-full hover:bg-white/20"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <form
            onSubmit={handleSubmit}
            className="px-3 pt-3 pb-3 sm:px-4 sm:pt-4 sm:pb-4 space-y-2 sm:space-y-2.5 bg-white dark:bg-slate-950"
          >
            <div className="grid gap-2 sm:gap-3 md:grid-cols-3">
              <label className={labelClasses}>
                <span>Código *</span>
                <div className="relative">
                  <input
                    type="text"
                    name="serieCodigo"
                    value={formData.serieCodigo}
                    onChange={handleChange}
                    className={inputClasses}
                    placeholder="Ej: ABC123"
                    required
                  />
                  {/* Indicador de estado */}
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    {searchingProduct && (
                      <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                    )}
                    {!searchingProduct && isAutofilled && (
                      <Check className="w-4 h-4 text-blue-500" />
                    )}
                    {!searchingProduct &&
                      searchError &&
                      formData.serieCodigo.length >= 2 && (
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                      )}
                  </div>
                  {searchingProduct && (
                    <div className="absolute left-0 top-full z-20 w-full mt-1 text-xs text-center bg-white border border-gray-300 rounded-md shadow-lg dark:bg-slate-800 dark:border-slate-700">
                      <div className="px-3 py-2 text-gray-500 dark:text-slate-300">
                        Buscando...
                      </div>
                    </div>
                  )}
                  {showProductList && inventoryProducts.length > 0 && (
                    <div className="absolute left-0 top-full z-20 w-full mt-1 overflow-y-auto bg-white border border-gray-300 rounded-md shadow-lg max-h-48 dark:bg-slate-800 dark:border-slate-700">
                      {inventoryProducts.map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => handleSelectProduct(product)}
                          className="flex flex-col w-full px-3 py-2 text-xs text-left hover:bg-gray-100 dark:hover:bg-slate-700"
                        >
                          <span className="font-medium text-gray-900 dark:text-slate-100">
                            {product.codigo} - {product.nombre}
                          </span>
                          <span className="text-gray-600 dark:text-slate-400">
                            Stock: {product.stockActual} | Costo: S/{" "}
                            {product.costoUnitario.toFixed(2)}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {!searchingProduct &&
                  searchError &&
                  formData.serieCodigo.length >= 2 && (
                    <span className="text-xs text-amber-600 dark:text-amber-400">
                      {searchError}
                    </span>
                  )}
              </label>

              <label className={labelClasses}>
                <span>Nombre *</span>
                <input
                  type="text"
                  name="equipo"
                  value={formData.equipo}
                  onChange={handleChange}
                  className={inputClasses}
                  placeholder="Nombre del equipo"
                  required
                />
              </label>

              <label className={labelClasses}>
                <span>Cantidad *</span>
                <input
                  type="number"
                  name="cantidad"
                  min="1"
                  value={formData.cantidad}
                  onChange={handleChange}
                  className={inputClasses}
                  required
                />
              </label>
            </div>

            <div className="grid gap-2 sm:gap-3 md:grid-cols-2">
              <label className={labelClasses}>
                <span>Estado del Equipo *</span>
                <div className="relative">
                  <select
                    name="estadoEquipo"
                    value={formData.estadoEquipo}
                    onChange={handleChange}
                    className={selectClasses}
                    required
                  >
                    <option value="">Todos los estados</option>
                    <option value="Bueno">Normal</option>
                    <option value="Regular">Bajo</option>
                    <option value="Malo">Crítico</option>
                  </select>
                  <ChevronDown className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 pointer-events-none right-4 top-1/2 dark:text-slate-500" />
                </div>
              </label>

              <label className={labelClasses}>
                <span>Responsable *</span>
                <input
                  type="text"
                  name="responsable"
                  value={formData.responsable}
                  onChange={handleChange}
                  className={inputClasses}
                  placeholder="Nombre del responsable"
                  required
                />
              </label>
            </div>

            <div className="grid gap-2 sm:gap-3 md:grid-cols-3">
              <label className={labelClasses}>
                <span>Fecha de Salida *</span>
                <DatePicker
                  selected={formData.fechaSalida ? parseISO(formData.fechaSalida) : null}
                  onChange={(date: Date | null) =>
                    setFormData((prev) => ({
                      ...prev,
                      fechaSalida: date ? date.toISOString().split("T")[0] : "",
                    }))
                  }
                  dateFormat="dd/MM/yyyy"
                  locale={es}
                  placeholderText="dd/mm/aaaa"
                  className={inputClasses}
                  required
                  portalId="root"
                />
              </label>

              <label className={labelClasses}>
                <span>Hora de Salida *</span>
                <input
                  type="time"
                  name="horaSalida"
                  value={formData.horaSalida}
                  onChange={handleChange}
                  className={inputClasses}
                  required
                />
              </label>

              <label className={labelClasses}>
                <span>Área/Proyecto *</span>
                <SearchableSelect
                  name="areaProyecto"
                  label=""
                  value={formData.areaProyecto}
                  onChange={(value) =>
                    setFormData({ ...formData, areaProyecto: value })
                  }
                  options={AREAS_MOVIMIENTOS}
                  placeholder="Selecciona un área"
                  required
                />
              </label>
            </div>

            <div className={dividerClasses}>
              <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-slate-100">
                Información de Retorno (Opcional)
              </h3>

              <div className="grid gap-2 sm:gap-3 md:grid-cols-2">
                <label className={labelClasses}>
                  <span>Fecha de Retorno</span>
                  <DatePicker
                    selected={formData.fechaRetorno ? parseISO(formData.fechaRetorno) : null}
                    onChange={(date: Date | null) =>
                      setFormData((prev) => ({
                        ...prev,
                        fechaRetorno: date ? date.toISOString().split("T")[0] : "",
                      }))
                    }
                    dateFormat="dd/MM/yyyy"
                    locale={es}
                    placeholderText="dd/mm/aaaa"
                    className={inputClasses}
                    portalId="root"
                  />
                </label>

                <label className={labelClasses}>
                  <span>Hora de Retorno</span>
                  <input
                    type="time"
                    name="horaRetorno"
                    value={formData.horaRetorno}
                    onChange={handleChange}
                    onFocus={(e) => {
                      if (!e.target.value) {
                        const now = new Date();
                        const hours = String(now.getHours()).padStart(2, "0");
                        const minutes = String(now.getMinutes()).padStart(
                          2,
                          "0"
                        );
                        const currentTime = `${hours}:${minutes}`;
                        setFormData((prev) => ({
                          ...prev,
                          horaRetorno: currentTime,
                        }));
                      }
                    }}
                    className={inputClasses}
                  />
                </label>
              </div>

              <div className="grid gap-2 sm:gap-3 md:grid-cols-2">
                <label className={labelClasses}>
                  <span>Estado de Retorno</span>
                  <div className="relative">
                    <select
                      name="estadoRetorno"
                      value={formData.estadoRetorno}
                      onChange={handleChange}
                      className={selectClasses}
                    >
                      <option value="">Selecciona un estado</option>
                      <option value="Bueno">Normal</option>
                      <option value="Regular">Bajo</option>
                      <option value="Malo">Crítico</option>
                    </select>
                    <ChevronDown className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 pointer-events-none right-4 top-1/2 dark:text-slate-500" />
                  </div>
                </label>

                <label className={labelClasses}>
                  <span>Responsable de Retorno</span>
                  <input
                    type="text"
                    name="responsableRetorno"
                    value={formData.responsableRetorno}
                    onChange={handleChange}
                    className={inputClasses}
                    placeholder="Nombre del responsable de recepción"
                  />
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2 border-t border-gray-200 dark:border-slate-800 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onCancel}
                className="w-full sm:w-auto px-4 py-2 sm:py-1.5 text-sm font-semibold text-gray-600 transition-colors border border-gray-300 rounded-full hover:bg-gray-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900/60"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 sm:py-1.5 text-sm font-semibold text-white transition-colors bg-blue-600 rounded-full shadow-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400"
              >
                Agregar Reporte
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
