import { useState, useEffect, useCallback, useRef } from "react";
import { Product } from "../types";
import {
  inventoryService,
  CreateProductData,
  UpdateProductData,
} from "../../../shared/services/inventory.service";

export interface UseInventoryReturn {
  products: Product[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  searchTerm: string;
  filterEPP: boolean;
  setFilterEPP: (filter: boolean) => void;
  areas: string[];
  categorias: string[];
  setSearchTerm: (term: string) => void;
  refetch: () => Promise<void>;
  createProduct: (productData: CreateProductData) => Promise<Product | null>;
  updateProduct: (
    id: number,
    productData: UpdateProductData
  ) => Promise<Product | null>;
  deleteProduct: (id: number) => Promise<boolean>;
  createArea: (nombre: string) => Promise<string | null>;
  createCategoria: (nombre: string) => Promise<string | null>;
  // Pagination states
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
}

export const useInventory = (): UseInventoryReturn => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEPP, setFilterEPP] = useState(false);
  const [areas, setAreas] = useState<string[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(100);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const isInitialMount = useRef(true);
  const fetchAbortController = useRef<AbortController | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      const response = await inventoryService.getAllProducts(
        searchTerm || undefined,
        filterEPP ? "epp" : undefined,
        page,
        limit
      );
      setProducts(response.data);
      setTotalPages(response.pagination.totalPages);
      setTotalItems(response.pagination.total);
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        setError(err.message);
      }
    }
  }, [searchTerm, filterEPP, page, limit]);

  const fetchAreas = async () => {
    try {
      const data = await inventoryService.getAreas();
      setAreas(data);
    } catch (err) {
      console.error("Error fetching areas:", err);
    }
  };

  const fetchCategorias = async () => {
    try {
      const data = await inventoryService.getCategorias();
      setCategorias(data);
    } catch (err) {
      console.error("Error fetching categorias:", err);
    }
  };

  const refetch = useCallback(
    async (options?: { silent?: boolean }) => {
      // Cancelar peticiones anteriores si existen
      if (fetchAbortController.current) {
        fetchAbortController.current.abort();
      }
      fetchAbortController.current = new AbortController();

      const isSilent = options?.silent ?? false;
      try {
        if (isSilent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
        setError(null);
        await fetchProducts();
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        if (isSilent) {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
        fetchAbortController.current = null;
      }
    },
    [fetchProducts]
  );

  const createProduct = async (
    productData: CreateProductData
  ): Promise<Product | null> => {
    try {
      const newProduct = await inventoryService.createProduct(productData);
      if (newProduct) {
        await refetch({ silent: true });
      }
      return newProduct;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear producto");
      throw err;
    }
  };

  const updateProduct = async (
    id: number,
    productData: UpdateProductData
  ): Promise<Product | null> => {
    try {
      const updatedProduct = await inventoryService.updateProduct(
        id.toString(),
        productData
      );
      if (updatedProduct) {
        await refetch({ silent: true });
      }
      return updatedProduct;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al actualizar producto"
      );
      throw err;
    }
  };

  const deleteProduct = async (id: number): Promise<boolean> => {
    try {
      const success = await inventoryService.deleteProduct(id.toString());
      if (success) {
        await refetch({ silent: true });
      }
      return success;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al eliminar producto"
      );
      return false;
    }
  };

  const createArea = async (nombre: string): Promise<string | null> => {
    try {
      const newArea = await inventoryService.createArea(nombre);
      if (newArea) {
        await fetchAreas();
      }
      return newArea;
    } catch (err) {
      console.error("Error al crear área:", err);
      return null;
    }
  };

  const createCategoria = async (nombre: string): Promise<string | null> => {
    try {
      const newCategoria = await inventoryService.createCategoria(nombre);
      if (newCategoria) {
        await fetchCategorias();
      }
      return newCategoria;
    } catch (err) {
      console.error("Error al crear categoría:", err);
      return null;
    }
  };

  // Carga inicial única y optimizada
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);

        // Cargar todo en paralelo para mejor performance
        const [areasData, categoriasData] = await Promise.all([
          inventoryService.getAreas(),
          inventoryService.getCategorias(),
        ]);

        setAreas(areasData);
        setCategorias(categoriasData);

        // Cargar productos inicialmente
        await fetchProducts();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al cargar datos iniciales"
        );
      } finally {
        setLoading(false);
      }
    };

    // Solo ejecutar una vez al montar el componente
    if (isInitialMount.current) {
      loadInitialData();
      isInitialMount.current = false;
    }
  }, []); // Array vacío para ejecutar solo al montar

  // Efecto para cargar productos cuando cambian los parámetros de búsqueda o filtro
  useEffect(() => {
    if (!isInitialMount.current) {
      // Si cambia la búsqueda o el filtro, resetear a página 1 y recargar
      if (page !== 1) {
        setPage(1);
      } else {
        // Si ya estamos en página 1, cargar directamente
        refetch();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filterEPP]);

  // Efecto para cargar productos cuando cambian page o limit
  useEffect(() => {
    if (!isInitialMount.current) {
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  return {
    products,
    loading,
    refreshing,
    error,
    searchTerm,
    filterEPP,
    setFilterEPP,
    areas,
    categorias,
    setSearchTerm,
    refetch,
    createProduct,
    updateProduct,
    deleteProduct,
    createArea,
    createCategoria,
    page,
    limit,
    totalPages,
    totalItems,
    setPage,
    setLimit,
  };
};
