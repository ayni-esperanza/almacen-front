export interface EquipmentReport {
  id: number;
  equipo: string;
  serieCodigo: string;
  cantidad: number;
  estadoEquipo: 'Bueno' | 'Regular' | 'Malo' | 'En_Reparacion' | 'Danado';
  responsable: string;
  fechaSalida: string;
  horaSalida: string;
  areaProyecto: string;
  firma: string;
  fechaRetorno?: string;
  horaRetorno?: string;
  estadoRetorno?: 'Bueno' | 'Regular' | 'Malo' | 'Danado';
  firmaRetorno?: string;
  createdAt: Date;
  updatedAt: Date;
}
