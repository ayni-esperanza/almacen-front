export interface EquipmentReport {
  id: string;
  equipo: string;
  serieCodigo: string;
  cantidad: number;
  estadoEquipo: 'Bueno' | 'Regular' | 'Malo' | 'En Reparación';
  responsable: string;
  fechaSalida: string;
  horaSalida: string;
  areaProyecto: string;
  firma: string;
  fechaRetorno?: string;
  horaRetorno?: string;
  estadoRetorno?: 'Bueno' | 'Regular' | 'Malo' | 'Dañado';
  firmaRetorno?: string;
}
