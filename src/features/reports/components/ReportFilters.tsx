import React from "react";
import { SearchableSelect } from "../../../shared/components/SearchableSelect";
import DatePicker from "react-datepicker";
import { Calendar } from "lucide-react";
import { format, parse } from "date-fns";
import { es } from "date-fns/locale";
import { ReportFilters as ReportFiltersType } from "../types";

interface ReportFiltersProps {
  filters: ReportFiltersType;
  onFiltersChange: (filters: Partial<ReportFiltersType>) => void;
  areas: string[];
  empresas: string[];
  proyectos: string[];
}

// Optimización: Memoizar componente para evitar re-renders innecesarios
export const ReportFilters: React.FC<ReportFiltersProps> = React.memo(
  ({ filters, onFiltersChange, areas, empresas, proyectos }) => {
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
    const dateInputClasses = `${inputClasses} pl-10 relative z-0 border-gray-300 !focus:border-blue-500 !focus:ring-blue-100 !dark:focus:border-blue-400 !dark:focus:ring-blue-500/30`;

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
                filters.tipoReporte === "area"
                  ? "Por Área"
                  : filters.tipoReporte === "empresa"
                  ? "Por Empresa"
                  : "Por Proyecto"
              }
              onChange={(value: string) =>
                handleChange(
                  "tipoReporte",
                  value === "Por Proyecto"
                    ? "proyecto"
                    : value === "Por Empresa"
                    ? "empresa"
                    : "area"
                )
              }
              options={["Por Área", "Por Proyecto", "Por Empresa"]}
              placeholder="Por Área"
              variant="report"
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

          {filters.tipoReporte === "empresa" && (
            <div>
              <label className={labelClasses}>Empresa (Opcional)</label>
              <SearchableSelect
                name="empresa"
                value={filters.empresa || ""}
                onChange={(value: string) =>
                  handleChange(
                    "empresa",
                    value === "Todas las empresas" ? undefined : value
                  )
                }
                options={["Todas las empresas", ...empresas]}
                placeholder="Todas las empresas"
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

          {/* Fecha Inicio */}
          <div>
            <label className={labelClasses}>Fecha Inicio</label>
            <div className="relative">
              <Calendar className="absolute w-4 h-4 text-green-500 pointer-events-none left-3 top-1/2 -translate-y-1/2 dark:text-emerald-400 z-10" />
              <DatePicker
                selected={monthToDate(filters.fechaInicio)}
                onChange={(date: Date | null) =>
                  handleChange(
                    "fechaInicio",
                    date ? format(date, "yyyy-MM") : undefined
                  )
                }
                dateFormat="MM/yyyy"
                showMonthYearPicker
                className={dateInputClasses}
                wrapperClassName="w-full"
                locale={es}
                portalId="root"
                placeholderText="Selecciona mes"
              />
            </div>
          </div>

          {/* Fecha Fin */}
          <div>
            <label className={labelClasses}>Fecha Fin</label>
            <div className="relative">
              <Calendar className="absolute w-4 h-4 text-green-500 pointer-events-none left-3 top-1/2 -translate-y-1/2 dark:text-emerald-400 z-10" />
              <DatePicker
                selected={monthToDate(filters.fechaFin)}
                onChange={(date: Date | null) =>
                  handleChange(
                    "fechaFin",
                    date ? format(date, "yyyy-MM") : undefined
                  )
                }
                dateFormat="MM/yyyy"
                showMonthYearPicker
                className={dateInputClasses}
                wrapperClassName="w-full"
                locale={es}
                portalId="root"
                placeholderText="Selecciona mes"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
);
