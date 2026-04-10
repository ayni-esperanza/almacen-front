import { useMemo, useRef, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { CatalogType, ReferenceCatalogs } from "../hooks/useReferenceCatalogs";
import { useEscapeKey } from "../hooks/useEscapeKey";
import { useClickOutside } from "../hooks/useClickOutside";
import { useModalScrollLock } from "../hooks/useModalScrollLock";

interface ReferenceCatalogManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  catalogs: ReferenceCatalogs;
  onAddItem: (type: CatalogType, name: string) => boolean;
  onUpdateItem: (type: CatalogType, previousName: string, nextName: string) => boolean;
  onDeleteItem: (type: CatalogType, name: string) => boolean;
}

const TYPE_TABS: { type: CatalogType; label: string }[] = [
  { type: "areas", label: "Áreas" },
  { type: "empresas", label: "Empresas" },
  { type: "proyectos", label: "Proyectos" },
];

export const ReferenceCatalogManagerModal = ({
  isOpen,
  onClose,
  catalogs,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
}: ReferenceCatalogManagerModalProps) => {
  useModalScrollLock(isOpen);
  useEscapeKey(onClose, isOpen);
  const modalRef = useRef<HTMLDivElement>(null);
  useClickOutside(modalRef, onClose, isOpen);

  const [activeType, setActiveType] = useState<CatalogType>("areas");
  const [newItemValue, setNewItemValue] = useState("");
  const [editingValue, setEditingValue] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  const currentItems = useMemo(() => catalogs[activeType] ?? [], [catalogs, activeType]);

  if (!isOpen) return null;

  const resetError = () => setError(null);

  const handleAdd = () => {
    resetError();
    const added = onAddItem(activeType, newItemValue);
    if (!added) {
      setError("No se pudo agregar. Verifica que no exista ya el elemento.");
      return;
    }
    setNewItemValue("");
  };

  const handleStartEdit = (value: string) => {
    resetError();
    setEditingValue(value);
    setEditingDraft(value);
  };

  const handleSaveEdit = () => {
    if (!editingValue) return;
    resetError();
    const updated = onUpdateItem(activeType, editingValue, editingDraft);
    if (!updated) {
      setError("No se pudo editar. El nuevo nombre puede estar duplicado.");
      return;
    }
    setEditingValue(null);
    setEditingDraft("");
  };

  const handleDelete = (value: string) => {
    resetError();
    const confirmed = window.confirm(`¿Eliminar \"${value}\"?`);
    if (!confirmed) return;
    const deleted = onDeleteItem(activeType, value);
    if (!deleted) {
      setError("No se pudo eliminar el elemento seleccionado.");
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm dark:bg-slate-950/70">
      <div
        ref={modalRef}
        className="w-full max-w-2xl max-h-[92vh] overflow-hidden rounded-3xl bg-white shadow-2xl dark:border dark:border-slate-800 dark:bg-slate-950 flex flex-col"
      >
        <div className="px-4 py-2 text-white bg-gradient-to-r from-green-500 to-green-600">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold">Gestión de Áreas, Empresas y Proyectos</h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-full hover:bg-white/20"
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
              placeholder={`Agregar nueva opción en ${TYPE_TABS.find((t) => t.type === activeType)?.label ?? "catálogo"}`}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-emerald-400 dark:focus:ring-emerald-500/30"
            />
            <button
              type="button"
              onClick={handleAdd}
              className="inline-flex items-center gap-1 rounded-xl bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700 dark:bg-emerald-500 dark:hover:bg-emerald-400"
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
                  <th className="px-3 py-2 text-left text-gray-700 dark:text-slate-300">Nombre</th>
                  <th className="px-3 py-2 text-right text-gray-700 dark:text-slate-300">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length === 0 && (
                  <tr>
                    <td colSpan={2} className="px-3 py-6 text-center text-gray-500 dark:text-slate-400">
                      No hay elementos registrados.
                    </td>
                  </tr>
                )}
                {currentItems.map((item) => {
                  const isEditing = editingValue === item;
                  return (
                    <tr key={item} className="border-t border-gray-100 dark:border-slate-800">
                      <td className="px-3 py-2 text-gray-700 dark:text-slate-200">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editingDraft}
                            onChange={(event) => setEditingDraft(event.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-gray-700 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
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
                              >
                                Cancelar
                              </button>
                              <button
                                type="button"
                                onClick={handleSaveEdit}
                                className="px-2 py-1 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 dark:bg-emerald-500 dark:hover:bg-emerald-400"
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
                              >
                                <Pencil className="w-3.5 h-3.5" />
                                Editar
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(item)}
                                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-red-700 border border-red-200 rounded-lg hover:bg-red-50 dark:border-red-500/40 dark:text-red-300 dark:hover:bg-red-500/10"
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
    </div>
  );
};
