import React from 'react';
import { Product } from '../types';
import { StockIndicator } from '../../../shared/components/StockIndicator';
import { Package, Search, AlertCircle } from 'lucide-react';

interface ProductTableProps {
  products: Product[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  refetch: () => Promise<void>;
}

export const ProductTable: React.FC<ProductTableProps> = ({ 
  products, 
  loading, 
  error, 
  searchTerm, 
  setSearchTerm,
  refetch
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6">
          <div className="flex items-center space-x-3">
            <Package className="w-6 h-6" />
            <h2 className="text-xl font-bold">Inventario de Productos</h2>
          </div>
        </div>
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando productos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6">
          <div className="flex items-center space-x-3">
            <Package className="w-6 h-6" />
            <h2 className="text-xl font-bold">Inventario de Productos</h2>
          </div>
        </div>
        <div className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6">
        <div className="flex items-center space-x-3">
          <Package className="w-6 h-6" />
          <h2 className="text-xl font-bold">Inventario de Productos</h2>
        </div>
      </div>
      
      {/* Search Filter */}
      <div className="p-4 bg-gray-50 border-b">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por código, descripción o proveedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        {products.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No se encontraron productos</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-4 text-left font-semibold text-gray-700">Código</th>
                <th className="px-4 py-4 text-left font-semibold text-gray-700">Descripción</th>
                <th className="px-4 py-4 text-left font-semibold text-gray-700">Costo U.</th>
                <th className="px-4 py-4 text-left font-semibold text-gray-700">Ubicación</th>
                <th className="px-4 py-4 text-left font-semibold text-gray-700">Entradas</th>
                <th className="px-4 py-4 text-left font-semibold text-gray-700">Salidas</th>
                <th className="px-4 py-4 text-left font-semibold text-gray-700">Stock Actual</th>
                <th className="px-4 py-4 text-left font-semibold text-gray-700">Unidad</th>
                <th className="px-4 py-4 text-left font-semibold text-gray-700">Proveedor</th>
                <th className="px-4 py-4 text-left font-semibold text-gray-700">Costo Total</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  className={`border-b border-gray-100 hover:bg-green-50 transition-colors ${
                    product.stockActual === 0 || product.stockActual <= 3 ? 'bg-red-50' : ''
                  }`}
                >
                  <td className="px-4 py-4 font-medium text-gray-900">{product.codigo}</td>
                  <td className="px-4 py-4 text-gray-700">{product.descripcion}</td>
                  <td className="px-4 py-4 font-medium text-green-600">S/ {product.costoUnitario.toFixed(2)}</td>
                  <td className="px-4 py-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                      {product.ubicacion}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">{product.entradas}</td>
                  <td className="px-4 py-4 text-center">{product.salidas}</td>
                  <td className="px-4 py-4">
                    <StockIndicator stock={product.stockActual} />
                  </td>
                  <td className="px-4 py-4 text-gray-600">{product.unidadMedida}</td>
                  <td className="px-4 py-4 text-gray-600">{product.proveedor}</td>
                  <td className="px-4 py-4 font-medium text-green-600">S/ {product.costoTotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
