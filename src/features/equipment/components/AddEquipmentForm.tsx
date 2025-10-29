import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  Wrench,
  X,
  Check,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { CreateEquipmentData } from "../../../shared/services/equipment.service";
import { useProductAutocomplete } from "../../../shared/hooks/useProductAutocomplete";
import { SearchableSelect } from "../../../shared/components/SearchableSelect";

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
}

type EstadoEquipo = CreateEquipmentData["estadoEquipo"];
type EstadoRetorno = "" | "Bueno" | "Regular" | "Malo" | "Danado";

export const AddEquipmentForm: React.FC<AddEquipmentFormProps> = ({
  onSubmit,
  onCancel,
}) => {
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

  // Hook de autocompletado de productos
  const {
    product,
    isLoading,
    error: autocompleteError,
    searchProduct,
    reset,
  } = useProductAutocomplete({
    debounceMs: 400,
    minChars: 2,
  });

  // Efecto para autocompletar cuando se encuentre un producto
  useEffect(() => {
    if (product && formData.serieCodigo === product.codigo) {
      setFormData((prev) => ({
        ...prev,
        equipo: product.nombre,
      }));
      setIsAutofilled(true);
    }
  }, [product, formData.serieCodigo]);

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

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Si cambia el código del producto, buscar autocompletado
    if (name === "serieCodigo") {
      setIsAutofilled(false);
      if (value.length >= 2) {
        searchProduct(value);
      } else {
        reset();
      }
    }
  };

  const labelClasses =
    "flex flex-col gap-2 text-sm font-semibold text-gray-700 dark:text-slate-200";
  const inputClasses =
    "w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-500/30";
  const selectClasses =
    "w-full appearance-none rounded-2xl border border-gray-300 px-4 py-3 pr-12 text-sm text-gray-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-500/30";
  const dividerClasses =
    "space-y-6 border-t border-gray-200 pt-6 dark:border-slate-800";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm dark:bg-slate-950/70">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[32px] border border-transparent bg-white shadow-2xl transition-colors dark:border-slate-800 dark:bg-slate-950 flex flex-col">
        <div className="flex items-center justify-between rounded-t-[32px] bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 text-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <Wrench className="w-6 h-6" />
            <h2 className="text-xl font-semibold">
              Nueva Salida de Herramientas/Equipos
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1 transition-colors rounded-full hover:bg-white/20"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <form
            onSubmit={handleSubmit}
            className="px-8 pt-6 pb-8 space-y-8 bg-white dark:bg-slate-950"
          >
            <div className="grid gap-5 md:grid-cols-3">
              <label className={labelClasses}>
                <span>Código *</span>
                <div className="relative">
                  <input
                    type="text"
                    name="serieCodigo"
                    value={formData.serieCodigo}
                    onChange={handleChange}
                    className={inputClasses}
                    placeholder="Ingresa código"
                    required
                  />
                  {/* Indicador de estado */}
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    {isLoading && (
                      <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                    )}
                    {!isLoading && isAutofilled && (
                      <Check className="w-4 h-4 text-blue-500" />
                    )}
                    {!isLoading &&
                      autocompleteError &&
                      formData.serieCodigo.length >= 2 && (
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                      )}
                  </div>
                </div>
                {!isLoading &&
                  autocompleteError &&
                  formData.serieCodigo.length >= 2 && (
                    <span className="text-xs text-amber-600 dark:text-amber-400">
                      {autocompleteError}
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

            <div className="grid gap-5 md:grid-cols-2">
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

            <div className="grid gap-5 md:grid-cols-3">
              <label className={labelClasses}>
                <span>Fecha de Salida *</span>
                <input
                  type="date"
                  name="fechaSalida"
                  value={formData.fechaSalida}
                  onChange={handleChange}
                  className={inputClasses}
                  required
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
              <h3 className="text-base font-semibold text-gray-900 dark:text-slate-100">
                Información de Retorno (Opcional)
              </h3>

              <div className="grid gap-5 md:grid-cols-2">
                <label className={labelClasses}>
                  <span>Fecha de Retorno</span>
                  <input
                    type="date"
                    name="fechaRetorno"
                    value={formData.fechaRetorno}
                    onChange={handleChange}
                    onFocus={(e) => {
                      if (!e.target.value) {
                        const today = new Date().toISOString().split("T")[0];
                        setFormData((prev) => ({
                          ...prev,
                          fechaRetorno: today,
                        }));
                      }
                    }}
                    className={inputClasses}
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

              <div className="grid gap-5 md:grid-cols-2">
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

            <div className="flex flex-col gap-4 pt-6 border-t border-gray-200 dark:border-slate-800 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 text-sm font-semibold text-gray-600 transition-colors border border-gray-300 rounded-full hover:bg-gray-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900/60"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2 text-sm font-semibold text-white transition-colors bg-blue-600 rounded-full shadow-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400"
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
