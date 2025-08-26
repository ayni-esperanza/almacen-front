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
  tipoReporte: 'area' | 'proyecto';
}

export interface ChartData {
  name: string;
  gasto: number;
  movimientos: number;
}
