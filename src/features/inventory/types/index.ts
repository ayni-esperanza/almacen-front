import { Provider } from "../../providers/types";

export interface Product {
  id: number;
  codigo: string;
  nombre: string;
  costoUnitario: number;
  ubicacion: string;
  entradas: number;
  salidas: number;
  stockActual: number;
  stockMinimo: number;
  unidadMedida: string;
  providerId: number;
  provider?: Provider;
  marca?: string;
  costoTotal: number;
  categoria?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PriceHistoryUser {
  id: number;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
}

export interface PriceHistoryProduct {
  codigo: string;
  nombre: string;
}

export interface PriceHistoryRecord {
  id: number;
  productoId: string;
  precioAnterior: number;
  precioNuevo: number;
  fechaCambio: string;
  usuarioId?: number | null;
  product?: PriceHistoryProduct;
  usuario?: PriceHistoryUser | null;
}

export interface PriceHistoryFilters {
  producto?: string;
  fechaInicio?: string;
  fechaFin?: string;
}
