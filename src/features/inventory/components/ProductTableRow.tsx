import React, { useState } from 'react';
import { Product } from '../types';
import { EditProductModal } from './EditProductModal';

interface ProductTableRowProps {
  product: Product;
  onEdit: (product: Product) => void;
}

export const ProductTableRow: React.FC<ProductTableRowProps> = ({ product, onEdit }) => {
  const [showEditModal, setShowEditModal] = useState(false);

  return (
    <>
      <tr
        className={`border-b border-gray-100 hover:bg-green-50 transition-colors ${
          product.stockActual === 0 || product.stockActual <= 3 ? 'bg-red-50' : ''
        }`}
        onClick={() => setShowEditModal(true)}
        style={{ cursor: 'pointer' }}
      >
        <td className="px-4 py-4 font-medium text-gray-900">{product.codigo}</td>
        <td className="px-4 py-4 text-gray-700">{product.nombre}</td>
        <td className="px-4 py-4">
          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
            {product.ubicacion}
          </span>
        </td>
        <td className="px-4 py-4 text-center">{product.salidas}</td>
        <td className="px-4 py-4">{product.stockActual}</td>
        <td className="px-4 py-4 text-gray-600">{product.unidadMedida}</td>
        <td className="px-4 py-4 text-gray-600">{product.proveedor}</td>
        <td className="px-4 py-4 text-gray-600">{product.marca}</td>
        <td className="px-4 py-4 text-gray-600">{product.categoria}</td>
        <td className="px-4 py-4 font-medium text-green-600">S/ {product.costoUnitario?.toFixed(2) ?? '0.00'}</td>
      </tr>
      {showEditModal && (
        <EditProductModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          product={product}
          onEdit={onEdit}
        />
      )}
    </>
  );
};
