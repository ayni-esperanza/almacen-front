
import { useState, useEffect } from 'react';
import { Plus, User, Phone, AlertCircle } from 'lucide-react';
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
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white py-4 px-6">
          <div className="flex items-center space-x-3">
            <User className="w-6 h-6" />
            <h2 className="text-xl font-bold">Gestión de Proveedores</h2>
          </div>
        </div>
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando proveedores...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white py-4 px-6">
          <div className="flex items-center space-x-3">
            <User className="w-6 h-6" />
            <h2 className="text-xl font-bold">Gestión de Proveedores</h2>
          </div>
        </div>
        <div className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchProviders}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Función para abrir WhatsApp con el número
  const openWhatsApp = (phone: string) => {
    const url = `https://wa.me/${phone}`;
    window.open(url, '_blank');
  };

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Proveedores</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center space-x-2 font-medium shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Proveedor</span>
          </button>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
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
        <div className="p-4 bg-gray-50 border-b">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Buscar por código, descripción o proveedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
        {filteredProviders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No se encontraron proveedores</p>
          </div>
        ) : (
          <>
            <TableWithFixedHeader maxHeight="600px">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-4 text-left font-semibold text-gray-700 bg-gray-50">Foto</th>
                  <th className="px-4 py-4 text-left font-semibold text-gray-700 bg-gray-50">Nombre</th>
                  <th className="px-4 py-4 text-left font-semibold text-gray-700 bg-gray-50">Teléfonos</th>
                  <th className="px-4 py-4 text-left font-semibold text-gray-700 bg-gray-50">Email</th>
                  <th className="px-4 py-4 text-left font-semibold text-gray-700 bg-gray-50">Dirección</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProviders.map((provider) => (
                  <tr key={provider.id} className="border-b border-gray-100 hover:bg-purple-50 transition-colors">
                    <td className="px-4 py-4 cursor-pointer" onClick={() => { setSelectedProvider(provider); setEditModalOpen(true); }}>
                      {provider.photoUrl ? (
                        <img src={provider.photoUrl} alt={provider.name} className="w-10 h-10 object-cover rounded-full border border-purple-400" />
                      ) : (
                        <User className="w-8 h-8 text-purple-400" />
                      )}
                    </td>
                    <td className="px-4 py-4 font-medium text-gray-900 cursor-pointer" onClick={() => { setSelectedProvider(provider); setEditModalOpen(true); }}>{provider.name}</td>
                    <td className="px-4 py-4 cursor-pointer" onClick={() => { setSelectedProvider(provider); setEditModalOpen(true); }}>
                      <div className="flex flex-wrap gap-2">
                        {provider.phones.map((phone, idx) => (
                          <button
                            key={idx}
                            className="flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium hover:bg-green-200 transition-colors"
                            onClick={() => openWhatsApp(phone)}
                            type="button"
                            title={`Abrir WhatsApp de ${phone}`}
                          >
                            <Phone className="w-4 h-4 mr-1" />{phone}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-600 cursor-pointer" onClick={() => { setSelectedProvider(provider); setEditModalOpen(true); }}>{provider.email}</td>
                    <td className="px-4 py-4 text-gray-600 cursor-pointer" onClick={() => { setSelectedProvider(provider); setEditModalOpen(true); }}>{provider.address}</td>
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
