import React, { useState, useRef } from "react";
import { X } from "lucide-react";
import { useEscapeKey } from "../hooks/useEscapeKey";
import { useClickOutside } from "../hooks/useClickOutside";

interface AddOptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (option: string) => void;
  title?: string;
  label?: string;
  color?: "green" | "red";
}

export const AddOptionModal: React.FC<AddOptionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title = "Nueva Opción",
  label = "Opción *",
  color = "green",
}) => {
  const [option, setOption] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);

  // Cerrar modal con tecla ESC
  useEscapeKey(onClose, isOpen);

  // Cerrar modal al hacer clic fuera
  useClickOutside(modalRef, onClose, isOpen);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (option.trim()) {
      onSubmit(option.trim());
      setOption("");
    }
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  if (!isOpen) return null;

  // Estilos dinámicos según el color
  const headerColors =
    color === "red" ? "from-red-500 to-red-600" : "from-green-500 to-green-600";

  const inputFocusColors =
    color === "red"
      ? "focus:border-red-500 focus:ring-red-100 dark:focus:border-rose-400 dark:focus:ring-rose-500/30"
      : "focus:border-green-500 focus:ring-green-100 dark:focus:border-emerald-400 dark:focus:ring-emerald-500/30";

  const buttonColors =
    color === "red"
      ? "bg-red-500 hover:bg-red-600 dark:bg-rose-600 dark:hover:bg-rose-500"
      : "bg-green-500 hover:bg-green-600 dark:bg-emerald-500 dark:hover:bg-emerald-400";

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[60] p-3"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        ref={modalRef}
        className="w-full max-w-sm rounded-2xl bg-white shadow-xl transition dark:border dark:border-slate-800 dark:bg-slate-950"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`flex items-center justify-between rounded-t-2xl bg-gradient-to-r ${headerColors} px-4 py-3 text-white`}
        >
          <h2 className="text-sm font-semibold">{title}</h2>
          <button
            onClick={handleClose}
            className="rounded-full p-1 transition-colors hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-700 dark:text-slate-200">
              {label}
            </label>
            <input
              type="text"
              value={option}
              onChange={(e) => setOption(e.target.value)}
              className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 ${inputFocusColors}`}
              required
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`rounded-lg px-3 py-2 text-xs font-semibold text-white transition-colors ${buttonColors}`}
            >
              Agregar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
