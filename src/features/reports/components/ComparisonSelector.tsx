import React, { useState } from "react";
import { Plus, X, BarChart3, TrendingUp } from "lucide-react";
import { ComparisonItem, ComparisonType, VisualizationType } from "../types";

interface ComparisonSelectorProps {
  areas: string[];
  proyectos: string[];
  onAddComparison: (item: Omit<ComparisonItem, "id" | "color">) => void;
  comparisons: ComparisonItem[];
  onRemoveComparison: (id: string) => void;
  onUpdateVisualizationType?: (id: string, visualizationType: VisualizationType) => void;
  isCollapsed?: boolean;
}

const formatMonthValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

export const ComparisonSelector: React.FC<ComparisonSelectorProps> = ({
  areas,
  proyectos,
  onAddComparison,
  comparisons,
  onRemoveComparison,
  onUpdateVisualizationType,
  isCollapsed = false,
}) => {
  const [comparisonType, setComparisonType] = useState<ComparisonType>("area");
  const [selectedArea, setSelectedArea] = useState<string>("");
  const [selectedProyecto, setSelectedProyecto] = useState<string>("");
  const [fechaInicio, setFechaInicio] = useState<string>(() => {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    return formatMonthValue(startOfYear);
  });
  const [fechaFin, setFechaFin] = useState<string>(() => formatMonthValue(new Date()));
  const [customLabel, setCustomLabel] = useState<string>("");

  const handleTypeChange = (newType: ComparisonType) => {
    setComparisonType(newType);
    // Limpiar selecciones anteriores al cambiar de tipo
    setSelectedArea("");
    setSelectedProyecto("");
    setCustomLabel("");
  };

  const handleAddComparison = () => {
    let label = customLabel;

    if (!label) {
      if (comparisonType === "area" && selectedArea) {
        label = `${selectedArea} (${fechaInicio} - ${fechaFin})`;
      } else if (comparisonType === "proyecto" && selectedProyecto) {
        label = `${selectedProyecto} (${fechaInicio} - ${fechaFin})`;
      } else {
        alert("Por favor selecciona un área o proyecto");
        return;
      }
    }

    const newComparison: Omit<ComparisonItem, "id" | "color"> = {
      type: comparisonType,
      label,
      fechaInicio,
      fechaFin,
      area: comparisonType === "area" ? selectedArea : undefined,
      proyecto: comparisonType === "proyecto" ? selectedProyecto : undefined,
      visualizationType: "bar", // Por defecto siempre barra
    };

    onAddComparison(newComparison);

    // Resetear campos
    setCustomLabel("");
    setSelectedArea("");
    setSelectedProyecto("");
  };

  const containerClasses =
    "rounded-lg border border-transparent bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900";
  const labelClasses =
    "block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2";
  const inputClasses =
    "w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-700 transition focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-green-400 dark:focus:ring-green-500/30 [color-scheme:light] dark:[color-scheme:dark]";
  const buttonClasses =
    "flex items-center gap-2 rounded-lg bg-green-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-500 dark:disabled:hover:bg-green-600";

  return (
    <div className="space-y-4">
      {/* Formulario para agregar comparación */}
      {!isCollapsed && (
      <div>
        <div className="flex flex-wrap items-end gap-4">
          {/* Tipo de Comparación */}
          <div className="w-full md:w-auto md:min-w-[220px]">
            <label className={labelClasses}>Tipo</label>
            <select
              value={comparisonType}
              onChange={(e) => handleTypeChange(e.target.value as ComparisonType)}
              className={inputClasses}
            >
              <option value="area">Área</option>
              <option value="proyecto">Proyecto</option>
            </select>
          </div>

          {/* Selección según tipo */}
          {comparisonType === "area" && (
            <div className="w-full md:w-auto md:min-w-[220px]">
              <label className={labelClasses}>Área</label>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className={inputClasses}
              >
                <option value="">Seleccionar área</option>
                {areas.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>
          )}

          {comparisonType === "proyecto" && (
            <div className="w-full md:w-auto md:min-w-[220px]">
              <label className={labelClasses}>Proyecto</label>
              <select
                value={selectedProyecto}
                onChange={(e) => setSelectedProyecto(e.target.value)}
                className={inputClasses}
              >
                <option value="">Seleccionar proyecto</option>
                {proyectos.map((proyecto) => (
                  <option key={proyecto} value={proyecto}>
                    {proyecto}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Fecha Inicio */}
          <div className="w-full md:w-auto md:min-w-[220px]">
            <label className={labelClasses}>Fecha Inicio</label>
            <input
              type="month"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className={inputClasses}
            />
          </div>

          {/* Fecha Fin */}
          <div className="w-full md:w-auto md:min-w-[220px]">
            <label className={labelClasses}>Fecha Fin</label>
            <input
              type="month"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className={inputClasses}
            />
          </div>

          {/* Botón Agregar */}
          <div>
            <button 
              onClick={handleAddComparison} 
              className={buttonClasses}
              disabled={
                (comparisonType === "area" && !selectedArea) ||
                (comparisonType === "proyecto" && !selectedProyecto)
              }
            >
              <Plus className="h-4 w-4" />
              Agregar
            </button>
          </div>
        </div>

        {/* Etiqueta personalizada opcional */}
        <div className="mt-4">
          <label className={labelClasses}>
            Etiqueta Personalizada (Opcional)
          </label>
          <input
            type="text"
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            placeholder={
              comparisonType === "area" && selectedArea
                ? `${selectedArea} (${fechaInicio} - ${fechaFin})`
                : comparisonType === "proyecto" && selectedProyecto
                ? `${selectedProyecto} (${fechaInicio} - ${fechaFin})`
                : "Deja en blanco para usar etiqueta automática"
            }
            className={inputClasses}
          />
        </div>
      </div>
      )}

      {/* Lista de comparaciones activas */}
      {comparisons.length > 0 && (
        <div className={containerClasses}>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-100 mb-4">
            Comparaciones Activas ({comparisons.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {comparisons.map((comp) => (
              <div
                key={comp.id}
                className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium"
                style={{
                  borderColor: comp.color,
                  backgroundColor: `${comp.color}15`,
                  color: comp.color,
                }}
              >
                <span>{comp.label}</span>
                
                {/* Toggle de visualización */}
                {onUpdateVisualizationType && (
                  <div className="flex gap-1 ml-2 border-l pl-2" style={{ borderColor: comp.color }}>
                    <button
                      onClick={() => onUpdateVisualizationType(comp.id, "bar")}
                      className={`p-1 rounded transition ${
                        comp.visualizationType === "bar" || !comp.visualizationType
                          ? "bg-black/20 dark:bg-white/20"
                          : "hover:bg-black/10 dark:hover:bg-white/10 opacity-50"
                      }`}
                      title="Mostrar como barra"
                    >
                      <BarChart3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onUpdateVisualizationType(comp.id, "line")}
                      className={`p-1 rounded transition ${
                        comp.visualizationType === "line"
                          ? "bg-black/20 dark:bg-white/20"
                          : "hover:bg-black/10 dark:hover:bg-white/10 opacity-50"
                      }`}
                      title="Mostrar como línea"
                    >
                      <TrendingUp className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
                
                <button
                  onClick={() => onRemoveComparison(comp.id)}
                  className="rounded p-0.5 hover:bg-black/10 dark:hover:bg-white/10 ml-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
