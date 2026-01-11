import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Search, Loader2 } from "lucide-react";

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options?: string[]; // Opcional para modo local
  placeholder?: string;
  label?: string;
  required?: boolean;
  name?: string;
  // Props para modo async
  fetchOptions?: (searchTerm: string) => Promise<string[]>;
  debounceMs?: number;
}

export const SearchableSelect = ({
  value,
  onChange,
  options: localOptions,
  placeholder = "Selecciona una opción",
  label,
  required = false,
  name,
  fetchOptions,
  debounceMs = 500,
}: SearchableSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [options, setOptions] = useState<string[]>(localOptions || []);
  const [isLoading, setIsLoading] = useState(false);
  const [dropdownStyles, setDropdownStyles] = useState<{ top?: number; left?: number; width?: number; bottom?: number }>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<number>();

  const isAsyncMode = !!fetchOptions;

  // Filtrar opciones localmente si no es modo async
  const filteredOptions = isAsyncMode
    ? options
    : options.filter((option) =>
        option.toLowerCase().includes(searchTerm.toLowerCase())
      );

  // Mostrar el valor actual aunque no esté en options (para modo async antes de cargar)
  const displayValue = options.find((opt) => opt === value) || value;

  // Cargar opciones iniciales en modo async solo cuando se abre el dropdown
  useEffect(() => {
    if (isAsyncMode && fetchOptions && isOpen && options.length === 0) {
      setIsLoading(true);
      fetchOptions("")
        .then((data) => {
          setOptions(data);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error loading options:", error);
          setIsLoading(false);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isAsyncMode]);

  // Actualizar opciones locales cuando cambien las props
  useEffect(() => {
    if (!isAsyncMode && localOptions) {
      setOptions(localOptions);
    }
  }, [localOptions, isAsyncMode]);

  // Búsqueda con debounce en modo async
  useEffect(() => {
    if (!isAsyncMode || !fetchOptions || !isOpen) return;

    // Limpiar timer anterior
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Crear nuevo timer para búsqueda (incluye búsqueda vacía para mostrar todo)
    debounceTimerRef.current = setTimeout(
      () => {
        setIsLoading(true);
        fetchOptions(searchTerm)
          .then((data) => {
            setOptions(data);
            setHighlightedIndex(searchTerm ? 0 : -1);
            setIsLoading(false);
          })
          .catch((error) => {
            console.error("Error searching options:", error);
            setIsLoading(false);
          });
      },
      searchTerm === "" ? 0 : debounceMs
    ); // Sin delay si está vacío

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchTerm, isAsyncMode, fetchOptions, debounceMs, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Verificar si el click está dentro del contenedor o del dropdown
      const isClickInContainer = containerRef.current && containerRef.current.contains(event.target as Node);
      const isClickInDropdown = dropdownRef.current && dropdownRef.current.contains(event.target as Node);
      
      if (!isClickInContainer && !isClickInDropdown) {
        setIsOpen(false);
        setSearchTerm("");
        setHighlightedIndex(-1);
      }
    };

    const handleScroll = (event: Event) => {
      // Evitar que el scroll cierre el dropdown
      if (
        dropdownRef.current &&
        dropdownRef.current.contains(event.target as Node)
      ) {
        return;
      }
      // No cerrar el dropdown en scroll
      event.stopPropagation();
    };

    document.addEventListener("mousedown", handleClickOutside);
    
    // No agregar listener de scroll que cierre el dropdown
    if (isOpen) {
      document.addEventListener("scroll", handleScroll, true);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("scroll", handleScroll, true);
    };
  }, [isOpen]);

  // No bloquear scroll aquí: la modal padre ya lo hace con useModalScrollLock
  // y scrollbar-gutter: stable en html reserva el espacio del scrollbar

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
      
      // Calcular la posición del dropdown
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const dropdownHeight = 320; // maxHeight del dropdown
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        
        // Si no hay suficiente espacio abajo pero sí arriba, abrir hacia arriba
        if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
          setDropdownStyles({
            bottom: window.innerHeight - rect.top + 8,
            left: rect.left,
            width: rect.width,
          });
        } else {
          setDropdownStyles({
            top: rect.bottom + 8,
            left: rect.left,
            width: rect.width,
          });
        }
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (highlightedIndex >= 0 && dropdownRef.current) {
      const highlightedElement = dropdownRef.current.children[
        highlightedIndex
      ] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [highlightedIndex]);

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
    setSearchTerm("");
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setSearchTerm("");
        setHighlightedIndex(-1);
        break;
    }
  };

  return (
    <div className="w-full" ref={containerRef}>
      {label && (
        <label className="block mb-1 text-xs font-semibold text-slate-700 dark:text-slate-200">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {/* Hidden input for form validation */}
        <input
          type="text"
          name={name}
          value={value}
          onChange={() => {}}
          required={required}
          className="absolute opacity-0 pointer-events-none"
          tabIndex={-1}
        />

        {/* Select Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          className={`
            w-full h-9 px-3 py-1.5 text-left text-sm
            bg-white dark:bg-slate-900
            border rounded-xl
            transition-all duration-200
            ${
              isOpen
                ? "border-blue-500 ring-2 ring-blue-100 dark:ring-blue-500/30"
                : "border-gray-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-slate-600"
            }
            ${
              value
                ? "text-gray-700 dark:text-slate-100"
                : "text-gray-500 dark:text-slate-400"
            }
            flex items-center justify-between gap-2
            focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100
            dark:focus:border-blue-400 dark:focus:ring-blue-500/30
          `}
        >
          <span className="truncate leading-tight">{displayValue || placeholder}</span>
          <ChevronDown
            className={`w-4 h-4 text-gray-400 dark:text-slate-500 transition-transform duration-200 flex-shrink-0 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown - usando Portal */}
        {isOpen && createPortal(
          <div
            ref={dropdownRef}
            className="fixed z-[9999] overflow-hidden bg-white border border-gray-200 shadow-xl dark:bg-slate-800 dark:border-slate-700 rounded-xl"
            style={{ 
              maxHeight: "320px",
              ...dropdownStyles
            }}
            // Evitar que el clic en el dropdown cierre la modal padre
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Options List - Ahora arriba */}
            <div
              className="overflow-y-auto"
              style={{ maxHeight: "240px" }}
            >
              {isLoading ? (
                <div className="flex flex-col items-center justify-center px-4 py-8 text-sm text-gray-500 dark:text-slate-400">
                  <Loader2 className="w-6 h-6 mb-2 text-blue-500 animate-spin" />
                  <span>Cargando opciones...</span>
                </div>
              ) : filteredOptions.length === 0 ? (
                <div className="px-4 py-8 text-sm text-center text-gray-500 dark:text-slate-400">
                  No se encontraron resultados
                </div>
              ) : (
                filteredOptions.map((option, index) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleSelect(option)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`
                      w-full px-3 py-2 text-left text-sm
                      transition-colors duration-150
                      ${
                        option === value
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-semibold"
                          : highlightedIndex === index
                          ? "bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white"
                          : "text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50"
                      }
                    `}
                  >
                    {option}
                  </button>
                ))
              )}
            </div>
            
            {/* Search Input - Ahora abajo */}
            <div className="p-2 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50">
              <div className="relative">
                <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2 dark:text-slate-500" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (!isAsyncMode) {
                      setHighlightedIndex(0);
                    }
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    isAsyncMode ? "Buscar en servidor..." : "Buscar..."
                  }
                  className="w-full py-1.5 pl-9 pr-9 text-sm bg-white border border-gray-300 rounded-lg dark:bg-slate-800 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/30 focus:border-blue-500 dark:text-white dark:placeholder-slate-400"
                  disabled={isLoading}
                />
                {isLoading && (
                  <Loader2 className="absolute w-4 h-4 text-blue-500 -translate-y-1/2 animate-spin right-3 top-1/2" />
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    </div>
  );
};
