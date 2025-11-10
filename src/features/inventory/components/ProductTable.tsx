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
        <td className="px-3 py-1 font-medium text-gray-900 select-text dark:text-slate-100 whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">
          {product.codigo}
        </td>
        <td
          className="px-3 py-1 text-gray-700 select-text dark:text-slate-300 whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]"
          title={product.nombre}
        >
          {product.nombre}
        </td>
        <td className="px-3 py-1 whitespace-nowrap">
          <span
            className="px-2 py-0.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-full select-text dark:bg-slate-800 dark:text-slate-200 inline-block max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap"
            title={product.ubicacion}
          >
            {product.ubicacion}
          </span>
        </td>
        <td className="px-3 py-1 text-center text-gray-700 select-text dark:text-slate-200 whitespace-nowrap">
          {product.salidas}
        </td>
        <td className="px-3 py-1 text-gray-700 select-text dark:text-slate-200 whitespace-nowrap">
          {product.stockActual}
        </td>
        <td className="px-3 py-1 text-gray-600 select-text dark:text-slate-300 whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px]">
          {product.unidadMedida}
        </td>
        <td
          className="px-3 py-1 text-gray-600 select-text dark:text-slate-300 whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]"
          title={product.provider?.name || "Sin proveedor"}
        >
          {product.provider?.name || "Sin proveedor"}
        </td>
        <td
          className="px-3 py-1 text-gray-600 select-text dark:text-slate-300 whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]"
          title={product.marca}
        >
          {product.marca}
        </td>
        <td
          className="px-3 py-1 text-gray-600 select-text dark:text-slate-300 whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]"
          title={product.categoria}
        >
          {product.categoria}
        </td>
        <td className="px-3 py-1 font-medium text-green-600 select-text dark:text-emerald-300 whitespace-nowrap">
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
