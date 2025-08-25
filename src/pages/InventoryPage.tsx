import { ProductTable } from '../features/inventory/components/ProductTable';
import { productos } from '../features/inventory/data/mockData';

export const InventoryPage = () => {
  return <ProductTable products={productos} />;
};
