import { useState, useEffect } from 'react';
import { Product } from '../types';
import { inventoryService, CreateProductData, UpdateProductData } from '../../../shared/services/inventory.service';

export interface UseInventoryReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  areas: string[];
  setSearchTerm: (term: string) => void;
  refetch: () => Promise<void>;
  createProduct: (productData: CreateProductData) => Promise<Product | null>;
  updateProduct: (id: number, productData: UpdateProductData) => Promise<Product | null>;
  deleteProduct: (id: number) => Promise<boolean>;
}

export const useInventory = (): UseInventoryReturn => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [areas, setAreas] = useState<string[]>([]);

  const fetchProducts = async (search?: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await inventoryService.getAllProducts(search);
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const fetchAreas = async () => {
    try {
      const data = await inventoryService.getAreas();
      setAreas(data);
    } catch (err) {
      console.error('Error fetching areas:', err);
    }
  };

  const refetch = async () => {
    await fetchProducts(searchTerm || undefined);
  };

  const createProduct = async (productData: CreateProductData): Promise<Product | null> => {
    try {
      const newProduct = await inventoryService.createProduct(productData);
      if (newProduct) {
        await refetch(); // Refresh the list
      }
      return newProduct;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear producto');
      throw err;
    }
  };

  const updateProduct = async (id: number, productData: UpdateProductData): Promise<Product | null> => {
    try {
      const updatedProduct = await inventoryService.updateProduct(id.toString(), productData);
      if (updatedProduct) {
        await refetch(); // Refresh the list
      }
      return updatedProduct;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar producto');
      throw err;
    }
  };

  const deleteProduct = async (id: number): Promise<boolean> => {
    try {
      const success = await inventoryService.deleteProduct(id.toString());
      if (success) {
        await refetch(); // Refresh the list
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar producto');
      return false;
    }
  };

  // Initial load
  useEffect(() => {
    fetchProducts();
    fetchAreas();
  }, []);

  // Search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchProducts(searchTerm || undefined);
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  return {
    products,
    loading,
    error,
    searchTerm,
    areas,
    setSearchTerm,
    refetch,
    createProduct,
    updateProduct,
    deleteProduct
  };
};
