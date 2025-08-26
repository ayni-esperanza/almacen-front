import { ProductTable } from '../features/inventory/components/ProductTable';
import { useInventory } from '../features/inventory/hooks/useInventory';

export const InventoryPage = () => {
  const inventoryData = useInventory();
  
  return <ProductTable {...inventoryData} />;
};
