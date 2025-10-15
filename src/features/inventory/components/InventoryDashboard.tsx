import React from 'react';
import { Package, AlertTriangle, DollarSign} from 'lucide-react';

const InventoryDashboard: React.FC = () => {
  // Datos de ejemplo
  const stats = [
    {
      icon: <Package className="w-5 h-5 text-orange-600" />,
      bg: "bg-orange-100",
      label: "Total de Productos",
      value: "6",
      valueClass: "text-gray-900",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600"
    },
    {
      icon: <DollarSign className="w-5 h-5 text-green-600" />,
      bg: "bg-green-100",
      label: "Valor Total",
      value: "S/ 120.00",
      valueClass: "text-green-600",
      iconBg: "bg-green-100",
      iconColor: "text-green-600"
    },
    {
      icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
      bg: "bg-red-100",
      label: "Crítico",
      value: "Guantes",
      valueClass: "text-red-600",
      iconBg: "bg-red-100",
      iconColor: "text-red-600"
    },
    {
      icon: <Package className="w-5 h-5 text-blue-600" />,
      bg: "bg-blue-100",
      label: "Más Solicitado",
      value: "Cascos",
      valueClass: "text-blue-600",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      icon: <Package className="w-5 h-5 text-purple-600" />,
      bg: "bg-purple-100",
      label: "Menos Solicitado",
      value: "Mascarilla",
      valueClass: "text-purple-600",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600"
    },
  ];

  return (
    <div className="mt-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 ${stat.iconBg} rounded-lg flex items-center justify-center`}>
                  {stat.icon}
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className={`text-lg font-semibold ${stat.valueClass}`}>{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InventoryDashboard;
