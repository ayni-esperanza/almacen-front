import React from "react";
import { ExpenseReport } from "../types";
import { Pagination } from "../../../shared/components/Pagination";
import { TableWithFixedHeader } from "../../../shared/components/TableWithFixedHeader";
import { usePagination } from "../../../shared/hooks/usePagination";

interface ExpenseReportTableProps {
  data: ExpenseReport[];
  loading?: boolean;
}

// Optimización: Memoizar componente
export const ExpenseReportTable: React.FC<ExpenseReportTableProps> = React.memo(
  ({ data, loading = false }) => {
    const containerClasses =
      "rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-950";
    const headingClasses =
      "px-2 text-lg font-semibold text-gray-800 dark:text-slate-100";
    const tableHeaderClasses =
      "bg-gray-50 px-6 py-3 text-left text-sm font-semibold text-gray-600 shadow-sm dark:bg-slate-900 dark:text-slate-300";
    const cellTextClasses =
      "px-6 py-4 text-sm text-gray-900 dark:text-slate-200";
    const badgeCurrencyClasses =
      "px-6 py-4 whitespace-nowrap text-sm font-semibold text-emerald-600 dark:text-emerald-300";
    const quantityCellClasses =
      "px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-slate-200";

    const {
      paginatedData: paginatedData,
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage,
      handlePageChange,
      handleItemsPerPageChange,
    } = usePagination({ data: data, initialItemsPerPage: 100 });
    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat("es-PE", {
        style: "currency",
        currency: "PEN",
        minimumFractionDigits: 2,
      }).format(value);
    };

    if (loading) {
      return (
        <div className={containerClasses}>
          <h3 className={headingClasses}>Detalle de Gastos</h3>
          <div className="flex h-32 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-green-500"></div>
          </div>
        </div>
      );
    }

    if (!data || data.length === 0) {
      return (
        <div className={containerClasses}>
          <h3 className={headingClasses}>Detalle de Gastos</h3>
          <div className="py-8 text-center text-gray-500 dark:text-slate-400">
            No hay datos disponibles para mostrar
          </div>
        </div>
      );
    }

    const getAreaProjectLabel = (area: string, project?: string) => {
      if (!project) {
        return area;
      }
      return `${area} / ${project}`;
    };

    return (
      <div className={containerClasses}>
        <div className="mb-3 flex items-center justify-between px-2">
          <h3 className={headingClasses}>Detalle de Gastos</h3>
          <span className="text-sm text-gray-500 dark:text-slate-400">
            Total registros: {data.length}
          </span>
        </div>

        <div
          key={`${currentPage}-${itemsPerPage}`}
          className="overflow-x-auto fade-section"
        >
          <table className="w-full text-sm text-gray-700 dark:text-slate-200">
            {/* HEADER DE TABLA */}
            <thead className="bg-gray-50 dark:bg-slate-900">
            <tr>
              <th className={tableHeaderClasses}>Código</th>
              <th className={tableHeaderClasses}>Nombre</th>
              <th className={tableHeaderClasses}>Área/ Proyecto</th>
              <th className={tableHeaderClasses}>Stock Requerido</th>
              <th className={tableHeaderClasses}>Costo Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white dark:divide-slate-800 dark:bg-slate-950">
            {paginatedData.map((item, index) => (
              <tr
                key={index}
                className="transition-colors hover:bg-gray-50 dark:hover:bg-slate-900/40"
              >
                <td
                  className={`${cellTextClasses} whitespace-nowrap font-medium`}
                >
                  {item.codigoProducto}
                </td>
                <td className={`${cellTextClasses} max-w-xs truncate`}>
                  {item.descripcion}
                </td>
                <td className={`${cellTextClasses} whitespace-nowrap`}>
                  {getAreaProjectLabel(item.area, item.proyecto)}
                </td>
                <td className={quantityCellClasses}>{item.cantidad}</td>
                <td className={badgeCurrencyClasses}>
                  {formatCurrency(item.costoTotal)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50 dark:bg-slate-900">
            <tr>
              <td
                colSpan={4}
                className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-slate-100"
              >
                Total General:
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600 dark:text-emerald-300">
                {formatCurrency(
                  data.reduce((sum, item) => sum + item.costoTotal, 0)
                )}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
        </div>

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
  }
);
