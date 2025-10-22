export interface ExpenseReport {
  id: string;
  area: string;
  proyecto?: string;
  fecha: string;
  codigoProducto: string;
  descripcion: string;
  precioUnitario: number;
  cantidad: number;
  costoTotal: number;
  responsable?: string;
}

export interface MonthlyExpenseData {
  mes: string;
  area: string;
  proyecto?: string;
  totalGasto: number;
  cantidadMovimientos: number;
}

export interface AreaExpenseData {
  area: string;
  totalGasto: number;
  cantidadMovimientos: number;
  proyectos: ProjectExpenseData[];
}

export interface ProjectExpenseData {
  proyecto: string;
  totalGasto: number;
  cantidadMovimientos: number;
}

export interface ReportFilters {
  fechaInicio: string;
  fechaFin: string;
  area?: string;
  proyecto?: string;
  tipoReporte: "area" | "proyecto";
}

export interface ChartData {
  name: string;
  gasto: number;
  movimientos: number;
}

// Nuevos tipos para alertas de stock
export interface StockAlert {
  id: string;
  codigo: string;
  nombre: string;
  stockActual: number;
  stockMinimo: number;
  ubicacion: string;
  categoria: string;
  proveedor: string;
  ultimaActualizacion: string;
  estado: "critico" | "bajo" | "normal";
}

export interface StockAlertFilters {
  categoria?: string;
  ubicacion?: string;
  estado?: "critico" | "bajo" | "normal";
  mostrarSoloCriticos?: boolean;
}
