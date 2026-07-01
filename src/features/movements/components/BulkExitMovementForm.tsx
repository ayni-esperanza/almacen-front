import { useEffect, useRef, useState } from "react";
import { AlertCircle, Check, Loader2, Plus, Search, Trash2, X } from "lucide-react";
import DatePicker from "react-datepicker";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { SearchableSelect } from "../../../shared/components/SearchableSelect";
import { ReferenceCatalogs } from "../../../shared/hooks/useReferenceCatalogs";
import { CreateExitData } from "../../../shared/services/movements.service";
import { inventoryService, Product } from "../../../shared/services/inventory.service";

interface BulkExitMovementFormProps {
  catalogs: ReferenceCatalogs;
  onSubmit: (items: CreateExitData[]) => Promise<void>;
  onCancel: () => void;
}

interface ExitProductItem {
  product: Product;
  cantidad: number;
}

export const BulkExitMovementForm = ({
  catalogs,
  onSubmit,
  onCancel,
}: BulkExitMovementFormProps) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [responsable, setResponsable] = useState("");
  const [area, setArea] = useState("");
  const [proyecto, setProyecto] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cantidad, setCantidad] = useState("1");
  const [items, setItems] = useState<ExitProductItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const term = searchTerm.trim();
    if (term.length < 2 || selectedProduct?.codigo === term) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const response = await inventoryService.getAllProducts(term, undefined, 1, 10);
        setResults(
          response.data.filter(
            (product) => !items.some((item) => item.product.id === product.id),
          ),
        );
      } catch {
        setResults([]);
        setError("No se pudieron buscar productos.");
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedProduct, items]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmitting) onCancel();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isSubmitting, onCancel]);

  const selectProduct = (product: Product) => {
    setSelectedProduct(product);
    setSearchTerm(product.codigo);
    setResults([]);
    setCantidad("1");
    setError(null);
  };

  const addProduct = () => {
    if (!selectedProduct) {
      setError("Selecciona un producto del inventario.");
      return;
    }
    const parsedQuantity = Number.parseInt(cantidad, 10);
    if (!Number.isFinite(parsedQuantity) || parsedQuantity < 1) {
      setError("La cantidad debe ser al menos 1.");
      return;
    }
    if (parsedQuantity > selectedProduct.stockActual) {
      setError(
        `Stock insuficiente para ${selectedProduct.nombre}. Disponible: ${selectedProduct.stockActual}.`,
      );
      return;
    }

    setItems((current) => [...current, { product: selectedProduct, cantidad: parsedQuantity }]);
    setSelectedProduct(null);
    setSearchTerm("");
    setCantidad("1");
    setError(null);
  };

  const updateQuantity = (productId: number, value: string) => {
    const nextQuantity = Number.parseInt(value, 10);
    setItems((current) =>
      current.map((item) =>
        item.product.id === productId
          ? { ...item, cantidad: Number.isFinite(nextQuantity) ? nextQuantity : 0 }
          : item,
      ),
    );
  };

  const submitBatch = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedResponsible = responsable.trim();
    if (!trimmedResponsible) {
      setError("Ingresa el responsable de las salidas.");
      return;
    }
    if (!area) {
      setError("Selecciona un área.");
      return;
    }
    if (items.length === 0) {
      setError("Agrega al menos un producto.");
      return;
    }

    const invalidItem = items.find(
      (item) => item.cantidad < 1 || item.cantidad > item.product.stockActual,
    );
    if (invalidItem) {
      setError(
        `Revisa la cantidad de ${invalidItem.product.nombre}. Stock disponible: ${invalidItem.product.stockActual}.`,
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit(
        items.map(({ product, cantidad: itemQuantity }) => ({
          fecha,
          codigoProducto: product.codigo,
          descripcion: product.nombre,
          precioUnitario: product.costoUnitario,
          cantidad: itemQuantity,
          responsable: trimmedResponsible,
          area,
          proyecto: proyecto || undefined,
          empresa: empresa || undefined,
        })),
      );
    } catch (submissionError) {
      const createdCount =
        submissionError instanceof Error && "createdCount" in submissionError
          ? Number((submissionError as Error & { createdCount: number }).createdCount)
          : 0;
      if (createdCount > 0) {
        setItems((current) => current.slice(createdCount));
      }
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "No se pudieron registrar las salidas.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses =
    "w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-700 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-rose-400 dark:focus:ring-rose-500/30";

  return (
    <div
      className="system-modal-backdrop fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 p-3 backdrop-blur-sm dark:bg-slate-950/80 sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) onCancel();
      }}
    >
      <div
        ref={panelRef}
        className="system-modal-panel flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl dark:border dark:border-slate-800 dark:bg-slate-950"
      >
        <div className="flex items-center justify-between bg-gradient-to-r from-red-500 to-red-600 px-5 py-3 text-white">
          <div>
            <h2 className="text-base font-bold">Salida de varios productos</h2>
          </div>
          <button type="button" onClick={onCancel} disabled={isSubmitting} className="rounded-full p-1 hover:bg-white/20">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={submitBatch} className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
            <label className="text-xs font-semibold text-gray-700 dark:text-slate-200">
              <span className="mb-1 block">Fecha *</span>
              <DatePicker
                selected={fecha ? parseISO(fecha) : null}
                onChange={(date: Date | null) => setFecha(date ? format(date, "yyyy-MM-dd") : "")}
                className={inputClasses}
                wrapperClassName="w-full"
                dateFormat="dd/MM/yyyy"
                locale={es}
                portalId="root"
                required
              />
            </label>
            <label className="text-xs font-semibold text-gray-700 dark:text-slate-200">
              <span className="mb-1 block">Responsable *</span>
              <input value={responsable} onChange={(event) => setResponsable(event.target.value)} className={inputClasses} placeholder="Nombre del responsable" required />
            </label>
            <div><SearchableSelect name="bulk-area" label="Área" value={area} onChange={setArea} options={catalogs.areas} placeholder="Selecciona un área" required /></div>
            <div><SearchableSelect name="bulk-project" label="Proyecto" value={proyecto} onChange={setProyecto} options={catalogs.proyectos} placeholder="Proyecto" /></div>
            <div><SearchableSelect name="bulk-company" label="Empresa" value={empresa} onChange={setEmpresa} options={catalogs.empresas} placeholder="Empresa" /></div>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
            <div className="relative lg:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-slate-200">Buscar producto *</label>
              <div className="relative">
                <input
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value.toUpperCase().slice(0, 50));
                    setSelectedProduct(null);
                  }}
                  className={`${inputClasses} pr-9`}
                  placeholder="Código o nombre del producto"
                />
                {isSearching ? <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-red-500" /> : <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />}
              </div>
              {results.length > 0 && (
                <div className="absolute z-20 mt-1 max-h-52 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
                  {results.map((product) => (
                    <button key={product.id} type="button" onClick={() => selectProduct(product)} className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-xs hover:bg-red-50 dark:hover:bg-slate-800">
                      <span><strong>{product.codigo}</strong> · {product.nombre}</span>
                      <span className="whitespace-nowrap text-gray-500 dark:text-slate-400">Stock: {product.stockActual}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="lg:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-slate-200">Producto seleccionado</label>
              <div className={`${inputClasses} flex min-h-[38px] items-center gap-2 bg-gray-50 dark:bg-slate-900`}>
                {selectedProduct ? <><Check className="h-4 w-4 text-green-500" /><span className="truncate">{selectedProduct.nombre} · Stock {selectedProduct.stockActual}</span></> : <span className="text-gray-400">Selecciona un resultado</span>}
              </div>
            </div>
            <div className="flex items-end gap-2">
              <label className="flex-1 text-xs font-semibold text-gray-700 dark:text-slate-200">
                <span className="mb-1 block">Cantidad *</span>
                <input type="number" min={1} max={selectedProduct?.stockActual} value={cantidad} onChange={(event) => setCantidad(event.target.value)} className={inputClasses} />
              </label>
              <button type="button" onClick={addProduct} className="mb-px inline-flex h-[38px] items-center gap-1 rounded-xl bg-red-500 px-3 text-sm font-semibold text-white hover:bg-red-600">
                <Plus className="h-4 w-4" /> Agregar
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-800">
            <div className="flex items-center justify-between bg-gray-50 px-4 py-2 dark:bg-slate-900">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-slate-100">Productos agregados</h3>
              <span className="text-xs text-gray-500">{items.length} producto{items.length === 1 ? "" : "s"}</span>
            </div>
            <div className="movement-modal-scroll max-h-56 overflow-y-auto">
              {items.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-gray-500 dark:text-slate-400">Aún no agregaste productos.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-white text-left text-xs text-gray-500 dark:bg-slate-950 dark:text-slate-400"><tr><th className="px-4 py-2">Código</th><th className="px-4 py-2">Producto</th><th className="px-4 py-2">Stock</th><th className="px-4 py-2">Cantidad</th><th className="px-4 py-2 text-right">Acción</th></tr></thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.product.id} className="border-t border-gray-100 dark:border-slate-800">
                        <td className="px-4 py-2 font-medium">{item.product.codigo}</td>
                        <td className="px-4 py-2">{item.product.nombre}</td>
                        <td className="px-4 py-2">{item.product.stockActual}</td>
                        <td className="px-4 py-2"><input type="number" min={1} max={item.product.stockActual} value={item.cantidad || ""} onChange={(event) => updateQuantity(item.product.id, event.target.value)} className="w-24 rounded-lg border border-gray-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-900" /></td>
                        <td className="px-4 py-2 text-right"><button type="button" onClick={() => setItems((current) => current.filter((currentItem) => currentItem.product.id !== item.product.id))} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10" title="Quitar producto"><Trash2 className="h-4 w-4" /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {error && <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}

          <div className="flex justify-end gap-2 border-t border-gray-200 pt-3 dark:border-slate-800">
            <button type="button" onClick={onCancel} disabled={isSubmitting} className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900">Cancelar</button>
            <button type="submit" disabled={isSubmitting || items.length === 0} className="inline-flex items-center gap-2 rounded-full bg-red-500 px-5 py-2 text-sm font-semibold text-white shadow-md hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? "Registrando..." : `Registrar ${items.length} salida${items.length === 1 ? "" : "s"}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
