import React from 'react';
import { EquipmentReport } from '../types';
import { Pagination } from '../../../shared/components/Pagination';
import { TableWithFixedHeader } from '../../../shared/components/TableWithFixedHeader';
import { usePagination } from '../../../shared/hooks/usePagination';
import { Wrench, Clock, User, MapPin, Search } from 'lucide-react';
import { ReturnEquipmentData } from '../../../shared/services/equipment.service';

interface EquipmentTableProps {
  equipments: EquipmentReport[];
  loading?: boolean;
  error?: string | null;
  refetch?: () => Promise<void>;
  onReturn?: (id: number, returnData: ReturnEquipmentData) => Promise<EquipmentReport | null>;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Bueno':
      return 'bg-green-100 text-green-800';
    case 'Regular':
      return 'bg-yellow-100 text-yellow-800';
    case 'Malo':
    case 'Dañado':
      return 'bg-red-100 text-red-800';
    case 'En Reparación':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const EquipmentTable: React.FC<EquipmentTableProps> = ({ equipments }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  
  const filteredEquipments = equipments.filter(equipment =>
    equipment.equipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    equipment.serieCodigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    equipment.responsable.toLowerCase().includes(searchTerm.toLowerCase()) ||
    equipment.areaProyecto.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const {
    paginatedData: paginatedEquipments,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    handlePageChange,
    handleItemsPerPageChange,
  } = usePagination({ data: filteredEquipments, initialItemsPerPage: 15 });

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-6">
        <div className="flex items-center space-x-3">
          <Wrench className="w-6 h-6" />
          <h2 className="text-xl font-bold">Reporte de Salidas de Herramientas/Equipos</h2>
        </div>
      </div>
      
      {/* Search Filter */}
      <div className="p-4 bg-gray-50 border-b">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por equipo, código, responsable o área..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      
      <TableWithFixedHeader maxHeight="600px">
        <thead className="bg-gray-50 sticky top-0 z-10">
          <tr className="border-b border-gray-200">
            <th className="px-3 py-4 text-left font-semibold text-gray-700 bg-gray-50">Equipo</th>
            <th className="px-3 py-4 text-left font-semibold text-gray-700 bg-gray-50">Serie/Código</th>
            <th className="px-3 py-4 text-left font-semibold text-gray-700 bg-gray-50">Cant.</th>
            <th className="px-3 py-4 text-left font-semibold text-gray-700 bg-gray-50">Estado Equipo</th>
            <th className="px-3 py-4 text-left font-semibold text-gray-700 bg-gray-50">Responsable</th>
            <th className="px-3 py-4 text-left font-semibold text-gray-700 bg-gray-50">Fecha Salida</th>
            <th className="px-3 py-4 text-left font-semibold text-gray-700 bg-gray-50">Hora Salida</th>
            <th className="px-3 py-4 text-left font-semibold text-gray-700 bg-gray-50">Área/Proyecto</th>
            <th className="px-3 py-4 text-left font-semibold text-gray-700 bg-gray-50">Firma</th>
            <th className="px-3 py-4 text-left font-semibold text-gray-700 bg-gray-50">Fecha Retorno</th>
            <th className="px-3 py-4 text-left font-semibold text-gray-700 bg-gray-50">Hora Retorno</th>
            <th className="px-3 py-4 text-left font-semibold text-gray-700 bg-gray-50">Estado Retorno</th>
            <th className="px-3 py-4 text-left font-semibold text-gray-700 bg-gray-50">Firma Retorno</th>
          </tr>
        </thead>
        <tbody>
          {paginatedEquipments.map((equipment) => (
            <tr
              key={equipment.id}
              className="border-b border-gray-100 hover:bg-blue-50 transition-colors"
            >
              <td className="px-3 py-4 font-medium text-gray-900">{equipment.equipo}</td>
              <td className="px-3 py-4 font-mono text-gray-700">{equipment.serieCodigo}</td>
              <td className="px-3 py-4 text-center font-medium">{equipment.cantidad}</td>
              <td className="px-3 py-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(equipment.estadoEquipo)}`}>
                  {equipment.estadoEquipo}
                </span>
              </td>
              <td className="px-3 py-4">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{equipment.responsable}</span>
                </div>
              </td>
              <td className="px-3 py-4 text-gray-700">{equipment.fechaSalida}</td>
              <td className="px-3 py-4">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{equipment.horaSalida}</span>
                </div>
              </td>
              <td className="px-3 py-4">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                    {equipment.areaProyecto}
                  </span>
                </div>
              </td>
              <td className="px-3 py-4 font-mono text-blue-600 font-medium">{equipment.firma}</td>
              <td className="px-3 py-4 text-gray-700">{equipment.fechaRetorno || '-'}</td>
              <td className="px-3 py-4">
                {equipment.horaRetorno ? (
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{equipment.horaRetorno}</span>
                  </div>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </td>
              <td className="px-3 py-4">
                {equipment.estadoRetorno ? (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(equipment.estadoRetorno)}`}>
                    {equipment.estadoRetorno}
                  </span>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </td>
              <td className="px-3 py-4">
                {equipment.firmaRetorno ? (
                  <span className="font-mono text-blue-600 font-medium">{equipment.firmaRetorno}</span>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </TableWithFixedHeader>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />
    </div>
  );
};
