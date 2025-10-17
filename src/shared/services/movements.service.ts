import { apiClient } from "./api.ts";
import { MovementEntry, MovementExit } from "../../features/movements/types/index.ts";

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

export interface UpdateEntryData {
  fecha?: string;
  descripcion?: string;
  precioUnitario?: number;
  cantidad?: number;
  responsable?: string | null;
  area?: string | null;
}

export interface UpdateExitData {
  fecha?: string;
  descripcion?: string;
  precioUnitario?: number;
  cantidad?: number;
  responsable?: string | null;
  area?: string | null;
  proyecto?: string | null;
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

  async updateEntry(id: number, entryData: UpdateEntryData): Promise<MovementEntry | null> {
    const payload: UpdateEntryData = {};

    if (entryData.fecha) {
      payload.fecha = formatDateToDMY(entryData.fecha);
    }

    if (entryData.descripcion !== undefined) {
      payload.descripcion = entryData.descripcion;
    }

    if (entryData.precioUnitario !== undefined) {
      payload.precioUnitario = Number(entryData.precioUnitario);
    }

    if (entryData.cantidad !== undefined) {
      payload.cantidad = parseInt(String(entryData.cantidad), 10);
    }

    if (entryData.responsable !== undefined) {
      const trimmed = entryData.responsable?.trim() ?? '';
      payload.responsable = trimmed === '' ? null : trimmed;
    }

    if (entryData.area !== undefined) {
      const trimmed = entryData.area?.trim() ?? '';
      payload.area = trimmed === '' ? null : trimmed;
    }

    const response = await apiClient.patch<MovementEntry>(`/movements/entries/${id}`, payload);
    if (response.error) {
      throw new Error(response.error);
    }

    return response.data || null;
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
    const payload: CreateExitData = {
      fecha: formatDateToDMY(exitData.fecha),
      codigoProducto: exitData.codigoProducto,
      descripcion: exitData.descripcion,
      precioUnitario:
        typeof exitData.precioUnitario === "string"
          ? parseFloat(exitData.precioUnitario as unknown as string)
          : exitData.precioUnitario,
      cantidad:
        typeof exitData.cantidad === "string"
          ? parseInt(exitData.cantidad as unknown as string, 10)
          : exitData.cantidad,
      responsable: exitData.responsable?.trim() || undefined,
      area: exitData.area?.trim() || undefined,
      proyecto: exitData.proyecto?.trim() || undefined,
    };

    const response = await apiClient.post<MovementExit>(
      "/movements/exits",
      payload
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

  async updateExit(id: number, exitData: UpdateExitData): Promise<MovementExit | null> {
    const payload: UpdateExitData = {};

    if (exitData.fecha) {
      payload.fecha = formatDateToDMY(exitData.fecha);
    }

    if (exitData.descripcion !== undefined) {
      payload.descripcion = exitData.descripcion;
    }

    if (exitData.precioUnitario !== undefined) {
      payload.precioUnitario = Number(exitData.precioUnitario);
    }

    if (exitData.cantidad !== undefined) {
      payload.cantidad = parseInt(String(exitData.cantidad), 10);
    }

    if (exitData.responsable !== undefined) {
      const trimmed = exitData.responsable?.trim() ?? '';
      payload.responsable = trimmed === '' ? null : trimmed;
    }

    if (exitData.area !== undefined) {
      const trimmed = exitData.area?.trim() ?? '';
      payload.area = trimmed === '' ? null : trimmed;
    }

    if (exitData.proyecto !== undefined) {
      const trimmed = exitData.proyecto?.trim() ?? '';
      payload.proyecto = trimmed === '' ? null : trimmed;
    }

    const response = await apiClient.patch<MovementExit>(`/movements/exits/${id}`, payload);
    if (response.error) {
      throw new Error(response.error);
    }

    return response.data || null;
  }
}

export const movementsService = new MovementsService();
