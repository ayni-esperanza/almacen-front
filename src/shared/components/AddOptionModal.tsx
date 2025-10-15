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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6 rounded-t-2xl flex items-center justify-between">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-8">
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
            <input
              type="text"
              value={option}
              onChange={e => setOption(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3"
              required
            />
          </div>
          <div className="flex justify-end gap-4">
            <button type="button" onClick={onClose} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">Cancelar</button>
            <button type="submit" className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium">Agregar Opción</button>
          </div>
        </form>
      </div>
    </div>
  );
};
