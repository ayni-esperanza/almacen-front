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
        className={`border-b border-gray-100 transition-colors hover:bg-green-50 dark:border-slate-800 dark:hover:bg-slate-800 ${
          product.stockActual === 0 || product.stockActual <= 3 ? 'bg-red-50 dark:bg-rose-500/10' : 'bg-white dark:bg-slate-900'
        }`}
        onClick={() => setShowEditModal(true)}
        style={{ cursor: 'pointer' }}
      >
        <td className="px-4 py-4 font-medium text-gray-900 dark:text-slate-100">{product.codigo}</td>
        <td className="px-4 py-4 text-gray-700 dark:text-slate-300">{product.nombre}</td>
        <td className="px-4 py-4">
          <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 dark:bg-slate-800 dark:text-slate-200">
            {product.ubicacion}
          </span>
        </td>
        <td className="px-4 py-4 text-center text-gray-700 dark:text-slate-200">{product.salidas}</td>
        <td className="px-4 py-4 text-gray-700 dark:text-slate-200">{product.stockActual}</td>
        <td className="px-4 py-4 text-gray-600 dark:text-slate-300">{product.unidadMedida}</td>
        <td className="px-4 py-4 text-gray-600 dark:text-slate-300">{product.proveedor}</td>
        <td className="px-4 py-4 text-gray-600 dark:text-slate-300">{product.marca}</td>
        <td className="px-4 py-4 text-gray-600 dark:text-slate-300">{product.categoria}</td>
        <td className="px-4 py-4 font-medium text-green-600 dark:text-emerald-300">S/ {product.costoUnitario?.toFixed(2) ?? '0.00'}</td>
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
