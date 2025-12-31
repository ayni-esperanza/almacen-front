import { useState, useEffect } from "react";
import { Provider } from "../types";
import {
  providersService,
  CreateProviderData,
  UpdateProviderData,
} from "../services/providers.service";
import { validateProviderForm, cleanPhones, ProviderFormData } from "../utils/validation";

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
      const errorMessage = err instanceof Error ? err.message : "Error al cargar proveedores";
      setError(errorMessage);
      console.error("Error fetching providers:", err);
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
      // Validar datos antes de enviar
      const cleanedPhones = cleanPhones(providerData.phones);
      const validationData: ProviderFormData = {
        ...providerData,
        phones: cleanedPhones,
      };
      
      const validationError = validateProviderForm(validationData);
      if (validationError) {
        throw new Error(validationError.message);
      }

      // Limpiar array de teléfonos antes de enviar
      const dataToSend = {
        ...providerData,
        phones: cleanedPhones,
      };

      const newProvider = await providersService.createProvider(dataToSend);
      if (newProvider) {
        await refetch(); // Refresh the list
      }
      return newProvider;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al crear proveedor";
      setError(errorMessage);
      console.error("Error creating provider:", err);
      throw err;
    }
  };

  const updateProvider = async (
    id: number,
    providerData: UpdateProviderData
  ): Promise<Provider | null> => {
    try {
      // Limpiar teléfonos si se incluyen en la actualización
      let dataToSend = providerData;
      if (providerData.phones) {
        const cleanedPhones = cleanPhones(providerData.phones);
        dataToSend = {
          ...providerData,
          phones: cleanedPhones,
        };

        // Validar datos
        const validationData: ProviderFormData = {
          name: providerData.name || "",
          email: providerData.email || "",
          address: providerData.address || "",
          phones: cleanedPhones,
          photoUrl: providerData.photoUrl,
        };
        
        const validationError = validateProviderForm(validationData);
        if (validationError) {
          throw new Error(validationError.message);
        }
      }

      const updatedProvider = await providersService.updateProvider(
        id,
        dataToSend
      );
      if (updatedProvider) {
        await refetch(); // Refresh the list
      }
      return updatedProvider;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al actualizar proveedor";
      setError(errorMessage);
      console.error("Error updating provider:", err);
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
      const errorMessage = err instanceof Error ? err.message : "Error al eliminar proveedor";
      setError(errorMessage);
      console.error("Error deleting provider:", err);
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
