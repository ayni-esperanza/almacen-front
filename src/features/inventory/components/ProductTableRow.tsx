import React, { useState } from "react";
import { Product } from "../types";
import { EditProductModal } from "./EditProductModal";
import { UpdateProductData } from "../../../shared/services/inventory.service";
import { useSelectableRowClick } from "../../../shared/hooks/useSelectableRowClick";

interface ProductTableRowProps {
  product: Product;
  onEdit: (
    id: number,
    productData: UpdateProductData
  ) => Promise<Product | null>;
  onCreateArea: (name: string) => Promise<void>;
  onCreateCategoria: (name: string) => Promise<void>;
}

export const ProductTableRow: React.FC<ProductTableRowProps> = ({
  product,
  onEdit,
  onCreateArea,
  onCreateCategoria,
}) => {
  const [showEditModal, setShowEditModal] = useState(false);

  // Hook para manejar click permitiendo selección de texto
  const handleRowClick = useSelectableRowClick(() => setShowEditModal(true));

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
        onClick={handleRowClick}
        style={{ cursor: "pointer", userSelect: "text" }}
      >
        <td className="px-3 py-2 text-xs font-medium text-gray-900 dark:text-slate-100 select-text">
          {product.codigo}
        </td>
        <td className="px-3 py-2 text-xs text-gray-700 dark:text-slate-300 select-text">
          {product.nombre}
        </td>
        <td className="px-3 py-2">
          <span className="px-2 py-0.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-full dark:bg-slate-800 dark:text-slate-200 select-text">
            {product.ubicacion}
          </span>
        </td>
        <td className="px-3 py-2 text-xs text-gray-700 dark:text-slate-200 select-text">
          {product.salidas}
        </td>
        <td className="px-3 py-2 text-xs text-gray-700 dark:text-slate-200 select-text">
          {product.stockActual}
        </td>
        <td className="px-3 py-2 text-xs text-gray-600 dark:text-slate-300 select-text">
          {product.unidadMedida}
        </td>
        <td className="px-3 py-2 text-xs text-gray-600 dark:text-slate-300 select-text">
          {product.provider?.name || "N.A"}
        </td>
        <td className="px-3 py-2 text-xs text-gray-600 dark:text-slate-300 select-text">
          {product.marca || "N.A"}
        </td>
        <td className="px-3 py-2 text-xs text-gray-600 dark:text-slate-300 select-text">
          {product.categoria || "N.A"}
        </td>
        <td className="px-3 py-2 text-xs font-medium text-green-600 dark:text-emerald-300 select-text">
          S/ {product.costoUnitario?.toFixed(2) ?? "0.00"}
        </td>
      </tr>
      {showEditModal && (
        <EditProductModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          product={product}
          onEdit={handleEdit}
          onCreateArea={onCreateArea}
          onCreateCategoria={onCreateCategoria}
        />
      )}
    </>
  );
};
