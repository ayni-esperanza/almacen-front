import { apiClient } from "../../../shared/services/api";
import { Provider } from "../types";

export interface CreateProviderData {
  name: string;
  email: string;
  address: string;
  phones: string[];
  photoUrl?: string;
}

export type UpdateProviderData = Partial<CreateProviderData>;

class ProvidersService {
  async getAllProviders(): Promise<Provider[]> {
    const response = await apiClient.get<Provider[]>("/providers");

    if (response.error) {
      console.error("Error fetching providers:", response.error);
      return [];
    }

    return response.data || [];
  }

  async getProvider(id: number): Promise<Provider | null> {
    const response = await apiClient.get<Provider>(`/providers/${id}`);

    if (response.error) {
      console.error("Error fetching provider:", response.error);
      return null;
    }

    return response.data || null;
  }

  async createProvider(
    providerData: CreateProviderData
  ): Promise<Provider | null> {
    const response = await apiClient.post<Provider>("/providers", providerData);

    if (response.error) {
      console.error("Error creating provider:", response.error);
      throw new Error(response.error);
    }

    return response.data || null;
  }

  async updateProvider(
    id: number,
    providerData: UpdateProviderData
  ): Promise<Provider | null> {
    const response = await apiClient.patch<Provider>(
      `/providers/${id}`,
      providerData
    );

    if (response.error) {
      console.error("Error updating provider:", response.error);
      throw new Error(response.error);
    }

    return response.data || null;
  }

  async deleteProvider(id: number): Promise<boolean> {
    const response = await apiClient.delete(`/providers/${id}`);

    if (response.error) {
      console.error("Error deleting provider:", response.error);
      return false;
    }

    return true;
  }
}

export const providersService = new ProvidersService();
