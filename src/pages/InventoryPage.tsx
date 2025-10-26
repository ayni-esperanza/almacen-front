import { useState } from "react";
import { Plus } from "lucide-react";
import { ProductTable } from "../features/inventory/components/ProductTable";
import { AddProductForm } from "../features/inventory/components/AddProductForm";
import { useInventory } from "../features/inventory/hooks/useInventory";
import { CreateProductData } from "../shared/services/inventory.service";

export const InventoryPage = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const inventoryData = useInventory();

  const handleAddProduct = async (data: CreateProductData) => {
    try {
      await inventoryData.createProduct(data);
      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  const handleCreateArea = async (name: string) => {
    await inventoryData.createArea(name);
  };

  const handleCreateCategoria = async (name: string) => {
    await inventoryData.createCategoria(name);
  };

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
            Inventario
          </h1>

          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center px-6 py-2 space-x-2 font-medium text-white transition-colors bg-green-500 rounded-lg shadow-md hover:bg-green-600"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Producto</span>
          </button>
        </div>
      </div>

      <div className="container mx-auto">
        <ProductTable
          {...inventoryData}
          createArea={handleCreateArea}
          createCategoria={handleCreateCategoria}
        />
      </div>

      {showAddForm && (
        <AddProductForm
          key={Date.now()}
          onSubmit={handleAddProduct}
          onCancel={() => setShowAddForm(false)}
          areas={inventoryData.areas}
          categorias={inventoryData.categorias}
          onCreateArea={handleCreateArea}
          onCreateCategoria={handleCreateCategoria}
        />
      )}
    </>
  );
};
