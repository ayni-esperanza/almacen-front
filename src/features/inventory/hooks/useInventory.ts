import { useState, useEffect, useCallback, useRef } from "react";
import { Product } from "../types";
import {
  inventoryService,
  CreateProductData,
  UpdateProductData,
} from "../../../shared/services/inventory.service";

type RefetchOptions = {
  silent?: boolean;
};

export interface UseInventoryReturn {
  products: Product[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  searchTerm: string;
  filterEPP: boolean;
  setFilterEPP: (filter: boolean) => void;
  ubicaciones: string[];
  categorias: string[];
  setSearchTerm: (term: string) => void;
  refetch: (options?: RefetchOptions) => Promise<void>;
  createProduct: (productData: CreateProductData) => Promise<Product | null>;
  updateProduct: (
    id: number,
    productData: UpdateProductData,
  ) => Promise<Product | null>;
  deleteProduct: (id: number) => Promise<boolean>;
  createUbicacion: (nombre: string) => Promise<string | null>;
  updateUbicacion: (previousName: string, nextName: string) => Promise<string | null>;
  deleteUbicacion: (nombre: string) => Promise<boolean>;
  createCategoria: (nombre: string) => Promise<string | null>;
  updateCategoria: (
    previousName: string,
    nextName: string,
  ) => Promise<string | null>;
  deleteCategoria: (nombre: string) => Promise<boolean>;
  // Pagination states
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
}

export const useInventory = (): UseInventoryReturn => {
  const notifyStockAlertsUpdated = () => {
    window.dispatchEvent(new Event("stockAlertsUpdated"));
  };

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEPP, setFilterEPP] = useState(false);
  const [ubicaciones, setUbicaciones] = useState<string[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(100);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const fetchAbortController = useRef<AbortController | null>(null);
  //const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      const response = await inventoryService.getAllProducts(
        searchTerm || undefined,
        filterEPP ? "epp" : undefined,
        page,
        limit,
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

  const fetchAll = useCallback(
    async (options?: RefetchOptions) => {
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
    [fetchProducts],
  );

  const refetch = useCallback(
    async (options?: RefetchOptions) => {
      const isSilent = options?.silent;
      if (isSilent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      try {
        await fetchProducts();
      } finally {
        if (isSilent) {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    [fetchProducts],
  );

  const fetchUbicaciones = async () => {
    try {
      const data = await inventoryService.getUbicaciones();
      setUbicaciones(data);
      window.dispatchEvent(
        new CustomEvent("inventoryCatalogsUpdated", {
          detail: { type: "ubicaciones" },
        })
      );
    } catch (err) {
      console.error("Error fetching ubicaciones:", err);
    }
  };

  const fetchCategorias = async () => {
    try {
      const data = await inventoryService.getCategorias();
      setCategorias(data);
      window.dispatchEvent(
        new CustomEvent("inventoryCatalogsUpdated", {
          detail: { type: "categorias" },
        })
      );
    } catch (err) {
      console.error("Error fetching categorias:", err);
    }
  };

  const createProduct = async (
    productData: CreateProductData,
  ): Promise<Product | null> => {
    try {
      const newProduct = await inventoryService.createProduct(productData);
      if (newProduct) {
        await refetch({ silent: true });
        notifyStockAlertsUpdated();
      }
      return newProduct;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear producto");
      throw err;
    }
  };

  const updateProduct = async (
    id: number,
    productData: UpdateProductData,
  ): Promise<Product | null> => {
    try {
      const updatedProduct = await inventoryService.updateProduct(
        id.toString(),
        productData,
      );
      if (updatedProduct) {
        await refetch({ silent: true });
        notifyStockAlertsUpdated();
      }
      return updatedProduct;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al actualizar producto",
      );
      throw err;
    }
  };

  const deleteProduct = async (id: number): Promise<boolean> => {
    try {
      const success = await inventoryService.deleteProduct(id.toString());
      if (success) {
        await refetch({ silent: true });
        notifyStockAlertsUpdated();
      }
      return success;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al eliminar producto",
      );
      return false;
    }
  };

  const createUbicacion = async (nombre: string): Promise<string | null> => {
    try {
      const trimmed = nombre?.trim();
      if (!trimmed) {
        throw new Error('El nombre de la ubicación es obligatorio');
      }

      // Validar duplicados case-insensitive antes de enviar
      const isDuplicate = ubicaciones.some(
        (u) => u.toLowerCase() === trimmed.toLowerCase()
      );
      if (isDuplicate) {
        throw new Error(`La ubicación "${trimmed}" ya existe`);
      }

      const newUbicacion = await inventoryService.createUbicacion(trimmed);
      if (newUbicacion) {
        await fetchUbicaciones();
      }
      return newUbicacion;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear ubicación';
      console.error("Error al crear ubicación:", errorMessage);
      throw new Error(errorMessage);
    }
  };

  const createCategoria = async (nombre: string): Promise<string | null> => {
    try {
      const trimmed = nombre?.trim();
      if (!trimmed) {
        throw new Error('El nombre de la categoría es obligatorio');
      }

      // Validar duplicados case-insensitive antes de enviar
      const isDuplicate = categorias.some(
        (cat) => cat.toLowerCase() === trimmed.toLowerCase()
      );
      if (isDuplicate) {
        throw new Error(`La categoría "${trimmed}" ya existe`);
      }

      const newCategoria = await inventoryService.createCategoria(trimmed);
      if (newCategoria) {
        await fetchCategorias();
      }
      return newCategoria;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear categoría';
      console.error("Error al crear categoría:", errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateUbicacion = async (
    previousName: string,
    nextName: string,
  ): Promise<string | null> => {
    try {
      const updated = await inventoryService.updateUbicacion(previousName, nextName);
      if (updated) {
        await fetchUbicaciones();
        await refetch({ silent: true });
      }
      return updated;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al actualizar ubicación";
      setError(message);
      throw err;
    }
  };

  const deleteUbicacion = async (nombre: string): Promise<boolean> => {
    try {
      const success = await inventoryService.deleteUbicacion(nombre);
      if (success) {
        await fetchUbicaciones();
        await refetch({ silent: true });
      }
      return success;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al eliminar ubicación";
      setError(message);
      throw err;
    }
  };

  const updateCategoria = async (
    previousName: string,
    nextName: string,
  ): Promise<string | null> => {
    try {
      const updated = await inventoryService.updateCategoria(
        previousName,
        nextName,
      );
      if (updated) {
        await fetchCategorias();
        await refetch({ silent: true });
      }
      return updated;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al actualizar categoría";
      setError(message);
      throw err;
    }
  };

  const deleteCategoria = async (nombre: string): Promise<boolean> => {
    try {
      const success = await inventoryService.deleteCategoria(nombre);
      if (success) {
        await fetchCategorias();
        await refetch({ silent: true });
      }
      return success;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al eliminar categoría";
      setError(message);
      throw err;
    }
  };

  // Carga inicial de ubicaciones y categorías
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [ubicacionesData, categoriasData] = await Promise.all([
          inventoryService.getUbicaciones(),
          inventoryService.getCategorias(),
        ]);

        setUbicaciones(ubicacionesData);
        setCategorias(categoriasData);
      } catch (err) {
        console.error("Error loading initial data:", err);
      }
    };

    loadInitialData();
  }, []);

  // Carga de productos solo cuando cambian filterEPP, page o limit
  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterEPP, page, limit]);

  // Efecto con debounce para búsqueda
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (page !== 1) {
        setPage(1);
      } else {
        fetchProducts();
      }
    }, 500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  return {
    products,
    loading,
    refreshing,
    error,
    searchTerm,
    filterEPP,
    setFilterEPP,
    ubicaciones,
    categorias,
    setSearchTerm,
    refetch,
    createProduct,
    updateProduct,
    deleteProduct,
    createUbicacion,
    updateUbicacion,
    deleteUbicacion,
    createCategoria,
    updateCategoria,
    deleteCategoria,
    page,
    limit,
    totalPages,
    totalItems,
    setPage,
    setLimit,
  };
};
