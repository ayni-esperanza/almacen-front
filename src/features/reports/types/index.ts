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
  ocultarVistas?: boolean;
}

// Tipos para Dashboard de Stock
export interface CriticalProduct {
  codigo: string;
  nombre: string;
  stockActual: number;
  stockMinimo: number;
  porcentajeStockMinimo: number;
  ubicacion: string;
  categoria?: string;
}

export interface LeastMovedProduct {
  codigo: string;
  nombre: string;
  cantidadMovimientos: number;
  stockActual: number;
  ubicacion: string;
}

export interface MostMovedProduct {
  codigo: string;
  nombre: string;
  cantidadMovimientos: number;
  unidadesTotalesSalidas: number;
  stockActual: number;
  periodo: string;
}

export interface StockDashboard {
  totalProductos: number;
  valorTotalInventario: number;
  productoCritico?: CriticalProduct;
  productoMenosMovido?: LeastMovedProduct;
  productoMasMovido?: MostMovedProduct;
  periodoAnalisisDias: number;
}

// Tipos para Comparación de Reportes
export type ComparisonType = "area" | "proyecto";
export type VisualizationType = "bar" | "line";

export interface ComparisonItem {
  id: string;
  type: ComparisonType;
  label: string;
  area?: string;
  proyecto?: string;
  fechaInicio: string;
  fechaFin: string;
  color: string;
  visualizationType?: VisualizationType; // Para gráfico combo
}

export interface ComparisonData {
  id: string;
  label: string;
  totalGasto: number;
  cantidadMovimientos: number;
  monthlyData: MonthlyComparisonData[];
  color: string;
  visualizationType?: VisualizationType; // Para gráfico combo
}

export interface MonthlyComparisonData {
  mes: string;
  rawMes?: string;
  totalGasto: number;
  cantidadMovimientos: number;
}
