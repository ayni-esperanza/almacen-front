import { useState } from 'react';
import { Plus } from 'lucide-react';
import { ProductTable } from '../features/inventory/components/ProductTable';
import { AddProductForm } from '../features/inventory/components/AddProductForm';
import { useInventory } from '../features/inventory/hooks/useInventory';
import { CreateProductData } from '../shared/services/inventory.service';

export const InventoryPage = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const inventoryData = useInventory();

  const handleAddProduct = async (data: CreateProductData) => {
    try {
      await inventoryData.createProduct(data);
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Inventario</h1>
          
          <button
            onClick={() => setShowAddForm(true)}
            className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center space-x-2 font-medium shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Producto</span>
          </button>
        </div>
      </div>

      <div className="container mx-auto">
        <ProductTable {...inventoryData} />
      </div>

      {showAddForm && (
        <AddProductForm
          onSubmit={handleAddProduct}
          onCancel={() => setShowAddForm(false)}
          areas={inventoryData.areas}
        />
      )}
    </>
  );
};
