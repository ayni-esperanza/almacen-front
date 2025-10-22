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
  proveedor: string;
  marca?: string;
  costoTotal: number;
  categoria?: string;
  createdAt: Date;
  updatedAt: Date;
}
