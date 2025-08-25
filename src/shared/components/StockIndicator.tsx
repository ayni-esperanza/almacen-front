import React from 'react';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface StockIndicatorProps {
  stock: number;
  className?: string;
}

export const StockIndicator: React.FC<StockIndicatorProps> = ({ stock, className = '' }) => {
  const getIndicatorStyles = () => {
    if (stock === 0) {
      return {
        color: 'text-red-600',
        bg: 'bg-red-100',
        icon: <XCircle className="w-4 h-4" />
      };
    }
    if (stock <= 3) {
      return {
        color: 'text-orange-600',
        bg: 'bg-orange-100',
        icon: <AlertTriangle className="w-4 h-4" />
      };
    }
    return {
      color: 'text-green-600',
      bg: 'bg-green-100',
      icon: <CheckCircle className="w-4 h-4" />
    };
  };

  const styles = getIndicatorStyles();

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles.bg} ${styles.color}`}>
        {stock}
      </span>
      <div className={styles.color}>
        {styles.icon}
      </div>
    </div>
  );
};
