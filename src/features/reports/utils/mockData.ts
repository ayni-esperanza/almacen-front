import { ExpenseReport, MonthlyExpenseData, AreaExpenseData } from '../types';

// Datos de ejemplo para el reporte de gastos
export const mockExpenseReports: ExpenseReport[] = [
  {
    id: '1',
    area: 'ALMACEN',
    proyecto: 'Proyecto A',
    fecha: '15/01/2025',
    codigoProducto: 'AF2025',
    descripcion: 'AFLOJA TODO',
    precioUnitario: 12.00,
    cantidad: 5,
    costoTotal: 60.00,
    responsable: 'Juan Pérez'
  },
  {
    id: '2',
    area: 'MECANICA',
    proyecto: 'Proyecto B',
    fecha: '18/01/2025',
    codigoProducto: 'AT055',
    descripcion: 'ALAMBRE DE SOLDADURA',
    precioUnitario: 50.00,
    cantidad: 2,
    costoTotal: 100.00,
    responsable: 'María García'
  },
  {
    id: '3',
    area: 'ALMACEN',
    proyecto: 'Proyecto A',
    fecha: '20/01/2025',
    codigoProducto: 'AC1P1',
    descripcion: 'ACOPLES',
    precioUnitario: 6.00,
    cantidad: 10,
    costoTotal: 60.00,
    responsable: 'Carlos López'
  },
  {
    id: '4',
    area: 'BROCHA',
    proyecto: 'Proyecto C',
    fecha: '22/01/2025',
    codigoProducto: 'BC001',
    descripcion: 'Brocha cerda 4"',
    precioUnitario: 3.00,
    cantidad: 20,
    costoTotal: 60.00,
    responsable: 'Ana Rodríguez'
  },
  {
    id: '5',
    area: 'MECANICA',
    proyecto: 'Proyecto B',
    fecha: '25/01/2025',
    codigoProducto: 'AT001',
    descripcion: 'Alambre trenzado - adriano',
    precioUnitario: 40.00,
    cantidad: 3,
    costoTotal: 120.00,
    responsable: 'Luis Martínez'
  },
  {
    id: '6',
    area: 'ALMACEN',
    proyecto: 'Proyecto A',
    fecha: '28/01/2025',
    codigoProducto: 'AF2025',
    descripcion: 'AFLOJA TODO',
    precioUnitario: 12.00,
    cantidad: 3,
    costoTotal: 36.00,
    responsable: 'Juan Pérez'
  },
  {
    id: '7',
    area: 'OTRO',
    proyecto: 'Proyecto D',
    fecha: '30/01/2025',
    codigoProducto: 'AT001',
    descripcion: 'Alambre trenzado - adriano',
    precioUnitario: 40.00,
    cantidad: 2,
    costoTotal: 80.00,
    responsable: 'Pedro Sánchez'
  }
];

export const mockMonthlyExpenseData: MonthlyExpenseData[] = [
  {
    mes: '2025-01',
    area: 'ALMACEN',
    proyecto: 'Proyecto A',
    totalGasto: 156.00,
    cantidadMovimientos: 3
  },
  {
    mes: '2025-01',
    area: 'MECANICA',
    proyecto: 'Proyecto B',
    totalGasto: 220.00,
    cantidadMovimientos: 2
  },
  {
    mes: '2025-01',
    area: 'BROCHA',
    proyecto: 'Proyecto C',
    totalGasto: 60.00,
    cantidadMovimientos: 1
  },
  {
    mes: '2025-01',
    area: 'OTRO',
    proyecto: 'Proyecto D',
    totalGasto: 80.00,
    cantidadMovimientos: 1
  }
];

export const mockAreaExpenseData: AreaExpenseData[] = [
  {
    area: 'ALMACEN',
    totalGasto: 156.00,
    cantidadMovimientos: 3,
    proyectos: [
      {
        proyecto: 'Proyecto A',
        totalGasto: 156.00,
        cantidadMovimientos: 3
      }
    ]
  },
  {
    area: 'MECANICA',
    totalGasto: 220.00,
    cantidadMovimientos: 2,
    proyectos: [
      {
        proyecto: 'Proyecto B',
        totalGasto: 220.00,
        cantidadMovimientos: 2
      }
    ]
  },
  {
    area: 'BROCHA',
    totalGasto: 60.00,
    cantidadMovimientos: 1,
    proyectos: [
      {
        proyecto: 'Proyecto C',
        totalGasto: 60.00,
        cantidadMovimientos: 1
      }
    ]
  },
  {
    area: 'OTRO',
    totalGasto: 80.00,
    cantidadMovimientos: 1,
    proyectos: [
      {
        proyecto: 'Proyecto D',
        totalGasto: 80.00,
        cantidadMovimientos: 1
      }
    ]
  }
];

// Función para filtrar datos según los filtros aplicados
export const filterExpenseReports = (
  data: ExpenseReport[],
  filters: {
    fechaInicio: string;
    fechaFin: string;
    area?: string;
    proyecto?: string;
    tipoReporte: 'area' | 'proyecto';
  }
): ExpenseReport[] => {
  return data.filter(item => {
    // Filtrar por fecha
    const itemDate = new Date(item.fecha.split('/').reverse().join('-'));
    const startDate = new Date(filters.fechaInicio);
    const endDate = new Date(filters.fechaFin);
    
    if (itemDate < startDate || itemDate > endDate) {
      return false;
    }

    // Filtrar por área
    if (filters.area && item.area !== filters.area) {
      return false;
    }

    // Filtrar por proyecto
    if (filters.proyecto && item.proyecto !== filters.proyecto) {
      return false;
    }

    return true;
  });
};

// Función para generar datos mensuales filtrados
export const generateMonthlyData = (
  data: ExpenseReport[],
  filters: {
    fechaInicio: string;
    fechaFin: string;
    area?: string;
    proyecto?: string;
    tipoReporte: 'area' | 'proyecto';
  }
): MonthlyExpenseData[] => {
  const filteredData = filterExpenseReports(data, filters);
  
  const monthlyMap = new Map<string, MonthlyExpenseData>();
  
  filteredData.forEach(item => {
    const monthKey = `2025-01`; // Simplificado para el ejemplo
    const existing = monthlyMap.get(monthKey);
    
    if (existing) {
      existing.totalGasto += item.costoTotal;
      existing.cantidadMovimientos += 1;
    } else {
      monthlyMap.set(monthKey, {
        mes: monthKey,
        area: item.area,
        proyecto: item.proyecto,
        totalGasto: item.costoTotal,
        cantidadMovimientos: 1
      });
    }
  });
  
  return Array.from(monthlyMap.values());
};

// Función para generar datos por área filtrados
export const generateAreaData = (
  data: ExpenseReport[],
  filters: {
    fechaInicio: string;
    fechaFin: string;
    area?: string;
    proyecto?: string;
    tipoReporte: 'area' | 'proyecto';
  }
): AreaExpenseData[] => {
  const filteredData = filterExpenseReports(data, filters);
  
  const areaMap = new Map<string, AreaExpenseData>();
  
  filteredData.forEach(item => {
    const existing = areaMap.get(item.area);
    
    if (existing) {
      existing.totalGasto += item.costoTotal;
      existing.cantidadMovimientos += 1;
      
      // Actualizar o agregar proyecto
      const projectIndex = existing.proyectos.findIndex(p => p.proyecto === item.proyecto);
      if (projectIndex >= 0) {
        existing.proyectos[projectIndex].totalGasto += item.costoTotal;
        existing.proyectos[projectIndex].cantidadMovimientos += 1;
      } else {
        existing.proyectos.push({
          proyecto: item.proyecto || 'Sin Proyecto',
          totalGasto: item.costoTotal,
          cantidadMovimientos: 1
        });
      }
    } else {
      areaMap.set(item.area, {
        area: item.area,
        totalGasto: item.costoTotal,
        cantidadMovimientos: 1,
        proyectos: [{
          proyecto: item.proyecto || 'Sin Proyecto',
          totalGasto: item.costoTotal,
          cantidadMovimientos: 1
        }]
      });
    }
  });
  
  return Array.from(areaMap.values());
};
