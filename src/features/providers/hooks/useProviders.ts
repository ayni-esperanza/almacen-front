import { useState, useEffect } from "react";
import { Provider } from "../types";
import {
  providersService,
  CreateProviderData,
  UpdateProviderData,
} from "../services/providers.service";

export interface UseProvidersReturn {
  providers: Provider[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createProvider: (
    providerData: CreateProviderData
  ) => Promise<Provider | null>;
  updateProvider: (
    id: number,
    providerData: UpdateProviderData
  ) => Promise<Provider | null>;
  deleteProvider: (id: number) => Promise<boolean>;
}

export const useProviders = (): UseProvidersReturn => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await providersService.getAllProviders();
      setProviders(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar proveedores"
      );
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await fetchProviders();
  };

  const createProvider = async (
    providerData: CreateProviderData
  ): Promise<Provider | null> => {
    try {
      const newProvider = await providersService.createProvider(providerData);
      if (newProvider) {
        await refetch(); // Refresh the list
      }
      return newProvider;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear proveedor");
      throw err;
    }
  };

  const updateProvider = async (
    id: number,
    providerData: UpdateProviderData
  ): Promise<Provider | null> => {
    try {
      const updatedProvider = await providersService.updateProvider(
        id,
        providerData
      );
      if (updatedProvider) {
        await refetch(); // Refresh the list
      }
      return updatedProvider;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al actualizar proveedor"
      );
      throw err;
    }
  };

  const deleteProvider = async (id: number): Promise<boolean> => {
    try {
      const success = await providersService.deleteProvider(id);
      if (success) {
        await refetch(); // Refresh the list
      }
      return success;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al eliminar proveedor"
      );
      return false;
    }
  };

  // Initial load
  useEffect(() => {
    fetchProviders();
  }, []);

  return {
    providers,
    loading,
    error,
    refetch,
    createProvider,
    updateProvider,
    deleteProvider,
  };
};
