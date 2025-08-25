import React, { useState } from 'react';
import { X } from 'lucide-react';
import { areas } from '../../inventory/data/mockData';

interface AddMovementFormProps {
  type: 'entrada' | 'salida';
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const AddMovementForm: React.FC<AddMovementFormProps> = ({ type, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    codigoProducto: '',
    descripcion: '',
    precioUnitario: '',
    cantidad: '',
    responsable: '',
    area: '',
    proyecto: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      precioUnitario: parseFloat(formData.precioUnitario) || 0,
      cantidad: parseInt(formData.cantidad) || 0,
      id: Date.now().toString()
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const isEntry = type === 'entrada';
  const gradientColor = isEntry ? 'from-green-500 to-green-600' : 'from-red-500 to-red-600';
  const buttonColor = isEntry ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className={`bg-gradient-to-r ${gradientColor} text-white py-4 px-6 rounded-t-2xl`}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">
              {isEntry ? 'Nueva Entrada de Producto' : 'Nueva Salida de Producto'}
            </h2>
            <button
              onClick={onCancel}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha</label>
              <input
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Código Producto</label>
              <input
                type="text"
                name="codigoProducto"
                value={formData.codigoProducto}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="Ej: AF2025"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción</label>
            <input
              type="text"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              placeholder="Descripción del producto"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Precio Unitario (S/)</label>
              <input
                type="number"
                step="0.01"
                name="precioUnitario"
                value={formData.precioUnitario}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="0.00"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Cantidad</label>
              <input
                type="number"
                name="cantidad"
                value={formData.cantidad}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="1"
                required
              />
            </div>
          </div>
          
          {!isEntry && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Responsable</label>
                <input
                  type="text"
                  name="responsable"
                  value={formData.responsable}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="Nombre del responsable"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Área</label>
                <select
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                >
                  <option value="">Seleccionar área</option>
                  {areas.map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Proyecto</label>
                <input
                  type="text"
                  name="proyecto"
                  value={formData.proyecto}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="Nombre del proyecto"
                />
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`px-6 py-3 text-white rounded-lg transition-colors font-medium ${buttonColor}`}
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
