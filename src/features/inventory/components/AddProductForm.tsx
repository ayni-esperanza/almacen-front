import React, { useState } from 'react';
import { X } from 'lucide-react';

interface AddProductFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  areas: string[];
}

export const AddProductForm: React.FC<AddProductFormProps> = ({ onSubmit, onCancel, areas }) => {
  const [formData, setFormData] = useState({
    codigo: '',
    descripcion: '',
    costoUnitario: '',
    ubicacion: '',
    entradas: '0',
    salidas: '0',
    stockActual: '0',
    unidadMedida: '',
    proveedor: '',
    categoria: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Preparar datos según lo que espera el backend
    const productData = {
      codigo: formData.codigo,
      descripcion: formData.descripcion,
      costoUnitario: parseFloat(formData.costoUnitario) || 0,
      ubicacion: formData.ubicacion,
      entradas: parseInt(formData.entradas) || 0,
      salidas: parseInt(formData.salidas) || 0,
      stockActual: parseInt(formData.stockActual) || 0,
      unidadMedida: formData.unidadMedida,
      proveedor: formData.proveedor,
      ...(formData.categoria && { categoria: formData.categoria })
      // costoTotal se calcula automáticamente en el backend
    };
    
    onSubmit(productData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Nuevo Producto</h2>
            <button
              onClick={onCancel}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información Básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Código del Producto *</label>
              <input
                type="text"
                name="codigo"
                value={formData.codigo}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="Ej: AF2025"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción *</label>
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
          </div>

          {/* Costos y Stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Costo Unitario (S/) *</label>
              <input
                type="number"
                step="0.01"
                name="costoUnitario"
                value={formData.costoUnitario}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="0.00"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Unidad de Medida *</label>
              <select
                name="unidadMedida"
                value={formData.unidadMedida}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                required
              >
                <option value="">Seleccionar unidad</option>
                <option value="und">Unidad (und)</option>
                <option value="lt">Litro (lt)</option>
                <option value="kg">Kilogramo (kg)</option>
                <option value="m">Metro (m)</option>
                <option value="m2">Metro cuadrado (m²)</option>
                <option value="m3">Metro cúbico (m³)</option>
                <option value="pza">Pieza (pza)</option>
                <option value="caja">Caja</option>
                <option value="rollo">Rollo</option>
                <option value="par">Par</option>
              </select>
            </div>
          </div>

          {/* Stock y Movimientos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Stock Inicial</label>
              <input
                type="number"
                name="stockActual"
                value={formData.stockActual}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="0"
                min="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Entradas Iniciales</label>
              <input
                type="number"
                name="entradas"
                value={formData.entradas}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="0"
                min="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Salidas Iniciales</label>
              <input
                type="number"
                name="salidas"
                value={formData.salidas}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          {/* Ubicación y Proveedor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Ubicación *</label>
              <select
                name="ubicacion"
                value={formData.ubicacion}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                required
              >
                <option value="">Seleccionar ubicación</option>
                {areas.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Proveedor *</label>
              <input
                type="text"
                name="proveedor"
                value={formData.proveedor}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="Nombre del proveedor"
                required
              />
            </div>
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Categoría</label>
            <input
              type="text"
              name="categoria"
              value={formData.categoria}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              placeholder="Ej: Herramientas, Lubricantes, etc."
            />
          </div>
          
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
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium"
            >
              Guardar Producto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
