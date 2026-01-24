import { useState, useEffect } from "react";
import { X } from "lucide-react";
import {
  CreatePurchaseOrderData,
  UpdatePurchaseOrderData,
} from "../services/purchase-orders.service.ts";
import { PurchaseOrder } from "../types/purchases.ts";

interface PurchaseOrderFormProps {
  order?: PurchaseOrder;
  onSubmit: (data: CreatePurchaseOrderData | UpdatePurchaseOrderData) => Promise<void>;
  onCancel: () => void;
  onDelete?: () => void;
}

export const PurchaseOrderForm = ({
  order,
  onSubmit,
  onCancel,
  onDelete,
}: PurchaseOrderFormProps) => {
  const isEdit = !!order;
  const [fecha, setFecha] = useState("");
  const [codigo, setCodigo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (order) {
      // Convertir DD/MM/YYYY a YYYY-MM-DD para el input date
      const dateParts = order.fecha.split("/");
      if (dateParts.length === 3) {
        const [day, month, year] = dateParts;
        setFecha(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`);
      }
      setCodigo(order.codigo);
    } else {
      // Nueva orden - fecha actual
      const today = new Date().toISOString().split("T")[0];
      setFecha(today);
    }
  }, [order]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Convertir YYYY-MM-DD a DD/MM/YYYY
      const [year, month, day] = fecha.split("-");
      const formattedDate = `${day}/${month}/${year}`;

      const data = {
        fecha: formattedDate,
        codigo: codigo.trim(),
        // Estado por defecto para nuevas órdenes
        estado: 'borrador' as const,
      };

      await onSubmit(data);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-lg shadow-2xl bg-white dark:bg-slate-900 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 border-orange-400/20">
          <h2 className="text-lg font-bold text-white">
            {isEdit ? "Editar Orden de Compra" : "Nueva Orden de Compra"}
          </h2>
          <button
            onClick={onCancel}
            className="text-white transition-colors hover:text-orange-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-slate-300">
              Fecha <span className="text-orange-500 dark:text-orange-400">*</span>
            </label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-700 text-gray-900 dark:text-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-400 dark:placeholder-slate-500"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-slate-300">
              Orden de Compra <span className="text-orange-500 dark:text-orange-400">*</span>
            </label>
            <input
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="OC-001"
              required
              disabled={isEdit}
              className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-700 text-gray-900 dark:text-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-400 dark:placeholder-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-2 pt-4 mt-2 border-t border-gray-200 dark:border-slate-800">
            {isEdit && onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="px-4 py-2 text-sm font-medium text-white transition-colors border rounded-lg bg-transparent border-red-500/50 hover:bg-red-500/10"
              >
                Eliminar
              </button>
            )}
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium transition-colors border rounded-lg text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 dark:from-orange-600 dark:to-orange-700 dark:hover:from-orange-700 dark:hover:to-orange-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? "Guardando..."
                : isEdit
                  ? "Guardar Cambios"
                  : "Crear Orden"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
