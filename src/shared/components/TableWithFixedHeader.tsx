import React from 'react';

interface TableWithFixedHeaderProps {
  children: React.ReactNode;
  className?: string;
  maxHeight?: string;
}

export const TableWithFixedHeader: React.FC<TableWithFixedHeaderProps> = ({
  children,
  className = '',
  maxHeight = '600px'
}) => {
  return (
    <div 
      className={`overflow-auto border border-gray-200 rounded-lg ${className}`}
      style={{ maxHeight }}
    >
      <table className="w-full">
        {children}
      </table>
    </div>
  );
};
