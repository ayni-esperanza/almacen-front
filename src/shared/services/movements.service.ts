import { apiClient } from "./api";
import { MovementEntry, MovementExit } from "../../features/movements/types";

export interface CreateEntryData {
  fecha: string;
  codigoProducto: string;
  descripcion: string;
  precioUnitario: number;
  cantidad: number;
  responsable?: string;
  area?: string;
}

export interface CreateExitData {
  fecha: string;
  codigoProducto: string;
  descripcion: string;
  precioUnitario: number;
  cantidad: number;
  responsable?: string;
  area?: string;
  proyecto?: string;
}

export interface UpdateExitQuantityData {
  cantidad: number;
}

function formatDateToDMY(date: string): string {
  if (!date) return date;
  if (date.includes("/")) return date;
  const [yyyy, mm, dd] = date.split("-");
  if (!yyyy || !mm || !dd) return date;
  return `${dd}/${mm}/${yyyy}`;
}

class MovementsService {
  // === ENTRIES ===
  async getAllEntries(): Promise<MovementEntry[]> {
    const response = await apiClient.get<MovementEntry[]>("/movements/entries");
    if (response.error) {
      console.error("Error fetching entries:", response.error);
      return [];
    }
    return response.data || [];
  }

  async createMovementEntry(
    entryData: CreateEntryData
  ): Promise<MovementEntry> {
    const payload: CreateEntryData = {
      fecha: formatDateToDMY(entryData.fecha),
      codigoProducto: entryData.codigoProducto,
      descripcion: entryData.descripcion,
      precioUnitario:
        typeof entryData.precioUnitario === "string"
          ? parseFloat(entryData.precioUnitario as unknown as string)
          : entryData.precioUnitario,
      cantidad:
        typeof entryData.cantidad === "string"
          ? parseInt(entryData.cantidad as unknown as string, 10)
          : entryData.cantidad,
      responsable: entryData.responsable || undefined,
      area: entryData.area || undefined,
    };

    const response = await apiClient.post<MovementEntry>(
      "/movements/entries",
      payload
    );
    if (response.error) throw new Error(response.error);
    if (!response.data) throw new Error("Empty response while creating entry");
    return response.data;
  }

  // Alias para compatibilidad con tu hook useMovements
  async createEntry(entryData: CreateEntryData): Promise<MovementEntry> {
    return this.createMovementEntry(entryData);
  }

  // === EXITS ===
  async getAllExits(): Promise<MovementExit[]> {
    const response = await apiClient.get<MovementExit[]>("/movements/exits");
    if (response.error) {
      console.error("Error fetching exits:", response.error);
      return [];
    }
    return response.data || [];
  }

  async createExit(exitData: CreateExitData): Promise<MovementExit | null> {
    const response = await apiClient.post<MovementExit>(
      "/movements/exits",
      exitData
    );
    if (response.error) {
      console.error("Error creating exit:", response.error);
      throw new Error(response.error);
    }
    return response.data || null;
  }

  async updateExitQuantity(
    id: string,
    quantityData: UpdateExitQuantityData
  ): Promise<MovementExit | null> {
    const response = await apiClient.patch<MovementExit>(
      `/movements/exits/${id}/quantity`,
      quantityData
    );
    if (response.error) {
      console.error("Error updating exit quantity:", response.error);
      throw new Error(response.error);
    }
    return response.data || null;
  }
}

export const movementsService = new MovementsService();
