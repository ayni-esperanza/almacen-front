import React from 'react';
import { Package, AlertTriangle, DollarSign } from 'lucide-react';

const InventoryDashboard: React.FC = () => {
  // Datos de ejemplo
  const stats = [
    {
      icon: <Package className="h-5 w-5 text-orange-600 dark:text-orange-300" />,
      label: 'Total Productos',
      value: '6',
      valueClass: 'text-orange-600 dark:text-orange-300',
      iconBg: 'bg-orange-100 dark:bg-orange-500/15'
    },
    {
      icon: <DollarSign className="h-5 w-5 text-green-600 dark:text-emerald-300" />,
      label: 'Valor Total',
      value: 'S/ 120.00',
      valueClass: 'text-green-600 dark:text-emerald-300',
      iconBg: 'bg-green-100 dark:bg-emerald-500/15'
    },
    {
      icon: <AlertTriangle className="h-5 w-5 text-red-600 dark:text-rose-300" />,
      label: 'Crítico',
      value: 'Guantes',
      valueClass: 'text-red-600 dark:text-rose-300',
      iconBg: 'bg-red-100 dark:bg-rose-500/15'
    },
    {
      icon: <Package className="h-5 w-5 text-blue-600 dark:text-sky-300" />,
      label: 'Más Solicitado',
      value: 'Cascos',
      valueClass: 'text-blue-600 dark:text-sky-300',
      iconBg: 'bg-blue-100 dark:bg-sky-500/15'
    },
    {
      icon: <Package className="h-5 w-5 text-purple-600 dark:text-violet-300" />,
      label: 'Menos Solicitado',
      value: 'Mascarilla',
      valueClass: 'text-purple-600 dark:text-violet-300',
      iconBg: 'bg-purple-100 dark:bg-violet-500/15'
    },
  ];

  return (
    <div className="mt-6 mb-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        {stats.map((stat, idx) => (
          <div key={idx} className="rounded-lg border border-transparent bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.iconBg}`}>
                  {stat.icon}
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-slate-400">{stat.label}</p>
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
