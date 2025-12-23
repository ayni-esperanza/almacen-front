import React, { useState, useRef } from 'react';
import { X } from 'lucide-react';
import { useEscapeKey } from '../hooks/useEscapeKey';
import { useClickOutside } from '../hooks/useClickOutside';

interface AddOptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (option: string) => void;
  title?: string;
  label?: string;
}

export const AddOptionModal: React.FC<AddOptionModalProps> = ({ isOpen, onClose, onSubmit, title = 'Nueva Opción', label = 'Opción *' }) => {
  const [option, setOption] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Cerrar modal con tecla ESC
  useEscapeKey(onClose, isOpen);
  
  // Cerrar modal al hacer clic fuera
  useClickOutside(modalRef, onClose, isOpen);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (option.trim()) {
      onSubmit(option.trim());
      setOption('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-3">
      <div 
        ref={modalRef}
        className="w-full max-w-sm rounded-2xl bg-white shadow-xl transition dark:border dark:border-slate-800 dark:bg-slate-950"
      >
        <div className="flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-green-500 to-green-600 px-4 py-3 text-white">
          <h2 className="text-sm font-semibold">{title}</h2>
          <button onClick={onClose} className="rounded-full p-1 transition-colors hover:bg-white/20">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-700 dark:text-slate-200">{label}</label>
            <input
              type="text"
              value={option}
              onChange={e => setOption(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-emerald-400 dark:focus:ring-emerald-500/30"
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Cancelar</button>
            <button type="submit" className="rounded-lg bg-green-500 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-green-600 dark:bg-emerald-500 dark:hover:bg-emerald-400">Agregar</button>
          </div>
        </form>
      </div>
    </div>
  );
};
