import { useState, useEffect } from 'react';
import { Plus, User, Phone, AlertCircle, Mail, Search } from 'lucide-react';
import { Provider } from '../features/providers/types';
import { AddProviderModal } from '../features/providers/components/AddProviderModal';
import { EditProviderModal } from '../features/providers/components/EditProviderModal';
import { providersService } from '../features/providers/services/providers.service';
import { Pagination } from '../shared/components/Pagination';
import { TableWithFixedHeader } from '../shared/components/TableWithFixedHeader';
import { usePagination } from '../shared/hooks/usePagination';

const ProvidersPage = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const containerClasses = 'overflow-hidden rounded-xl border border-transparent bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900';
  const headerTitleClasses = 'text-2xl font-bold text-gray-900 dark:text-slate-100';
  const searchInputClasses = 'w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-purple-400 dark:focus:ring-purple-500/30';

  const {
    paginatedData: paginatedProviders,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    handlePageChange,
    handleItemsPerPageChange,
  } = usePagination({ data: providers, initialItemsPerPage: 10 });

  const fetchProviders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await providersService.getAllProviders();
      setProviders(data);
    } catch (err) {
      setError('Error al cargar proveedores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const filteredProviders = providers.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className={containerClasses}>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white py-4 px-6">
          <div className="flex items-center space-x-3">
            <User className="w-6 h-6" />
            <h2 className="text-xl font-bold">Gestión de Proveedores</h2>
          </div>
        </div>
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-slate-300">Cargando proveedores...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={containerClasses}>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white py-4 px-6">
          <div className="flex items-center space-x-3">
            <User className="w-6 h-6" />
            <h2 className="text-xl font-bold">Gestión de Proveedores</h2>
          </div>
        </div>
        <div className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4 dark:text-rose-300">{error}</p>
          <button
            onClick={fetchProviders}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors hover:bg-purple-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Función para abrir WhatsApp con el número
  const openWhatsApp = (phone: string) => {
    const sanitized = phone.replace(/\D/g, '');
    if (!sanitized) return;
    const url = `https://wa.me/${sanitized}`;
    window.open(url, '_blank');
  };

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className={headerTitleClasses}>Proveedores</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 rounded-lg bg-purple-600 px-6 py-2 font-medium text-white shadow-md transition-colors hover:bg-purple-700"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Proveedor</span>
          </button>
        </div>
      </div>
      <div className={containerClasses}>
        <AddProviderModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAdd={(newProvider) => {
            setProviders((prev) => [
              { ...newProvider, id: prev.length + 1 },
              ...prev,
            ]);
          }}
        />
        <EditProviderModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          provider={selectedProvider}
          onEdit={(updatedProvider) => {
            setProviders((prev) => prev.map(p => p.id === updatedProvider.id ? updatedProvider : p));
          }}
        />
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white py-4 px-6">
          <div className="flex items-center space-x-3">
            <User className="w-5 h-5" />
            <h2 className="text-xl font-bold">Gestión de Proveedores</h2>
          </div>
        </div>
        <div className="border-b border-gray-200 bg-gray-50 p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por código, descripción o proveedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={searchInputClasses}
            />
          </div>
        </div>
        {filteredProviders.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-slate-400">
            <User className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-slate-600" />
            <p>No se encontraron proveedores</p>
          </div>
        ) : (
          <>
            <TableWithFixedHeader maxHeight="600px">
              <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-slate-900">
                <tr className="border-b border-gray-200 dark:border-slate-800">
                  <th className="bg-gray-50 px-4 py-4 text-left font-semibold text-gray-700 dark:bg-slate-900 dark:text-slate-300">Foto</th>
                  <th className="bg-gray-50 px-4 py-4 text-left font-semibold text-gray-700 dark:bg-slate-900 dark:text-slate-300">Nombre</th>
                  <th className="bg-gray-50 px-4 py-4 text-left font-semibold text-gray-700 dark:bg-slate-900 dark:text-slate-300">Teléfonos</th>
                  <th className="bg-gray-50 px-4 py-4 text-left font-semibold text-gray-700 dark:bg-slate-900 dark:text-slate-300">Email</th>
                  <th className="bg-gray-50 px-4 py-4 text-left font-semibold text-gray-700 dark:bg-slate-900 dark:text-slate-300">Dirección</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProviders.map((provider) => (
                  <tr key={provider.id} className="border-b border-gray-100 transition-colors hover:bg-purple-50 dark:border-slate-800 dark:hover:bg-slate-900/40">
                    <td className="px-4 py-4 cursor-pointer" onClick={() => { setSelectedProvider(provider); setEditModalOpen(true); }}>
                      {provider.photoUrl ? (
                        <img src={provider.photoUrl} alt={provider.name} className="h-10 w-10 rounded-full border border-purple-400 object-cover" />
                      ) : (
                        <User className="h-8 w-8 text-purple-400" />
                      )}
                    </td>
                    <td className="px-4 py-4 cursor-pointer font-medium text-gray-900 dark:text-slate-200" onClick={() => { setSelectedProvider(provider); setEditModalOpen(true); }}>{provider.name}</td>
                    <td className="px-4 py-4 cursor-pointer" onClick={() => { setSelectedProvider(provider); setEditModalOpen(true); }}>
                      <div className="flex flex-wrap gap-2">
                        {provider.phones.map((phone, idx) => (
                          <button
                            key={idx}
                            className="flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 transition-colors hover:bg-green-200 dark:bg-emerald-500/10 dark:text-emerald-200 dark:hover:bg-emerald-500/20"
                            onClick={(event) => {
                              event.stopPropagation();
                              openWhatsApp(phone);
                            }}
                            type="button"
                            title={`Abrir WhatsApp de ${phone}`}
                          >
                            <Phone className="w-4 h-4 mr-1" />{phone}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-600 cursor-pointer dark:text-slate-300" onClick={() => { setSelectedProvider(provider); setEditModalOpen(true); }}>
                      <span className="inline-flex items-center gap-2 rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700 dark:bg-purple-500/10 dark:text-purple-200">
                        <Mail className="h-4 w-4" />
                        <span>{provider.email}</span>
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-600 cursor-pointer dark:text-slate-300" onClick={() => { setSelectedProvider(provider); setEditModalOpen(true); }}>{provider.address}</td>
                  </tr>
                ))}
              </tbody>
            </TableWithFixedHeader>
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
