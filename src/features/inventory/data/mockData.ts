import { Product } from '../types';
import { MovementEntry, MovementExit } from '../../movements/types';
import { EquipmentReport } from '../../equipment/types';

export const productos: Product[] = [
  {
    id: '1',
    codigo: 'AF2025',
    descripcion: 'AFLOJA TODO',
    costoUnitario: 12.00,
    ubicacion: 'ALMACEN',
    entradas: 3,
    salidas: 2,
    stockActual: 1,
    unidadMedida: 'und',
    proveedor: 'FERRETERIA CENTRAL',
    costoTotal: 12.00
  },
  {
    id: '2',
    codigo: 'AC1P1',
    descripcion: 'ACOPLES',
    costoUnitario: 6.00,
    ubicacion: 'ALMACEN',
    entradas: 5,
    salidas: 1,
    stockActual: 4,
    unidadMedida: 'und',
    proveedor: 'PROVEEDOR A',
    costoTotal: 24.00
  },
  {
    id: '3',
    codigo: 'AT055',
    descripcion: 'ALAMBRE DE SOLDADURA',
    costoUnitario: 50.00,
    ubicacion: 'MECANICA',
    entradas: 2,
    salidas: 1,
    stockActual: 1,
    unidadMedida: 'und',
    proveedor: 'SOLDADURAS PERU',
    costoTotal: 50.00
  },
  {
    id: '4',
    codigo: 'AT001',
    descripcion: 'Alambre trenzado - adriano',
    costoUnitario: 40.00,
    ubicacion: 'OTRO',
    entradas: 4,
    salidas: 0,
    stockActual: 4,
    unidadMedida: 'und',
    proveedor: 'PROVEEDOR B',
    costoTotal: 160.00
  },
  {
    id: '5',
    codigo: 'BC001',
    descripcion: 'Brocha cerda 4"',
    costoUnitario: 3.00,
    ubicacion: 'BROCHA',
    entradas: 92,
    salidas: 80,
    stockActual: 12,
    unidadMedida: 'und',
    proveedor: 'BROCHAS SAC',
    costoTotal: 36.00
  }
];

export const entradas: MovementEntry[] = [
  {
    id: '1',
    fecha: '13/06/2024',
    codigoProducto: 'DCF005',
    descripcion: 'Disco corte 4.5"',
    precioUnitario: 2.48,
    cantidad: 2
  },
  {
    id: '2',
    fecha: '13/06/2024',
    codigoProducto: 'BC001',
    descripcion: 'Brocha cerda 4"',
    precioUnitario: 3.00,
    cantidad: 2
  },
  {
    id: '3',
    fecha: '14/06/2024',
    codigoProducto: 'TF001',
    descripcion: 'Cinta Teflon 1/2 Magnum',
    precioUnitario: 1.00,
    cantidad: 1
  }
];

export const salidas: MovementExit[] = [
  {
    id: '1',
    fecha: '13/06/2024',
    codigoProducto: 'MR001',
    descripcion: 'Marcador permanente 2.5 mm',
    precioUnitario: 0.71,
    cantidad: 1,
    responsable: 'diego',
    area: 'fibra',
    proyecto: 'Proyecto Alpha'
  },
  {
    id: '2',
    fecha: '14/06/2024',
    codigoProducto: 'MD001',
    descripcion: 'Tyvek talla L',
    precioUnitario: 6.50,
    cantidad: 1,
    responsable: 'henry',
    area: 'metalmecánica',
    proyecto: 'Proyecto Beta'
  }
];

export const equipmentReports: EquipmentReport[] = [
  {
    id: '1',
    equipo: 'Taladro Percutor',
    serieCodigo: 'TD001-2024',
    cantidad: 1,
    estadoEquipo: 'Bueno',
    responsable: 'Carlos Mendoza',
    fechaSalida: '15/06/2024',
    horaSalida: '08:30',
    areaProyecto: 'metalmecánica',
    firma: 'C.Mendoza',
    fechaRetorno: '15/06/2024',
    horaRetorno: '17:00',
    estadoRetorno: 'Bueno',
    firmaRetorno: 'C.Mendoza'
  },
  {
    id: '2',
    equipo: 'Soldadora MIG',
    serieCodigo: 'SM002-2024',
    cantidad: 1,
    estadoEquipo: 'Bueno',
    responsable: 'Ana García',
    fechaSalida: '16/06/2024',
    horaSalida: '09:15',
    areaProyecto: 'MECANICA',
    firma: 'A.García'
  },
  {
    id: '3',
    equipo: 'Amoladora Angular',
    serieCodigo: 'AA003-2024',
    cantidad: 2,
    estadoEquipo: 'Regular',
    responsable: 'Luis Torres',
    fechaSalida: '17/06/2024',
    horaSalida: '07:45',
    areaProyecto: 'fibra',
    firma: 'L.Torres',
    fechaRetorno: '17/06/2024',
    horaRetorno: '16:30',
    estadoRetorno: 'Regular',
    firmaRetorno: 'L.Torres'
  }
];

export const areas = [
  'ALMACEN',
  'DANPER',
  'electricidad',
  'EXTRUSORA',
  'fibra',
  'INYECTORA',
  'JARDINES',
  'LADRILLERA',
  'líneas de vida',
  'MECANICA',
  'metalmecánica',
  'OTRO',
  'BROCHA'
];
