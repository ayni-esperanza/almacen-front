import React from 'react';
import { Product } from '../types';
import { StockIndicator } from '../../../shared/components/StockIndicator';
import { Package, Search } from 'lucide-react';

interface ProductTableProps {
  products: Product[];
}

export const ProductTable: React.FC<ProductTableProps> = ({ products }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  
  const filteredProducts = products.filter(product =>
    product.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.proveedor.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          {filteredProducts.map((product, index) => (
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
      </div>
    </div>
  );
};
