import React, { useState } from 'react';
import { AddOptionModal } from '../../../shared/components/AddOptionModal';
import { X } from 'lucide-react';

interface AddProductFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  areas: string[];
}

export const AddProductForm: React.FC<AddProductFormProps> = ({ onSubmit, onCancel, areas }) => {
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    costoUnitario: '',
    ubicacion: '',
    entradas: '0',
    salidas: '0',
    stockTotal: '0',
    stockMinimo: '0',
    unidadMedida: '',
    marca: '',
    proveedor: '',
    categoria: ''
  });

  const [showUbicacionModal, setShowUbicacionModal] = useState(false);
  const [showCategoriaModal, setShowCategoriaModal] = useState(false);
  const [ubicaciones, setUbicaciones] = useState<string[]>(areas);
  const [categorias, setCategorias] = useState<string[]>(['Herramientas', 'Lubricantes']);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Preparar datos según lo que espera el backend
    const productData = {
      codigo: formData.codigo,
      nombre: formData.nombre,
      costoUnitario: parseFloat(formData.costoUnitario) || 0,
      unidadMedida: formData.unidadMedida,
      stockTotal: parseInt(formData.stockTotal) || 0,
      stockMinimo: parseInt(formData.stockMinimo) || 0,
      proveedor: formData.proveedor,
      marca: formData.marca,
      ubicacion: formData.ubicacion,
      categoria: formData.categoria
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
        <form onSubmit={handleSubmit} className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Columna izquierda */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Código del Producto *</label>
                <input type="text" name="codigo" value={formData.codigo} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-3" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Costo Unitario *</label>
                  <input type="number" name="costoUnitario" value={formData.costoUnitario} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-3" required min="0" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Stock Total *</label>
                  <input type="number" name="stockTotal" value={formData.stockTotal || ''} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-3" required min="0" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Proveedor *</label>
                <select name="proveedor" value={formData.proveedor} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-3" required>
                  <option value="">Selecciona un Proveedor</option>
                  {/* Aquí puedes mapear proveedores reales */}
                  <option value="Proveedor 1">Proveedor 1</option>
                  <option value="Proveedor 2">Proveedor 2</option>
                </select>
              </div>
              <div className="flex gap-2 items-end">
                <div className="w-full">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Ubicación *</label>
                  <div className="flex flex-col gap-1">
                    <select name="ubicacion" value={formData.ubicacion} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-3" required>
                      <option value="">Estante dentro del Almacén</option>
                      {ubicaciones.map(area => (
                        <option key={area} value={area}>{area}</option>
                      ))}
                    </select>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {ubicaciones.filter(u => !areas.includes(u)).map(area => (
                        <span key={area} className="inline-flex items-center bg-gray-100 px-2 py-1 rounded text-xs">
                          {area}
                          <button type="button" className="ml-1 text-red-500" onClick={() => setUbicaciones(ubicaciones.filter(u => u !== area))}><X className="w-3 h-3" /></button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                  <button type="button" className="bg-gray-200 rounded-full p-2 ml-2" onClick={() => setShowUbicacionModal(true)}><span className="text-xl font-bold">+</span></button>
              </div>
            </div>
            {/* Columna derecha */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre del Producto *</label>
                <input type="text" name="nombre" value={formData.nombre || ''} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-3" required />
              </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Unidad de medida *</label>
                  <select name="unidadMedida" value={formData.unidadMedida} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-3" required>
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
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Stock Mínimo *</label>
                  <input type="number" name="stockMinimo" value={formData.stockMinimo || ''} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-3" required min="0" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Marca *</label>
                <input type="text" name="marca" value={formData.marca || ''} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-3" required />
              </div>
              <div className="flex gap-2 items-end">
                <div className="w-full">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Categoría *</label>
                  <div className="flex flex-col gap-1">
                    <select name="categoria" value={formData.categoria} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-3" required>
                      <option value="">Selecciona una Categoría</option>
                      {categorias.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {categorias.filter(c => c !== 'Herramientas' && c !== 'Lubricantes').map(cat => (
                        <span key={cat} className="inline-flex items-center bg-gray-100 px-2 py-1 rounded text-xs">
                          {cat}
                          <button type="button" className="ml-1 text-red-500" onClick={() => setCategorias(categorias.filter(ca => ca !== cat))}><X className="w-3 h-3" /></button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                  <button type="button" className="bg-gray-200 rounded-full p-2 ml-2" onClick={() => setShowCategoriaModal(true)}><span className="text-xl font-bold">+</span></button>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-4 pt-8 border-t border-gray-200 mt-8">
            <button type="button" onClick={onCancel} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">Cancelar</button>
            <button type="submit" className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium">Agregar Producto</button>
          </div>
        </form>
          {/* Modales para agregar opción */}
          <AddOptionModal
            isOpen={showUbicacionModal}
            onClose={() => setShowUbicacionModal(false)}
            onSubmit={(option: string) => {
              if (option && !ubicaciones.includes(option)) setUbicaciones([...ubicaciones, option]);
              setShowUbicacionModal(false);
            }}
            title="Nueva Ubicación"
            label="Ubicación *"
          />
          <AddOptionModal
            isOpen={showCategoriaModal}
            onClose={() => setShowCategoriaModal(false)}
            onSubmit={(option: string) => {
              if (option && !categorias.includes(option)) setCategorias([...categorias, option]);
              setShowCategoriaModal(false);
            }}
            title="Nueva Categoría"
            label="Categoría *"
          />
      </div>
    </div>
  );
};
