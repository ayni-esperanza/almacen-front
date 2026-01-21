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
  oc?: string;
  createdAt: Date;
  updatedAt: Date;
}
