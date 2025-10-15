import { useState, useEffect } from 'react';
import { Plus, Users, Edit, Trash2, AlertCircle } from 'lucide-react';
import { User, UserRole } from '../features/auth/types';
import { usersService } from '../shared/services/users.service';
import { ProtectedComponent } from '../shared/components/ProtectedComponent';
import { Pagination } from '../shared/components/Pagination';
import { TableWithFixedHeader } from '../shared/components/TableWithFixedHeader';
import { Permission } from '../shared/types/permissions';
import { usePagination } from '../shared/hooks/usePagination';

export const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    paginatedData: paginatedUsers,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    handlePageChange,
    handleItemsPerPageChange,
  } = usePagination({ data: users, initialItemsPerPage: 15 });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await usersService.getAllUsers();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const getRoleBadgeColor = (role: UserRole): string => {
    switch (role) {
      case UserRole.JEFE:
        return 'bg-purple-100 text-purple-800';
      case UserRole.GERENTE:
        return 'bg-blue-100 text-blue-800';
      case UserRole.ASISTENTE:
        return 'bg-green-100 text-green-800';
      case UserRole.AYUDANTE:
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      try {
        await usersService.deleteUser(userId);
        await fetchUsers(); // Refresh the list
      } catch (error) {
        setError('Error al eliminar usuario');
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-6">
          <div className="flex items-center space-x-3">
            <Users className="w-6 h-6" />
            <h2 className="text-xl font-bold">Gestión de Usuarios</h2>
          </div>
        </div>
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-6">
          <div className="flex items-center space-x-3">
            <Users className="w-5 h-5" />
            <h2 className="text-xl font-bold">Gestión de Usuarios</h2>
          </div>
        </div>
        <div className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchUsers}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
          <ProtectedComponent permission={Permission.USERS_CREATE}>
            <button
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2 font-medium shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Usuario</span>
            </button>
          </ProtectedComponent>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="rounded-t-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Users className="w-6 h-6" />
              <h2 className="text-xl font-bold">Gestión de Usuarios</h2>
            </div>
          </div>
        </div>

        {users.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No se encontraron usuarios</p>
        </div>
      ) : (
        <>
          <TableWithFixedHeader maxHeight="600px">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr className="border-b border-gray-200">
                <th className="px-4 py-4 text-left font-semibold text-gray-700 bg-gray-50">Usuario</th>
                <th className="px-4 py-4 text-left font-semibold text-gray-700 bg-gray-50">Nombre</th>
                <th className="px-4 py-4 text-left font-semibold text-gray-700 bg-gray-50">Email</th>
                <th className="px-4 py-4 text-left font-semibold text-gray-700 bg-gray-50">Rol</th>
                <th className="px-4 py-4 text-left font-semibold text-gray-700 bg-gray-50">Estado</th>
                <th className="px-4 py-4 text-center font-semibold text-gray-700 bg-gray-50">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-gray-100 hover:bg-blue-50 transition-colors"
                >
                  <td className="px-4 py-4 font-medium text-gray-900">{user.username}</td>
                  <td className="px-4 py-4 text-gray-700">
                    {user.firstName && user.lastName 
                      ? `${user.firstName} ${user.lastName}` 
                      : '-'
                    }
                  </td>
                  <td className="px-4 py-4 text-gray-700">{user.email || '-'}</td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <ProtectedComponent permission={Permission.USERS_UPDATE}>
                        <button className="text-blue-600 hover:text-blue-800 transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                      </ProtectedComponent>
                      <ProtectedComponent permission={Permission.USERS_DELETE}>
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </ProtectedComponent>
                    </div>
                  </td>
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
