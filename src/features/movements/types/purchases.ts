export interface PurchaseOrder {
  id: number;
  codigo: string;
  fecha: string;
  proveedor?: string;
  estado: 'borrador' | 'enviada' | 'recibida' | 'cancelada';
  cantidad: number; // Suma de cantidades de productos
  costo: number; // Suma de costos de productos
  observaciones?: string;
  productos?: PurchaseOrderProduct[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseOrderProduct {
  id: number;
  purchaseOrderId: number;
  fecha: string;
  codigo: string;
  nombre: string;
  area: string;
  proyecto: string;
  responsable: string;
  cantidad: number;
  costoUnitario: number;
  subtotal: number; // cantidad * costoUnitario
  createdAt: Date;
  updatedAt: Date;
}
