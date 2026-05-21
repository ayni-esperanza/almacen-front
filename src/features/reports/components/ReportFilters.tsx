import React from "react";
import { SearchableSelect } from "../../../shared/components/SearchableSelect";
import DatePicker from "react-datepicker";
import { format, parse } from "date-fns";
import { es } from "date-fns/locale";
import { ReportFilters as ReportFiltersType } from "../types";

interface ReportFiltersProps {
  filters: ReportFiltersType;
  onFiltersChange: (filters: Partial<ReportFiltersType>) => void;
  areas: string[];
  proyectos: string[];
}

// Optimización: Memoizar componente para evitar re-renders innecesarios
export const ReportFilters: React.FC<ReportFiltersProps> = React.memo(
  ({ filters, onFiltersChange, areas, proyectos }) => {
    const handleChange = (
      field: keyof ReportFiltersType,
      value: string | undefined
    ) => {
      onFiltersChange({ [field]: value });
    };

    const containerClasses =
      "rounded-lg border border-transparent bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900";
    const labelClasses =
      "block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2";
    const inputClasses =
      "w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-700 transition focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-green-400 dark:focus:ring-green-500/30 [color-scheme:light] dark:[color-scheme:dark] cursor-pointer";

    const monthToDate = (value?: string) =>
      value ? parse(value, "yyyy-MM", new Date()) : null;

    return (
      <div className={containerClasses}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Tipo de Reporte */}
          <div>
            <label className={labelClasses}>Tipo de Reporte</label>
            <SearchableSelect
              name="tipoReporte"
              value={
                filters.tipoReporte === "area" ? "Por Área" : "Por Proyecto"
              }
              onChange={(value: string) =>
                handleChange(
                  "tipoReporte",
                  value === "Por Proyecto" ? "proyecto" : "area"
                )
              }
              options={["Por Área", "Por Proyecto"]}
              placeholder="Por Área"
              variant="report"
            />
          </div>

          {/* Fecha Inicio */}
          <div>
            <label className={labelClasses}>Fecha Inicio</label>
            <DatePicker
              selected={monthToDate(filters.fechaInicio)}
              onChange={(date: Date | null) =>
                handleChange("fechaInicio", date ? format(date, "yyyy-MM") : undefined)
              }
              dateFormat="MM/yyyy"
              showMonthYearPicker
              className={inputClasses}
              locale={es}
              portalId="root"
              placeholderText="Selecciona mes"
            />
          </div>

          {/* Fecha Fin */}
          <div>
            <label className={labelClasses}>Fecha Fin</label>
            <DatePicker
              selected={monthToDate(filters.fechaFin)}
              onChange={(date: Date | null) =>
                handleChange("fechaFin", date ? format(date, "yyyy-MM") : undefined)
              }
              dateFormat="MM/yyyy"
              showMonthYearPicker
              className={inputClasses}
              locale={es}
              portalId="root"
              placeholderText="Selecciona mes"
            />
          </div>

          {/* Área (solo si el tipo es por área) */}
          {filters.tipoReporte === "area" && (
            <div>
              <label className={labelClasses}>Área (Opcional)</label>
              <SearchableSelect
                name="area"
                value={filters.area || ""}
                onChange={(value: string) =>
                  handleChange(
                    "area",
                    value === "Todas las áreas" ? undefined : value
                  )
                }
                options={["Todas las áreas", ...areas]}
                placeholder="Todas las áreas"
                variant="report"
              />
            </div>
          )}

          {/* Proyecto (solo si el tipo es por proyecto) */}
          {filters.tipoReporte === "proyecto" && (
            <div>
              <label className={labelClasses}>Proyecto (Opcional)</label>
              <SearchableSelect
                name="proyecto"
                value={filters.proyecto || ""}
                onChange={(value: string) =>
                  handleChange(
                    "proyecto",
                    value === "Todos los proyectos" ? undefined : value
                  )
                }
                options={["Todos los proyectos", ...proyectos]}
                placeholder="Todos los proyectos"
                variant="report"
              />
            </div>
          )}
        </div>
      </div>
    );
  }
);
