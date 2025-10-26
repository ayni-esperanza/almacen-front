import React, { useState } from "react";
import { Product } from "../types";
import { EditProductModal } from "./EditProductModal";
import { UpdateProductData } from "../../../shared/services/inventory.service";

interface ProductTableRowProps {
  product: Product;
  onEdit: (
    id: number,
    productData: UpdateProductData
  ) => Promise<Product | null>;
  areas: string[];
  categorias: string[];
  onCreateArea: (name: string) => void;
  onCreateCategoria: (name: string) => void;
}

export const ProductTableRow: React.FC<ProductTableRowProps> = ({
  product,
  onEdit,
  areas,
  categorias,
  onCreateArea,
  onCreateCategoria,
}) => {
  const [showEditModal, setShowEditModal] = useState(false);

  const handleEdit = async (editedProduct: Product) => {
    // Preparar los datos para actualizar
    const updateData: UpdateProductData = {
      codigo: editedProduct.codigo,
      nombre: editedProduct.nombre,
      costoUnitario: editedProduct.costoUnitario,
      ubicacion: editedProduct.ubicacion,
      stockActual: editedProduct.stockActual,
      stockMinimo: editedProduct.stockMinimo,
      unidadMedida: editedProduct.unidadMedida,
      providerId: editedProduct.providerId,
      marca: editedProduct.marca,
      categoria: editedProduct.categoria,
    };

    try {
      await onEdit(product.id, updateData);
      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  return (
    <>
      <tr
        className={`border-b border-gray-100 transition-colors hover:bg-green-50 dark:border-slate-800/70 dark:hover:bg-slate-900/60 ${
          product.stockActual === 0 || product.stockActual <= 3
            ? "bg-red-50 dark:bg-rose-500/15"
            : "bg-white dark:bg-slate-950/40"
        }`}
        onClick={() => setShowEditModal(true)}
        style={{ cursor: "pointer" }}
      >
        <td className="px-4 py-4 font-medium text-gray-900 dark:text-slate-100">
          {product.codigo}
        </td>
        <td className="px-4 py-4 text-gray-700 dark:text-slate-300">
          {product.nombre}
        </td>
        <td className="px-4 py-4">
          <span className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full dark:bg-slate-800 dark:text-slate-200">
            {product.ubicacion}
          </span>
        </td>
        <td className="px-4 py-4 text-center text-gray-700 dark:text-slate-200">
          {product.salidas}
        </td>
        <td className="px-4 py-4 text-gray-700 dark:text-slate-200">
          {product.stockActual}
        </td>
        <td className="px-4 py-4 text-gray-600 dark:text-slate-300">
          {product.unidadMedida}
        </td>
        <td className="px-4 py-4 text-gray-600 dark:text-slate-300">
          {product.provider?.name || "Sin proveedor"}
        </td>
        <td className="px-4 py-4 text-gray-600 dark:text-slate-300">
          {product.marca}
        </td>
        <td className="px-4 py-4 text-gray-600 dark:text-slate-300">
          {product.categoria}
        </td>
        <td className="px-4 py-4 font-medium text-green-600 dark:text-emerald-300">
          S/ {product.costoUnitario?.toFixed(2) ?? "0.00"}
        </td>
      </tr>
      {showEditModal && (
        <EditProductModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          product={product}
          onEdit={handleEdit}
          areas={areas}
          categorias={categorias}
          onCreateArea={onCreateArea}
          onCreateCategoria={onCreateCategoria}
        />
      )}
    </>
  );
};
