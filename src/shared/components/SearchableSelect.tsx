import { useState, useRef, useEffect } from "react";
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
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Prevenir scroll del body cuando el dropdown está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
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
        <label className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
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
            w-full px-4 py-3 text-left text-sm font-medium
            bg-white dark:bg-slate-800
            border-2 rounded-xl
            transition-all duration-200
            ${
              isOpen
                ? "border-blue-500 ring-2 ring-blue-500/20"
                : "border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600"
            }
            ${
              value
                ? "text-gray-900 dark:text-white"
                : "text-gray-500 dark:text-slate-400"
            }
            flex items-center justify-between gap-2
          `}
        >
          <span className="truncate">{displayValue || placeholder}</span>
          <ChevronDown
            className={`w-5 h-5 transition-transform duration-200 flex-shrink-0 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div
            className="absolute z-50 w-full mt-2 overflow-hidden bg-white border-2 border-gray-200 shadow-xl dark:bg-slate-800 dark:border-slate-700 rounded-xl"
            style={{ maxHeight: "320px" }}
          >
            {/* Search Input */}
            <div className="p-3 border-b-2 border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50">
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
                  className="w-full py-2 pl-10 pr-10 text-sm bg-white border border-gray-300 rounded-lg dark:bg-slate-800 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:text-white dark:placeholder-slate-400"
                  disabled={isLoading}
                />
                {isLoading && (
                  <Loader2 className="absolute w-4 h-4 text-blue-500 -translate-y-1/2 animate-spin right-3 top-1/2" />
                )}
              </div>
            </div>

            {/* Options List */}
            <div
              ref={dropdownRef}
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
                      w-full px-4 py-2.5 text-left text-sm
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
          </div>
        )}
      </div>
    </div>
  );
};
