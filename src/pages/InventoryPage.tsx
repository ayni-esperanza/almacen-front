import { useState } from "react";
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
      <ProductTable
        {...inventoryData}
        createArea={handleCreateArea}
        createCategoria={handleCreateCategoria}
        onAddProduct={() => setShowAddForm(true)}
      />

      {showAddForm && (
        <AddProductForm
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
