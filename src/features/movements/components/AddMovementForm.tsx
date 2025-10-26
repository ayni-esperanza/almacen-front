import React, { useState, useEffect } from "react";
import { ChevronDown, X, Check, Loader2, AlertCircle } from "lucide-react";
import { areas } from "../../inventory/data/mockData.ts";
import { useModalScrollLock } from "../../../shared/hooks/useModalScrollLock";
import { useProductAutocomplete } from "../../../shared/hooks/useProductAutocomplete";

interface AddMovementFormProps {
  type: "entrada" | "salida";
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const AddMovementForm: React.FC<AddMovementFormProps> = ({
  type,
  onSubmit,
  onCancel,
}) => {
  // Bloquear scroll de la ventana
  useModalScrollLock(true);

  const isEntry = type === "entrada";
  const [formData, setFormData] = useState(() => ({
    fecha: new Date().toISOString().split("T")[0],
    codigoProducto: "",
    descripcion: "",
    precioUnitario: isEntry ? "" : "0",
    cantidad: "1",
    responsable: "",
    area: "",
    proyecto: "",
  }));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAutofilled, setIsAutofilled] = useState(false);

  // Hook de autocompletado
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
    if (product && formData.codigoProducto === product.codigo) {
      setFormData((prev) => ({
        ...prev,
        descripcion: product.nombre,
        precioUnitario: product.costoUnitario.toString(),
      }));
      setIsAutofilled(true);
      setErrorMessage(null);
    }
  }, [product, formData.codigoProducto]);

  const entryInputClasses =
    "w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-700 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-emerald-400 dark:focus:ring-emerald-500/40";
  const exitInputClasses =
    "w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-700 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-rose-400 dark:focus:ring-rose-500/40";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedQuantity = parseInt(formData.cantidad, 10);
    if (!Number.isFinite(parsedQuantity) || parsedQuantity < 1) {
      setErrorMessage("La cantidad debe ser al menos 1.");
      return;
    }

    const parsedPrice = parseFloat(formData.precioUnitario || "0");
    if (isEntry && (!Number.isFinite(parsedPrice) || parsedPrice <= 0)) {
      setErrorMessage("El precio unitario debe ser mayor a 0.");
      return;
    }

    setErrorMessage(null);

    onSubmit({
      ...formData,
      precioUnitario: Number.isFinite(parsedPrice) ? parsedPrice : 0,
      cantidad: parsedQuantity || 1,
      id: Date.now().toString(),
    });
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
    if (name === "codigoProducto") {
      setIsAutofilled(false);
      if (value.length >= 2) {
        searchProduct(value);
      } else {
        reset();
      }
    }
  };

  const gradientColor = isEntry
    ? "from-green-500 to-green-600"
    : "from-red-500 to-red-600";
  const buttonColor = isEntry
    ? "bg-green-600 hover:bg-green-700"
    : "bg-red-500 hover:bg-red-600";
  const primaryButtonLabel = isEntry ? "Guardar" : "Agregar Producto";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm dark:bg-slate-950/70">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-[32px] bg-white shadow-2xl dark:bg-slate-950 dark:border dark:border-slate-800 flex flex-col">
        <div
          className={`flex items-center justify-between rounded-t-[32px] bg-gradient-to-r ${gradientColor} px-6 py-4 text-white flex-shrink-0`}
        >
          <h2 className="text-xl font-semibold">
            {isEntry ? "Nueva Entrada de Producto" : "Nueva Salida de Producto"}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="p-1 transition-colors rounded-full hover:bg-white/20"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="px-8 pt-6 pb-8 space-y-8">
            {isEntry ? (
              <>
                <div className="grid gap-5 md:grid-cols-2">
                  <label className="flex flex-col gap-2 text-sm font-semibold text-gray-700 dark:text-slate-200">
                    <span>Código del Producto *</span>
                    <div className="relative">
                      <input
                        type="text"
                        name="codigoProducto"
                        value={formData.codigoProducto}
                        onChange={handleChange}
                        className={entryInputClasses}
                        placeholder="Ingresa el código"
                        required
                      />
                      {/* Indicador de estado */}
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        {isLoading && (
                          <Loader2 className="w-4 h-4 text-green-500 animate-spin" />
                        )}
                        {!isLoading && isAutofilled && (
                          <Check className="w-4 h-4 text-green-500" />
                        )}
                        {!isLoading &&
                          autocompleteError &&
                          formData.codigoProducto.length >= 2 && (
                            <AlertCircle className="w-4 h-4 text-amber-500" />
                          )}
                      </div>
                    </div>
                    {!isLoading &&
                      autocompleteError &&
                      formData.codigoProducto.length >= 2 && (
                        <span className="text-xs text-amber-600 dark:text-amber-400">
                          {autocompleteError}
                        </span>
                      )}
                  </label>

                  <label className="flex flex-col gap-2 text-sm font-semibold text-gray-700 dark:text-slate-200">
                    <span>Nombre *</span>
                    <input
                      type="text"
                      name="descripcion"
                      value={formData.descripcion}
                      onChange={handleChange}
                      className={entryInputClasses}
                      placeholder="Nombre del producto"
                      required
                    />
                  </label>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <label className="flex flex-col gap-2 text-sm font-semibold text-gray-700 dark:text-slate-200">
                    <span>Fecha *</span>
                    <input
                      type="date"
                      name="fecha"
                      value={formData.fecha}
                      onChange={handleChange}
                      className={entryInputClasses}
                      required
                    />
                  </label>

                  <label className="flex flex-col gap-2 text-sm font-semibold text-gray-700 dark:text-slate-200">
                    <span>Cantidad *</span>
                    <input
                      type="number"
                      name="cantidad"
                      value={formData.cantidad}
                      onChange={handleChange}
                      className={entryInputClasses}
                      placeholder="Ingresa la cantidad"
                      min={1}
                      required
                    />
                  </label>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <label className="flex flex-col gap-2 text-sm font-semibold text-gray-700 dark:text-slate-200">
                    <span>Precio Unitario (S/)</span>
                    <input
                      type="number"
                      step="0.01"
                      name="precioUnitario"
                      value={formData.precioUnitario}
                      onChange={handleChange}
                      min="0.01"
                      className={entryInputClasses}
                      placeholder="0.00"
                      required
                    />
                  </label>

                  <label className="flex flex-col gap-2 text-sm font-semibold text-gray-700 dark:text-slate-200">
                    <span>Área</span>
                    <input
                      type="text"
                      name="area"
                      value={formData.area}
                      onChange={handleChange}
                      className={entryInputClasses}
                      placeholder="Área o proyecto"
                    />
                  </label>
                </div>
              </>
            ) : (
              <>
                <div className="grid gap-5 md:grid-cols-2">
                  <label className="flex flex-col gap-2 text-sm font-semibold text-gray-700 dark:text-slate-200">
                    <span className="flex items-center gap-2">Fecha *</span>
                    <input
                      type="date"
                      name="fecha"
                      value={formData.fecha}
                      onChange={handleChange}
                      className={exitInputClasses}
                      required
                    />
                  </label>

                  <label className="flex flex-col gap-2 text-sm font-semibold text-gray-700 dark:text-slate-200">
                    <span>Código *</span>
                    <div className="relative">
                      <input
                        type="text"
                        name="codigoProducto"
                        value={formData.codigoProducto}
                        onChange={handleChange}
                        className={exitInputClasses}
                        placeholder="Ingresa el código"
                        required
                      />
                      {/* Indicador de estado */}
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        {isLoading && (
                          <Loader2 className="w-4 h-4 text-red-500 animate-spin" />
                        )}
                        {!isLoading && isAutofilled && (
                          <Check className="w-4 h-4 text-red-500" />
                        )}
                        {!isLoading &&
                          autocompleteError &&
                          formData.codigoProducto.length >= 2 && (
                            <AlertCircle className="w-4 h-4 text-amber-500" />
                          )}
                      </div>
                    </div>
                    {!isLoading &&
                      autocompleteError &&
                      formData.codigoProducto.length >= 2 && (
                        <span className="text-xs text-amber-600 dark:text-amber-400">
                          {autocompleteError}
                        </span>
                      )}
                  </label>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <label className="flex flex-col gap-2 text-sm font-semibold text-gray-700 dark:text-slate-200">
                    <span>Nombre *</span>
                    <input
                      type="text"
                      name="descripcion"
                      value={formData.descripcion}
                      onChange={handleChange}
                      className={exitInputClasses}
                      placeholder="Nombre del producto"
                      required
                    />
                  </label>

                  <label className="flex flex-col gap-2 text-sm font-semibold text-gray-700 dark:text-slate-200">
                    <span>Cantidad *</span>
                    <input
                      type="number"
                      name="cantidad"
                      value={formData.cantidad}
                      onChange={handleChange}
                      className={exitInputClasses}
                      placeholder="Ingresa la cantidad"
                      min={1}
                      required
                    />
                  </label>
                </div>

                <div className="grid gap-5 md:grid-cols-3">
                  <label className="flex flex-col gap-2 text-sm font-semibold text-gray-700 dark:text-slate-200">
                    <span>Área *</span>
                    <div className="relative">
                      <ChevronDown className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 pointer-events-none right-4 top-1/2 dark:text-slate-500" />
                      <select
                        name="area"
                        value={formData.area}
                        onChange={handleChange}
                        className={`${exitInputClasses} appearance-none`}
                        required
                      >
                        <option value="" disabled>
                          Todas las áreas
                        </option>
                        {areas.map((area) => (
                          <option key={area} value={area}>
                            {area}
                          </option>
                        ))}
                      </select>
                    </div>
                  </label>

                  <label className="flex flex-col gap-2 text-sm font-semibold text-gray-700 dark:text-slate-200">
                    <span>Proyecto *</span>
                    <input
                      type="text"
                      name="proyecto"
                      value={formData.proyecto}
                      onChange={handleChange}
                      className={exitInputClasses}
                      placeholder="Proyecto asignado"
                      required
                    />
                  </label>

                  <label className="flex flex-col gap-2 text-sm font-semibold text-gray-700 dark:text-slate-200">
                    <span>Responsable *</span>
                    <input
                      type="text"
                      name="responsable"
                      value={formData.responsable}
                      onChange={handleChange}
                      className={exitInputClasses}
                      placeholder="Nombre del responsable"
                      required
                    />
                  </label>
                </div>
              </>
            )}

            {errorMessage && (
              <div className="px-4 py-3 text-sm text-red-700 border border-red-200 rounded-2xl bg-red-50">
                {errorMessage}
              </div>
            )}

            <div className="flex flex-col gap-4 pt-6 border-t border-gray-200 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 text-sm font-semibold text-gray-600 transition-colors border border-gray-300 rounded-full hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={`rounded-full px-6 py-2 text-sm font-semibold text-white shadow-md transition-colors ${buttonColor}`}
              >
                {primaryButtonLabel}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
