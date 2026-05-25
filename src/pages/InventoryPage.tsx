import { useState } from "react";
import { ProductTable } from "../features/inventory/components/ProductTable";
import { AddProductForm } from "../features/inventory/components/AddProductForm";
import { useInventory } from "../features/inventory/hooks/useInventory";
import { CreateProductData } from "../shared/services/inventory.service";
import { InventoryCatalogManagerModal } from "../features/inventory/components/InventoryCatalogManagerModal";

export const InventoryPage = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCatalogManager, setShowCatalogManager] = useState(false);
  const inventoryData = useInventory();

  const handleAddProduct = async (data: CreateProductData) => {
    try {
      await inventoryData.createProduct(data);
      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  const handleCreateUbicacion = async (name: string) => {
    const created = await inventoryData.createUbicacion(name);
    if (!created) {
      throw new Error("No se pudo agregar la ubicación.");
    }
  };

  const handleCreateCategoria = async (name: string) => {
    const created = await inventoryData.createCategoria(name);
    if (!created) {
      throw new Error("No se pudo agregar la categoría.");
    }
  };

  const handleUpdateUbicacion = async (previousName: string, nextName: string) => {
    await inventoryData.updateUbicacion(previousName, nextName);
  };

  const handleDeleteUbicacion = async (name: string) => {
    await inventoryData.deleteUbicacion(name);
  };

  const handleUpdateCategoria = async (
    previousName: string,
    nextName: string,
  ) => {
    await inventoryData.updateCategoria(previousName, nextName);
  };

  const handleDeleteCategoria = async (name: string) => {
    await inventoryData.deleteCategoria(name);
  };

  return (
    <>
      <ProductTable
        {...inventoryData}
        createUbicacion={handleCreateUbicacion}
        createCategoria={handleCreateCategoria}
        onOpenCatalogManager={() => setShowCatalogManager(true)}
        onAddProduct={() => setShowAddForm(true)}
      />

      {showAddForm && (
        <AddProductForm
          onSubmit={handleAddProduct}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      <InventoryCatalogManagerModal
        isOpen={showCatalogManager}
        onClose={() => setShowCatalogManager(false)}
        ubicaciones={inventoryData.ubicaciones}
        categorias={inventoryData.categorias}
        onAddUbicacion={handleCreateUbicacion}
        onUpdateUbicacion={handleUpdateUbicacion}
        onDeleteUbicacion={handleDeleteUbicacion}
        onAddCategoria={handleCreateCategoria}
        onUpdateCategoria={handleUpdateCategoria}
        onDeleteCategoria={handleDeleteCategoria}
      />
    </>
  );
};
