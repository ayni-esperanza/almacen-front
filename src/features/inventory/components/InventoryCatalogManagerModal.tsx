import { useMemo, useRef, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useEscapeKey } from "../../../shared/hooks/useEscapeKey";
import { useClickOutside } from "../../../shared/hooks/useClickOutside";
import { useModalScrollLock } from "../../../shared/hooks/useModalScrollLock";
import { ConfirmModal } from "../../../shared/components/ConfirmModal";

type CatalogType = "ubicaciones" | "categorias";

interface InventoryCatalogManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  ubicaciones: string[];
  categorias: string[];
  onAddUbicacion: (name: string) => Promise<void>;
  onUpdateUbicacion: (previousName: string, nextName: string) => Promise<void>;
  onDeleteUbicacion: (name: string) => Promise<void>;
  onAddCategoria: (name: string) => Promise<void>;
  onUpdateCategoria: (previousName: string, nextName: string) => Promise<void>;
  onDeleteCategoria: (name: string) => Promise<void>;
}

const TYPE_TABS: { type: CatalogType; label: string }[] = [
  { type: "ubicaciones", label: "Ubicaciones" },
  { type: "categorias", label: "Categorías" },
];

export const InventoryCatalogManagerModal = ({
  isOpen,
  onClose,
  ubicaciones,
  categorias,
  onAddUbicacion,
  onUpdateUbicacion,
  onDeleteUbicacion,
  onAddCategoria,
  onUpdateCategoria,
  onDeleteCategoria,
}: InventoryCatalogManagerModalProps) => {
  useModalScrollLock(isOpen);
  useEscapeKey(onClose, isOpen);
  const modalRef = useRef<HTMLDivElement>(null);
  useClickOutside(modalRef, onClose, isOpen);

  const [activeType, setActiveType] = useState<CatalogType>("ubicaciones");
  const [newItemValue, setNewItemValue] = useState("");
  const [editingValue, setEditingValue] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    value: string | null;
  }>({ open: false, value: null });

  const currentItems = useMemo(
    () => (activeType === "ubicaciones" ? ubicaciones : categorias),
    [activeType, ubicaciones, categorias],
  );

  if (!isOpen) return null;

  const resetError = () => setError(null);

  const handleAdd = async () => {
    resetError();
    const trimmed = newItemValue.trim();
    if (!trimmed) {
      setError("Ingresa un valor válido.");
      return;
    }

    try {
      setIsSubmitting(true);
      if (activeType === "ubicaciones") {
        await onAddUbicacion(trimmed);
      } else {
        await onAddCategoria(trimmed);
      }
      setNewItemValue("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo agregar el elemento.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (value: string) => {
    resetError();
    setEditingValue(value);
    setEditingDraft(value);
  };

  const handleSaveEdit = async () => {
    if (!editingValue) return;
    resetError();
    const trimmed = editingDraft.trim();
    if (!trimmed) {
      setError("Ingresa un valor válido.");
      return;
    }

    try {
      setIsSubmitting(true);
      if (activeType === "ubicaciones") {
        await onUpdateUbicacion(editingValue, trimmed);
      } else {
        await onUpdateCategoria(editingValue, trimmed);
      }
      setEditingValue(null);
      setEditingDraft("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo actualizar el elemento.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (value: string) => {
    resetError();
    setConfirmState({ open: true, value });
  };

  const handleConfirmDelete = async () => {
    if (!confirmState.value) {
      setConfirmState({ open: false, value: null });
      return;
    }

    try {
      setIsSubmitting(true);
      if (activeType === "ubicaciones") {
        await onDeleteUbicacion(confirmState.value);
      } else {
        await onDeleteCategoria(confirmState.value);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo eliminar el elemento.",
      );
    } finally {
      setIsSubmitting(false);
      setConfirmState({ open: false, value: null });
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-slate-900/50 p-2 py-3 backdrop-blur-sm dark:bg-slate-950/70 sm:items-center sm:overflow-y-visible sm:p-4">
      <div
        ref={modalRef}
        className="w-full max-w-2xl max-h-[92vh] overflow-hidden rounded-3xl bg-white shadow-2xl dark:border dark:border-slate-800 dark:bg-slate-950 flex flex-col"
      >
        <div className="px-4 py-2 text-white bg-gradient-to-r from-green-500 to-green-600">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold">
              Gestión de Ubicaciones y Categorías
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-full hover:bg-white/20"
              disabled={isSubmitting}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-3 overflow-y-auto">
          <div className="flex flex-wrap gap-2">
            {TYPE_TABS.map((tab) => (
              <button
                key={tab.type}
                type="button"
                onClick={() => {
                  setActiveType(tab.type);
                  setEditingValue(null);
                  setEditingDraft("");
                  resetError();
                }}
                className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                  activeType === tab.type
                    ? "border-green-500 bg-green-50 text-green-700 dark:border-emerald-400 dark:bg-emerald-500/20 dark:text-emerald-300"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newItemValue}
              onChange={(event) => setNewItemValue(event.target.value)}
              placeholder={`Agregar nueva opción en ${
                TYPE_TABS.find((t) => t.type === activeType)?.label ??
                "catálogo"
              }`}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-emerald-400 dark:focus:ring-emerald-500/30"
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={handleAdd}
              className="inline-flex items-center gap-1 rounded-xl bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 disabled:opacity-70"
              disabled={isSubmitting}
            >
              <Plus className="w-4 h-4" />
              Agregar
            </button>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
              {error}
            </div>
          )}

          <div className="overflow-hidden border border-gray-200 rounded-xl dark:border-slate-800">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-slate-900">
                <tr>
                  <th className="px-3 py-2 text-left text-gray-700 dark:text-slate-300">
                    Nombre
                  </th>
                  <th className="px-3 py-2 text-right text-gray-700 dark:text-slate-300">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length === 0 && (
                  <tr>
                    <td
                      colSpan={2}
                      className="px-3 py-6 text-center text-gray-500 dark:text-slate-400"
                    >
                      No hay elementos registrados.
                    </td>
                  </tr>
                )}
                {currentItems.map((item) => {
                  const isEditing = editingValue === item;
                  return (
                    <tr
                      key={item}
                      className="border-t border-gray-100 dark:border-slate-800"
                    >
                      <td className="px-3 py-2 text-gray-700 dark:text-slate-200">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editingDraft}
                            onChange={(event) =>
                              setEditingDraft(event.target.value)
                            }
                            className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-gray-700 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                            disabled={isSubmitting}
                          />
                        ) : (
                          item
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex justify-end gap-2">
                          {isEditing ? (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingValue(null);
                                  setEditingDraft("");
                                }}
                                className="px-2 py-1 text-xs font-semibold text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                                disabled={isSubmitting}
                              >
                                Cancelar
                              </button>
                              <button
                                type="button"
                                onClick={handleSaveEdit}
                                className="px-2 py-1 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 disabled:opacity-70"
                                disabled={isSubmitting}
                              >
                                Guardar
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => handleStartEdit(item)}
                                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-green-700 border border-green-200 rounded-lg hover:bg-green-50 dark:border-emerald-500/40 dark:text-emerald-300 dark:hover:bg-emerald-500/10"
                                disabled={isSubmitting}
                              >
                                <Pencil className="w-3.5 h-3.5" />
                                Editar
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(item)}
                                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-red-700 border border-red-200 rounded-lg hover:bg-red-50 dark:border-red-500/40 dark:text-red-300 dark:hover:bg-red-500/10"
                                disabled={isSubmitting}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Eliminar
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmState.open}
        title={
          activeType === "ubicaciones"
            ? "Eliminar ubicación"
            : "Eliminar categoría"
        }
        message={`¿Eliminar definitivamente "${confirmState.value ?? ""}"?`}
        confirmLabel="Eliminar"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmState({ open: false, value: null })}
        isProcessing={isSubmitting}
        destructive
      />
    </div>
  );
};
