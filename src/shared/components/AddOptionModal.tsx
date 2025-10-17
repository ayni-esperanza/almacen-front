import React, { useState } from 'react';
import { X } from 'lucide-react';

interface AddOptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (option: string) => void;
  title?: string;
  label?: string;
}

export const AddOptionModal: React.FC<AddOptionModalProps> = ({ isOpen, onClose, onSubmit, title = 'Nueva Opción', label = 'Opción *' }) => {
  const [option, setOption] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (option.trim()) {
      onSubmit(option.trim());
      setOption('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl transition dark:border dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 text-white">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="rounded-full p-1 transition-colors hover:bg-white/20">
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-8">
          <div className="mb-8">
            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-slate-200">{label}</label>
            <input
              type="text"
              value={option}
              onChange={e => setOption(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-emerald-400 dark:focus:ring-emerald-500/30"
              required
            />
          </div>
          <div className="flex justify-end gap-4">
            <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Cancelar</button>
            <button type="submit" className="rounded-lg bg-green-500 px-6 py-3 font-medium text-white transition-colors hover:bg-green-600 dark:bg-emerald-500 dark:hover:bg-emerald-400">Agregar Opción</button>
          </div>
        </form>
      </div>
    </div>
  );
};
