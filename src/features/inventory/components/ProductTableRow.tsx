import React, { useState } from "react";
import { Product } from "../types";
import { EditProductModal } from "./EditProductModal";
import { UpdateProductData } from "../../../shared/services/inventory.service";
import { useSelectableRowClick } from "../../../shared/hooks/useSelectableRowClick";

interface ProductTableRowProps {
  product: Product;
  onEdit: (
    id: number,
    productData: UpdateProductData,
  ) => Promise<Product | null>;
  onCreateArea: (name: string) => Promise<void>;
  onCreateCategoria: (name: string) => Promise<void>;
  onDelete: (product: Product) => Promise<void> | void;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  onMouseDown?: () => void;
  onMouseEnter?: () => void;
}

export const ProductTableRow: React.FC<ProductTableRowProps> = ({
  product,
  onEdit,
  onCreateArea,
  onCreateCategoria,
  onDelete,
  isSelected = false,
  onToggleSelect,
  onMouseDown,
  onMouseEnter,
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
          isSelected
            ? "bg-green-100 dark:bg-green-900/30"
            : product.stockActual === 0 || product.stockActual <= 3
              ? "bg-red-50 dark:bg-rose-500/15"
              : "bg-white dark:bg-slate-950/40"
        }`}
        onMouseEnter={onMouseEnter}
        style={{ userSelect: "none" }}
      >
        <td
          className="px-3 py-2 text-xs text-center select-none"
          onMouseDown={(e) => {
            if (e.button === 0) {
              // Solo botón izquierdo del mouse
              e.stopPropagation();
              onMouseDown?.();
            }
          }}
        >
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onToggleSelect?.();
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="w-4 h-4 text-green-600 border-gray-300 rounded cursor-pointer focus:ring-2 focus:ring-green-500 dark:border-slate-600 dark:bg-slate-800"
          />
        </td>
        <td
          className="px-3 py-2 text-xs font-medium text-gray-900 select-text dark:text-slate-100"
          onClick={handleRowClick}
          style={{ cursor: "pointer" }}
        >
          {product.codigo}
        </td>
        <td
          className="px-3 py-2 text-xs text-gray-700 select-text dark:text-slate-300"
          onClick={handleRowClick}
          style={{ cursor: "pointer" }}
        >
          {product.nombre}
        </td>
        <td
          className="px-3 py-2"
          onClick={handleRowClick}
          style={{ cursor: "pointer" }}
        >
          <span className="px-2 py-0.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-full dark:bg-slate-800 dark:text-slate-200 select-text">
            {product.ubicacion}
          </span>
        </td>
        <td
          className="px-3 py-2 text-xs text-gray-700 select-text dark:text-slate-200"
          onClick={handleRowClick}
          style={{ cursor: "pointer" }}
        >
          {product.salidas}
        </td>
        <td
          className="px-3 py-2 text-xs text-gray-700 select-text dark:text-slate-200"
          onClick={handleRowClick}
          style={{ cursor: "pointer" }}
        >
          {product.stockActual}
        </td>
        <td
          className="px-3 py-2 text-xs text-gray-600 select-text dark:text-slate-300"
          onClick={handleRowClick}
          style={{ cursor: "pointer" }}
        >
          {product.unidadMedida}
        </td>
        <td
          className="px-3 py-2 text-xs text-gray-600 select-text dark:text-slate-300"
          onClick={handleRowClick}
          style={{ cursor: "pointer" }}
        >
          {product.provider?.name || "N.A"}
        </td>
        <td
          className="px-3 py-2 text-xs text-gray-600 select-text dark:text-slate-300"
          onClick={handleRowClick}
          style={{ cursor: "pointer" }}
        >
          {product.marca || "N.A"}
        </td>
        <td
          className="px-3 py-2 text-xs text-gray-600 select-text dark:text-slate-300"
          onClick={handleRowClick}
          style={{ cursor: "pointer" }}
        >
          {product.categoria || "N.A"}
        </td>
        <td
          className="px-3 py-2 text-xs font-medium text-green-600 select-text dark:text-emerald-300"
          onClick={handleRowClick}
          style={{ cursor: "pointer" }}
        >
          S/ {product.costoUnitario?.toFixed(2) ?? "0.00"}
        </td>
      </tr>
      {showEditModal && (
        <EditProductModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          product={product}
          onEdit={handleEdit}
          onDelete={onDelete}
          onCreateArea={onCreateArea}
          onCreateCategoria={onCreateCategoria}
        />
      )}
    </>
  );
};
