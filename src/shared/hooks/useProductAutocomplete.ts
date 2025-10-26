import { useState, useEffect, useCallback, useRef } from "react";
import { inventoryService } from "../services/inventory.service";
import { Product } from "../../features/inventory/types";

interface UseProductAutocompleteOptions {
  debounceMs?: number;
  minChars?: number;
}

interface UseProductAutocompleteReturn {
  product: Product | null;
  isLoading: boolean;
  error: string | null;
  searchProduct: (codigo: string) => void;
  reset: () => void;
}

export const useProductAutocomplete = (
  options: UseProductAutocompleteOptions = {}
): UseProductAutocompleteReturn => {
  const { debounceMs = 300, minChars = 2 } = options;

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ref para el timeout del debounce
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  // Ref para evitar búsquedas duplicadas
  const lastSearchedCode = useRef<string>("");

  const searchProduct = useCallback(
    (codigo: string) => {
      // Limpiar timeout anterior
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }

      // Validar longitud mínima
      if (!codigo || codigo.length < minChars) {
        setProduct(null);
        setError(null);
        return;
      }

      // Evitar búsquedas duplicadas
      if (codigo === lastSearchedCode.current) {
        return;
      }

      // Implementar debounce
      debounceTimeout.current = setTimeout(async () => {
        setIsLoading(true);
        setError(null);

        try {
          const foundProduct = await inventoryService.getProductByCode(codigo);

          if (foundProduct) {
            setProduct(foundProduct);
            lastSearchedCode.current = codigo;
          } else {
            setProduct(null);
            setError("Producto no encontrado");
          }
        } catch (err) {
          setProduct(null);
          setError("Error al buscar el producto");
          console.error("Error in product autocomplete:", err);
        } finally {
          setIsLoading(false);
        }
      }, debounceMs);
    },
    [debounceMs, minChars]
  );

  /**
   * Función para resetear el estado
   */
  const reset = useCallback(() => {
    setProduct(null);
    setError(null);
    setIsLoading(false);
    lastSearchedCode.current = "";

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
  }, []);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  return {
    product,
    isLoading,
    error,
    searchProduct,
    reset,
  };
};
