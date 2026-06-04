import React, { useState, useRef, useEffect } from "react";
import { X, Check, Loader2, AlertCircle } from "lucide-react";
import DatePicker from "react-datepicker";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { useModalScrollLock } from "../../../shared/hooks/useModalScrollLock";
import { useEscapeKey } from "../../../shared/hooks/useEscapeKey";
import { useClickOutside } from "../../../shared/hooks/useClickOutside";
import { SearchableSelect } from "../../../shared/components/SearchableSelect";
import { ReferenceCatalogs } from "../../../shared/hooks/useReferenceCatalogs";
import {
  inventoryService,
  Product,
} from "../../../shared/services/inventory.service";

interface AddMovementFormProps {
  type: "entrada" | "salida";
  onSubmit: (data: any) => void;
  onCancel: () => void;
  catalogs: ReferenceCatalogs;
}

export const AddMovementForm: React.FC<AddMovementFormProps> = ({
  type,
  onSubmit,
  onCancel,
  catalogs,
}) => {
  // Bloquear scroll de la ventana
  useModalScrollLock(true);
  // Cerrar modal con tecla ESC
  useEscapeKey(onCancel, true);
  // Referencia para detectar clicks fuera de la modal
  const modalRef = useRef<HTMLDivElement>(null);
  // Cerrar modal al hacer click fuera
  useClickOutside(modalRef, onCancel, true);

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
    empresa: "",
  }));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAutofilled, setIsAutofilled] = useState(false);
  const [searchingProduct, setSearchingProduct] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [inventoryProducts, setInventoryProducts] = useState<Product[]>([]);
  const [showProductList, setShowProductList] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [hasSelectedProduct, setHasSelectedProduct] = useState(false);
  const [stockWarning, setStockWarning] = useState<{
    type: "sin-stock" | "stock-bajo" | null;
    message: string | null;
  }>({ type: null, message: null });

  // Buscar productos en inventario cuando se escribe el codigo
  useEffect(() => {
    const searchTerm = formData.codigoProducto.trim();
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
          10,
        );
        setInventoryProducts(result.data);

        const normalizedTerm = searchTerm.toLowerCase();
        const exactMatch = result.data.find(
          (item) => item.codigo.toLowerCase() === normalizedTerm,
        );

        if (exactMatch) {
          setSelectedProduct(exactMatch);
          setHasSelectedProduct(true);
          setIsAutofilled(true);
          setFormData((prev) => ({
            ...prev,
            descripcion: exactMatch.nombre,
            precioUnitario: exactMatch.costoUnitario.toString(),
          }));
          setShowProductList(false);
          setSearchError(null);
        } else {
          setSelectedProduct(null);
          setIsAutofilled(false);
          setShowProductList(!hasSelectedProduct && result.data.length > 0);
          setSearchError(
            result.data.length === 0 ? "Producto no encontrado" : null,
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
  }, [formData.codigoProducto, hasSelectedProduct]);

  // Verificar stock cuando cambia la cantidad en salidas
  useEffect(() => {
    if (!isEntry && selectedProduct && isAutofilled) {
      const cantidad = parseInt(formData.cantidad) || 0;
      checkStock(selectedProduct.stockActual, cantidad);
    }
  }, [formData.cantidad, selectedProduct, isEntry, isAutofilled]);

  const checkStock = (stockActual: number, cantidadSolicitada: number) => {
    if (stockActual === 0) {
      setStockWarning({
        type: "sin-stock",
        message: `Este producto NO tiene stock disponible. Stock actual: 0 unidades.`,
      });
    } else if (cantidadSolicitada > stockActual) {
      setStockWarning({
        type: "stock-bajo",
        message: `Stock insuficiente. Disponible: ${stockActual} unidades. Solicitado: ${cantidadSolicitada} unidades.`,
      });
    } else if (stockActual <= 10) {
      setStockWarning({
        type: null,
        message: `Stock bajo. Disponible: ${stockActual} unidades.`,
      });
    } else {
      setStockWarning({ type: null, message: null });
    }
  };

  const entryInputClasses =
    "w-full rounded-xl border border-gray-300 px-3 py-1.5 text-sm text-gray-700 outline-none focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-emerald-400 dark:focus:ring-emerald-500/40 [color-scheme:light] dark:[color-scheme:dark] cursor-pointer";
  const exitInputClasses =
    "w-full rounded-xl border border-gray-300 px-3 py-1.5 text-sm text-gray-700 outline-none focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-rose-400 dark:focus:ring-rose-500/40 [color-scheme:light] dark:[color-scheme:dark] cursor-pointer";

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

    // Verificar stock para salidas
    if (!isEntry && selectedProduct) {
      if (selectedProduct.stockActual === 0) {
        setErrorMessage(
          "No se puede registrar la salida. El producto no tiene stock disponible."
        );
        return;
      }

      if (parsedQuantity > selectedProduct.stockActual) {
        setErrorMessage(
          `No se puede registrar la salida. Stock insuficiente (disponible: ${selectedProduct.stockActual}, solicitado: ${parsedQuantity}).`
        );
        return;
      }
    }

    setErrorMessage(null);

    onSubmit({
      ...formData,
      empresa: formData.empresa || undefined,
      precioUnitario: Number.isFinite(parsedPrice) ? parsedPrice : 0,
      cantidad: parsedQuantity || 1,
      id: Date.now().toString(),
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Si es el campo código, convertir a mayúsculas y limitar a 6 caracteres
    let processedValue = value;
    if (name === "codigoProducto") {
      processedValue = value.toUpperCase().slice(0, 6);
      setSelectedProduct(null);
      setIsAutofilled(false);
      setHasSelectedProduct(false);
      setSearchError(null);
      setStockWarning({ type: null, message: null });
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));

    if (name === "codigoProducto") {
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
      codigoProducto: product.codigo,
      descripcion: product.nombre,
      precioUnitario: product.costoUnitario.toString(),
    }));

    if (!isEntry) {
      checkStock(product.stockActual, parseInt(formData.cantidad) || 0);
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
      <div
        ref={modalRef}
        className="w-full max-w-3xl max-h-[95vh] overflow-visible rounded-3xl bg-white shadow-2xl dark:bg-slate-950 dark:border dark:border-slate-800 flex flex-col"
      >
        <div
          className={`flex items-center justify-between rounded-t-3xl bg-gradient-to-r ${gradientColor} px-4 py-2 text-white flex-shrink-0`}
        >
          <h2 className="text-base font-semibold">
            {isEntry ? "Nueva Entrada de Producto" : "Nueva Salida de Producto"}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="p-1 transition-colors rounded-full hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-visible">
          <form onSubmit={handleSubmit} className="px-4 pt-4 pb-4 space-y-2">
            {isEntry ? (
              <>
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="flex flex-col gap-1.5 text-xs font-semibold text-gray-700 dark:text-slate-200">
                    <span>Código del Producto *</span>
                    <div className="relative">
                      <input
                        type="text"
                        name="codigoProducto"
                        value={formData.codigoProducto}
                        onChange={handleChange}
                        className={entryInputClasses}
                        placeholder="Ej: ABC123"
                        required
                      />
                      {/* Indicador de estado */}
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        {searchingProduct && (
                          <Loader2 className="w-4 h-4 text-green-500 animate-spin" />
                        )}
                        {!searchingProduct && isAutofilled && (
                          <Check className="w-4 h-4 text-green-500" />
                        )}
                        {!searchingProduct &&
                          searchError &&
                          formData.codigoProducto.length >= 2 && (
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
                      formData.codigoProducto.length >= 2 && (
                        <span className="text-xs text-amber-600 dark:text-amber-400">
                          {searchError}
                        </span>
                      )}
                  </label>

                  <label className="flex flex-col gap-1.5 text-xs font-semibold text-gray-700 dark:text-slate-200">
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

                <div className="grid gap-3 md:grid-cols-2">
                  <label className="flex flex-col gap-1.5 text-xs font-semibold text-gray-700 dark:text-slate-200">
                    <span>Fecha *</span>
                    <DatePicker
                      id="add-movement-date-entry"
                      selected={formData.fecha ? parseISO(formData.fecha) : null}
                      onChange={(date: Date | null) =>
                        handleChange({
                          target: {
                            name: "fecha",
                            value: date ? format(date, "yyyy-MM-dd") : "",
                          },
                        } as any)
                      }
                      className={entryInputClasses}
                      dateFormat="dd/MM/yyyy"
                      locale={es}
                      portalId="root"
                      calendarClassName="app-datepicker app-datepicker--green"
                      popperClassName="app-datepicker-popper app-datepicker-popper--green"
                      fixedHeight
                      required
                    />
                  </label>

                  <label className="flex flex-col gap-1.5 text-xs font-semibold text-gray-700 dark:text-slate-200">
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

                <div className="grid gap-3 md:grid-cols-2">
                  <label className="flex flex-col gap-1.5 text-xs font-semibold text-gray-700 dark:text-slate-200">
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

                  <div className="w-full">
                    <SearchableSelect
                      name="area"
                      label="Área"
                      value={formData.area}
                      onChange={(value) =>
                        setFormData({ ...formData, area: value })
                      }
                      options={catalogs.areas}
                      placeholder="Selecciona un área"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="flex flex-col gap-1.5 text-xs font-semibold text-gray-700 dark:text-slate-200">
                    <span className="flex items-center gap-2">Fecha *</span>
                    <DatePicker
                      id="add-movement-date-exit"
                      selected={formData.fecha ? parseISO(formData.fecha) : null}
                      onChange={(date: Date | null) =>
                        handleChange({
                          target: {
                            name: "fecha",
                            value: date ? format(date, "yyyy-MM-dd") : "",
                          },
                        } as any)
                      }
                      className={exitInputClasses}
                      dateFormat="dd/MM/yyyy"
                      locale={es}
                      portalId="root"
                      calendarClassName="app-datepicker app-datepicker--red"
                      popperClassName="app-datepicker-popper app-datepicker-popper--red"
                      fixedHeight
                      required
                    />
                  </label>

                  <label className="flex flex-col gap-1.5 text-xs font-semibold text-gray-700 dark:text-slate-200">
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
                        {searchingProduct && (
                          <Loader2 className="w-4 h-4 text-red-500 animate-spin" />
                        )}
                        {!searchingProduct && isAutofilled && (
                          <Check className="w-4 h-4 text-red-500" />
                        )}
                        {!searchingProduct &&
                          searchError &&
                          formData.codigoProducto.length >= 2 && (
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
                      formData.codigoProducto.length >= 2 && (
                        <span className="text-xs text-amber-600 dark:text-amber-400">
                          {searchError}
                        </span>
                      )}
                  </label>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <label className="flex flex-col gap-1.5 text-xs font-semibold text-gray-700 dark:text-slate-200">
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

                  <label className="flex flex-col gap-1.5 text-xs font-semibold text-gray-700 dark:text-slate-200">
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

                  <label className="flex flex-col gap-1.5 text-xs font-semibold text-gray-700 dark:text-slate-200">
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

                {/* Notificación de stock */}
                {stockWarning.message && (
                  <div
                    className={`flex items-start gap-3 px-3 py-2 rounded-xl border ${
                      stockWarning.type === "sin-stock"
                        ? "bg-red-50 border-red-300 text-red-800 dark:bg-red-900/20 dark:border-red-700 dark:text-red-200"
                        : stockWarning.type === "stock-bajo"
                        ? "bg-amber-50 border-amber-300 text-amber-800 dark:bg-amber-900/20 dark:border-amber-700 dark:text-amber-200"
                        : "bg-blue-50 border-blue-300 text-blue-800 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-200"
                    }`}
                  >
                    <AlertCircle className="flex-shrink-0 w-5 h-5 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold">
                        {stockWarning.type === "sin-stock"
                          ? "Sin Stock Disponible"
                          : stockWarning.type === "stock-bajo"
                          ? "Stock Insuficiente"
                          : "Advertencia de Stock"}
                      </p>
                      <p className="mt-1 text-xs">{stockWarning.message}</p>
                    </div>
                  </div>
                )}

                <div className="grid gap-3 md:grid-cols-3">
                  <div className="w-full">
                    <SearchableSelect
                      name="area"
                      label="Área *"
                      value={formData.area}
                      onChange={(value) =>
                        setFormData({ ...formData, area: value })
                      }
                      options={catalogs.areas}
                      placeholder="Selecciona un área"
                      required
                    />
                  </div>

                  <div className="w-full">
                    <SearchableSelect
                      name="proyecto"
                      label="Proyecto"
                      value={formData.proyecto}
                      onChange={(value) =>
                        setFormData({ ...formData, proyecto: value })
                      }
                      options={catalogs.proyectos}
                      placeholder="Proyecto asignado"
                    />
                  </div>

                  <div className="w-full">
                    <SearchableSelect
                      name="empresa"
                      label="Empresa"
                      value={formData.empresa}
                      onChange={(value) =>
                        setFormData({ ...formData, empresa: value })
                      }
                      options={catalogs.empresas}
                      placeholder="Selecciona una empresa"
                    />
                  </div>
                </div>
              </>
            )}

            {errorMessage && (
              <div className="px-3 py-2 text-sm text-red-700 border border-red-200 rounded-xl bg-red-50">
                {errorMessage}
              </div>
            )}

            <div className="flex flex-col gap-2 pt-2 border-t border-gray-200 dark:border-slate-800 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-1.5 text-sm font-semibold text-gray-600 transition-colors border border-gray-300 rounded-full hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={`rounded-full px-4 py-1.5 text-sm font-semibold text-white shadow-md transition-colors ${buttonColor}`}
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
