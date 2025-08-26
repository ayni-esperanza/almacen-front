export interface MovementEntry {
  id: number;
  fecha: string;
  codigoProducto: string;
  descripcion: string;
  precioUnitario: number;
  cantidad: number;
  responsable?: string;
  area?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MovementExit {
  id: number;
  fecha: string;
  codigoProducto: string;
  descripcion: string;
  precioUnitario: number;
  cantidad: number;
  responsable?: string;
  area?: string;
  proyecto?: string;
  createdAt: Date;
  updatedAt: Date;
}
