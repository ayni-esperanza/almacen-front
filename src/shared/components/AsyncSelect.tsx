import { useEffect, useState } from 'react';
import { apiClient } from '../services/api';

export interface SelectOption {
  id: string | number;
  text: string;
}

export interface AsyncSelectProps {
  endpoint: string;
  placeholder?: string;
  value?: string | number | null;
  onChange?: (value: string | number | null) => void;
  className?: string;
  name?: string;
  mapResponseToOptions?: (data: any[]) => SelectOption[];
  error?: string;
  label?: string;
  required?: boolean;
}

export const AsyncSelect = ({
  endpoint,
  placeholder = 'Selecciona una opción...',
  value = null,
  onChange,
  className = '',
  name,
  mapResponseToOptions,
  error,
  label,
  required = false,
}: AsyncSelectProps) => {
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const defaultMapFunction = (data: any[]): SelectOption[] => {
    if (!Array.isArray(data)) return [];
    return data.map((item) => ({
      id: item.id || item.value,
      text: item.nombre || item.name || item.label || String(item.id || item.value),
    }));
  };

  const mapFunction = mapResponseToOptions || defaultMapFunction;

  // Cargar opciones del endpoint
  useEffect(() => {
    const loadOptions = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get<any[]>(endpoint);
        if (response.data) {
          const mappedOptions = mapFunction(response.data);
          setOptions(mappedOptions);
        }
      } catch (err) {
        console.error('Error loading options:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadOptions();
  }, [endpoint]);

  const filteredOptions = options.filter((option) =>
    option.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find((opt) => opt.id === value);

  const handleSelect = (optionId: string | number) => {
    if (onChange) {
      onChange(optionId);
    }
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = () => {
    if (onChange) {
      onChange(null);
    }
    setSearchTerm('');
  };

  return (
    <div className={`relative w-full ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Hidden select for form submission */}
      <select
        name={name}
        value={value || ''}
        onChange={() => {}}
        required={required}
        className="hidden"
        tabIndex={-1}
      >
        <option value=""></option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.text}
          </option>
        ))}
      </select>

      {/* Custom select display */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-left bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100 transition focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100 dark:focus:border-green-400 dark:focus:ring-green-500/30 flex items-center justify-between"
          disabled={isLoading}
        >
          <span className={selectedOption ? 'text-gray-700 dark:text-slate-100' : 'text-gray-400'}>
            {isLoading ? 'Cargando...' : selectedOption ? selectedOption.text : placeholder}
          </span>
          <svg
            className={`w-5 h-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl shadow-lg max-h-60 overflow-hidden">
            {/* Search input */}
            <div className="p-2 border-b border-gray-200 dark:border-slate-700">
              <input
                type="text"
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-slate-900 dark:text-slate-100"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Options list */}
            <div className="overflow-y-auto max-h-48">
              {selectedOption && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400 border-b border-gray-200 dark:border-slate-700"
                >
                  Limpiar selección
                </button>
              )}
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500 dark:text-slate-400">
                  No se encontraron resultados
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSelect(option.id)}
                    className={`w-full px-4 py-2 text-sm text-left hover:bg-green-50 dark:hover:bg-green-900/20 transition ${
                      option.id === value
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium'
                        : 'text-gray-700 dark:text-slate-200'
                    }`}
                  >
                    {option.text}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* Click outside handler */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default AsyncSelect;
