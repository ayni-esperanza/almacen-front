import React from "react";

interface TableWithFixedHeaderProps {
  children: React.ReactNode;
  className?: string;
  maxHeight?: string;
}

export const TableWithFixedHeader: React.FC<TableWithFixedHeaderProps> = ({
  children,
  className = "",
  maxHeight = "600px",
}) => {
  return (
    <div
      className={`overflow-auto rounded-lg border border-gray-200 bg-white shadow-sm dark:border-slate-900 dark:bg-slate-950/40 ${className}`}
      style={{ maxHeight }}
    >
      <table className="w-full text-sm text-gray-700 dark:text-slate-200">
        {children}
      </table>
    </div>
  );
};
