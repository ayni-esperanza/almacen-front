import React, { useState } from "react";
import { Plus, User, Phone, AlertCircle, Mail, Search } from "lucide-react";
import { Provider } from "../features/providers/types";
import { AddProviderModal } from "../features/providers/components/AddProviderModal";
import { EditProviderModal } from "../features/providers/components/EditProviderModal";
import { useProviders } from "../features/providers/hooks/useProviders";
import { Pagination } from "../shared/components/Pagination";
import { usePagination } from "../shared/hooks/usePagination";

const ProvidersPage = () => {
  const {
    providers,
    loading,
    error,
    refetch,
    createProvider,
    updateProvider,
  } = useProviders();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(
    null
  );
  const containerClasses =
    "overflow-hidden rounded-xl border border-transparent bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900";
  const searchInputClasses =
    "w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-purple-400 dark:focus:ring-purple-500/30";

  // Usar useMemo para filtrar Y ORDENAR
  const filteredProviders = React.useMemo(() => {
    // Filtrar
    const filtered = providers.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Ordenar por fecha de creación (createdAt) descendente
    return filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA; // Descendente: B - A
    });
  }, [providers, searchTerm]);

  const {
    paginatedData: paginatedProviders,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    handlePageChange,
    handleItemsPerPageChange,
  } = usePagination({ data: filteredProviders, initialItemsPerPage: 100 });

  if (loading) {
    return (
      <div className={containerClasses}>
        <div className="px-6 py-4 text-white bg-gradient-to-r from-purple-500 to-purple-600">
          <div className="flex items-center space-x-3">
            <User className="w-6 h-6" />
            <h2 className="text-xl font-bold">Gestión de Proveedores</h2>
          </div>
        </div>
        <div className="p-8 text-center">
          <div className="w-12 h-12 mx-auto border-b-2 border-purple-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 dark:text-slate-300">
            Cargando proveedores...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={containerClasses}>
        <div className="px-6 py-4 text-white bg-gradient-to-r from-purple-500 to-purple-600">
          <div className="flex items-center space-x-3">
            <User className="w-6 h-6" />
            <h2 className="text-xl font-bold">Gestión de Proveedores</h2>
          </div>
        </div>
        <div className="p-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <p className="mb-4 text-red-600 dark:text-rose-300">{error}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 text-white transition-colors bg-purple-600 rounded-lg hover:bg-purple-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Función para abrir WhatsApp con el número
  const openWhatsApp = (phone: string) => {
    const sanitized = phone.replace(/\D/g, "");
    if (!sanitized) return;
    const url = `https://wa.me/${sanitized}`;
    window.open(url, "_blank");
  };

  const handleAddProvider = async (newProvider: Omit<Provider, "id">) => {
    try {
      await createProvider(newProvider);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding provider:", error);
    }
  };

  const handleEditProvider = async (updatedProvider: Provider) => {
    try {
      // Extraer solo los campos editables (sin id, createdAt, updatedAt)
      const { id, createdAt, updatedAt, ...providerData } = updatedProvider;
      await updateProvider(id, providerData);
      setEditModalOpen(false);
      setSelectedProvider(null);
    } catch (error) {
      console.error("Error updating provider:", error);
    }
  };

  return (
    <>
      <AddProviderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddProvider}
      />
      <EditProviderModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedProvider(null);
        }}
        provider={selectedProvider}
        onEdit={handleEditProvider}
      />
      {/* HEADER */}
      <div className="px-6 py-4 text-white shadow-sm bg-gradient-to-r from-purple-500 to-purple-600">
        <div className="flex items-center space-x-3">
          <User className="w-5 h-5" />
          <h2 className="text-xl font-bold">Gestión de Proveedores</h2>
        </div>
      </div>
      {/* Filters + Table Container */}
      <div className="flex flex-col bg-white border border-transparent shadow-lg dark:border-slate-800 dark:bg-slate-950">
        {/* FILTROS sticky */}
        <div className="sticky top-[109px] z-20 p-4 border-b border-gray-200 bg-gray-50 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Buscar por nombre, email o dirección..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={searchInputClasses}
              />
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center flex-shrink-0 px-6 py-2 space-x-2 font-medium text-white transition-colors bg-purple-600 rounded-lg shadow-md hover:bg-purple-700 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar Proveedor</span>
            </button>
          </div>
        </div>

        {filteredProviders.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-slate-400">
            <User className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-slate-600" />
            <p>No se encontraron proveedores</p>
          </div>
        ) : (
          <>
            <table className="w-full text-sm text-gray-700 dark:text-slate-200">
              {/* HEADER DE TABLA - STICKY */}
              <thead className="sticky top-[174px] z-10 bg-gray-50 dark:bg-slate-900">
                <tr className="border-b border-gray-200 dark:border-slate-800">
                  <th className="px-3 py-3 text-sm font-semibold text-left text-gray-700 shadow-sm bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                    Foto
                  </th>
                  <th className="px-3 py-3 text-sm font-semibold text-left text-gray-700 shadow-sm bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                    Nombre
                  </th>
                  <th className="px-3 py-3 text-sm font-semibold text-left text-gray-700 shadow-sm bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                    Teléfonos
                  </th>
                  <th className="px-3 py-3 text-sm font-semibold text-left text-gray-700 shadow-sm bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                    Email
                  </th>
                  <th className="px-3 py-3 text-sm font-semibold text-left text-gray-700 shadow-sm bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                    Dirección
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm bg-white divide-y divide-gray-100 dark:divide-slate-800 dark:bg-slate-950">
                {paginatedProviders.map((provider) => (
                  <tr
                    key={provider.id}
                    className="transition-colors border-b border-gray-100 hover:bg-purple-50 dark:border-slate-800 dark:hover:bg-slate-900/40"
                  >
                    <td
                      className="px-3 py-3 cursor-pointer"
                      onClick={() => {
                        setSelectedProvider(provider);
                        setEditModalOpen(true);
                      }}
                    >
                      {provider.photoUrl ? (
                        <img
                          src={provider.photoUrl}
                          alt={provider.name}
                          className="object-cover border border-purple-400 rounded-full w-9 h-9"
                        />
                      ) : (
                        <User className="text-purple-400 w-7 h-7" />
                      )}
                    </td>
                    <td
                      className="px-3 py-3 font-medium text-gray-900 cursor-pointer dark:text-slate-200"
                      onClick={() => {
                        setSelectedProvider(provider);
                        setEditModalOpen(true);
                      }}
                    >
                      {provider.name}
                    </td>
                    <td
                      className="px-3 py-3 cursor-pointer"
                      onClick={() => {
                        setSelectedProvider(provider);
                        setEditModalOpen(true);
                      }}
                    >
                      <div className="flex flex-wrap gap-1.5">
                        {provider.phones.map((phone, idx) => (
                          <button
                            key={idx}
                            className="flex items-center px-2 py-1 text-xs font-medium text-green-800 transition-colors bg-green-100 rounded-full hover:bg-green-200 dark:bg-emerald-500/10 dark:text-emerald-200 dark:hover:bg-emerald-500/20"
                            onClick={(event) => {
                              event.stopPropagation();
                              openWhatsApp(phone);
                            }}
                            type="button"
                            title={`Abrir WhatsApp de ${phone}`}
                          >
                            <Phone className="w-4 h-4 mr-1" />
                            {phone}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td
                      className="px-3 py-3 text-gray-600 cursor-pointer dark:text-slate-300"
                      onClick={() => {
                        setSelectedProvider(provider);
                        setEditModalOpen(true);
                      }}
                    >
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-purple-700 rounded-full bg-purple-50 dark:bg-purple-500/10 dark:text-purple-200">
                        <Mail className="w-4 h-4" />
                        <span>{provider.email}</span>
                      </span>
                    </td>
                    <td
                      className="px-3 py-3 text-gray-600 cursor-pointer dark:text-slate-300"
                      onClick={() => {
                        setSelectedProvider(provider);
                        setEditModalOpen(true);
                      }}
                    >
                      {provider.address}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </>
        )}
      </div>
    </>
  );
};

export default ProvidersPage;
