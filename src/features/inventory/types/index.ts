export interface Product {
  id: number;
  codigo: string;
  descripcion: string;
  costoUnitario: number;
  ubicacion: string;
  entradas: number;
  salidas: number;
  stockActual: number;
  unidadMedida: string;
  proveedor: string;
  costoTotal: number;
  categoria?: string;
  createdAt: Date;
  updatedAt: Date;
}
