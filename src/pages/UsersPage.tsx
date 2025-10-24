import { useState, useEffect, useMemo } from 'react';
import { Plus, Users, AlertCircle, Phone, Mail } from 'lucide-react';
import { User, UserRole } from '../features/auth/types';
import { usersService } from '../shared/services/users.service';
import { ProtectedComponent } from '../shared/components/ProtectedComponent';
import { Pagination } from '../shared/components/Pagination';
import { TableWithFixedHeader } from '../shared/components/TableWithFixedHeader';
import { Permission } from '../shared/types/permissions';
import { usePagination } from '../shared/hooks/usePagination';
import { usePermissions } from '../shared/hooks/usePermissions';
import { UserFormModal, UserFormSubmitInput } from '../features/auth/components/UserFormModal';

export const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { checkPermission } = usePermissions();
  const canUpdateUsers = checkPermission(Permission.USERS_UPDATE);
  const canDeleteUsers = checkPermission(Permission.USERS_DELETE);
  const [togglingStatusId, setTogglingStatusId] = useState<number | null>(null);
  const searchInputClasses = 'w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-blue-400 dark:focus:ring-blue-500/40';

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return users;

    return users.filter((user) => {
      const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').toLowerCase();
      return (
        user.username.toLowerCase().includes(term) ||
        (user.email?.toLowerCase() ?? '').includes(term) ||
        fullName.includes(term) ||
        user.role.toLowerCase().includes(term)
      );
    });
  }, [users, searchTerm]);

  const {
    paginatedData: paginatedUsers,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    handlePageChange,
    handleItemsPerPageChange,
  } = usePagination({ data: filteredUsers, initialItemsPerPage: 15 });

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
        return 'bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-200';
      case UserRole.GERENTE:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-200';
      case UserRole.ASISTENTE:
        return 'bg-green-100 text-green-800 dark:bg-emerald-500/20 dark:text-emerald-200';
      case UserRole.AYUDANTE:
        return 'bg-yellow-100 text-yellow-800 dark:bg-amber-400/20 dark:text-amber-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-slate-700/30 dark:text-slate-200';
    }
  };

  const openWhatsApp = (phone: string) => {
    const sanitized = phone.replace(/\D/g, '');
    if (!sanitized) return;
    window.open(`https://wa.me/${sanitized}`, '_blank');
  };

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedUser(null);
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    if (!canUpdateUsers) return;
    setModalMode('edit');
    setSelectedUser(user);
    setModalError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setModalError(null);
  };

  const buildAvatarValue = (values: UserFormSubmitInput) => values.avatarData ?? values.avatarUrl ?? undefined;

  const handleSubmitModal = async (formValues: UserFormSubmitInput) => {
    try {
      setModalError(null);
      setModalSubmitting(true);

      if (modalMode === 'create') {
        if (!formValues.password) {
          throw new Error('La contraseña es obligatoria para crear un usuario.');
        }

        await usersService.createUser({
          username: formValues.username,
          password: formValues.password,
          email: formValues.email,
          role: formValues.role,
          firstName: formValues.firstName,
          lastName: formValues.lastName,
          phoneNumber: formValues.phoneNumber,
          avatarUrl: buildAvatarValue(formValues),
        });
      } else if (selectedUser) {
        await usersService.updateUser(selectedUser.id, {
          username: formValues.username,
          email: formValues.email,
          role: formValues.role,
          firstName: formValues.firstName,
          lastName: formValues.lastName,
          phoneNumber: formValues.phoneNumber,
          avatarUrl: buildAvatarValue(formValues) ?? null,
          ...(formValues.password ? { password: formValues.password } : {}),
        });
      }

      await fetchUsers();
      closeModal();
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'No se pudo guardar el usuario');
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleDeleteSelectedUser = async () => {
    if (!selectedUser) return;

    try {
      setModalError(null);
      setModalSubmitting(true);
      await usersService.deleteUser(selectedUser.id);
      await fetchUsers();
      closeModal();
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'No se pudo eliminar el usuario');
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleToggleUserStatus = async (user: User, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (!canUpdateUsers) return;
    
    try {
      setTogglingStatusId(user.id);
      await usersService.toggleUserStatus(user.id, !user.isActive);
      await fetchUsers();
    } catch (err) {
      console.error('Error al cambiar el estado del usuario:', err);
      alert(err instanceof Error ? err.message : 'No se pudo cambiar el estado del usuario');
    } finally {
      setTogglingStatusId(null);
    }
  };

  if (loading) {
    return (
      <div className="overflow-hidden rounded-xl border border-transparent bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-6">
          <div className="flex items-center space-x-3">
            <Users className="w-6 h-6" />
            <h2 className="text-xl font-bold">Gestión de Usuarios</h2>
          </div>
        </div>
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-slate-300">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="overflow-hidden rounded-xl border border-transparent bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-6">
          <div className="flex items-center space-x-3">
            <Users className="w-5 h-5" />
            <h2 className="text-xl font-bold">Gestión de Usuarios</h2>
          </div>
        </div>
        <div className="p-8 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <p className="mb-4 text-red-600 dark:text-rose-300">{error}</p>
          <button
            onClick={fetchUsers}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Usuarios</h1>
          <ProtectedComponent permission={Permission.USERS_CREATE}>
            <button
              type="button"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2 font-medium shadow-md"
              onClick={openCreateModal}
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Usuario</span>
            </button>
          </ProtectedComponent>
        </div>
      </div>
  <div className="overflow-hidden rounded-xl border border-transparent bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900">
        <div className="rounded-t-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Users className="w-6 h-6" />
              <h2 className="text-xl font-bold">Gestión de Usuarios</h2>
            </div>
          </div>
        </div>
        <div className="border-b bg-gray-50 p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar por usuario, nombre, email o rol..."
              className={searchInputClasses}
            />
          </div>
        </div>

        {filteredUsers.length === 0 ? (
        <div className="p-8 text-center text-gray-500 dark:text-slate-400">
          <Users className="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-slate-600" />
          <p>No se encontraron usuarios</p>
        </div>
      ) : (
        <>
          <TableWithFixedHeader maxHeight="600px">
            <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-slate-900">
              <tr className="border-b border-gray-200 dark:border-slate-800">
                <th className="bg-gray-50 px-4 py-4 text-left font-semibold text-gray-700 dark:bg-slate-900 dark:text-slate-300">Foto</th>
                <th className="bg-gray-50 px-4 py-4 text-left font-semibold text-gray-700 dark:bg-slate-900 dark:text-slate-300">Usuario</th>
                <th className="bg-gray-50 px-4 py-4 text-left font-semibold text-gray-700 dark:bg-slate-900 dark:text-slate-300">Nombre</th>
                <th className="bg-gray-50 px-4 py-4 text-left font-semibold text-gray-700 dark:bg-slate-900 dark:text-slate-300">Teléfono</th>
                <th className="bg-gray-50 px-4 py-4 text-left font-semibold text-gray-700 dark:bg-slate-900 dark:text-slate-300">Email</th>
                <th className="bg-gray-50 px-4 py-4 text-left font-semibold text-gray-700 dark:bg-slate-900 dark:text-slate-300">Rol</th>
                <th className="bg-gray-50 px-4 py-4 text-left font-semibold text-gray-700 dark:bg-slate-900 dark:text-slate-300">Estado</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user) => (
                <tr
                  key={user.id}
                  onClick={canUpdateUsers ? () => openEditModal(user) : undefined}
                  className={`border-b border-gray-100 transition-colors dark:border-slate-800 ${
                    canUpdateUsers
                      ? 'cursor-pointer hover:bg-blue-50 dark:hover:bg-slate-800'
                      : 'hover:bg-gray-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <td className="px-4 py-4">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.username}
                        className="h-10 w-10 rounded-full border border-gray-200 object-cover dark:border-slate-700"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-blue-100 bg-blue-50 font-semibold text-blue-600 dark:border-blue-500/40 dark:bg-blue-500/15 dark:text-blue-200">
                        {user.firstName?.[0] || user.username[0]}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 font-medium text-gray-900 dark:text-slate-100">{user.username}</td>
                  <td className="px-4 py-4 text-gray-700 dark:text-slate-300">
                    {[user.firstName, user.lastName].filter(Boolean).join(' ') || '-'}
                  </td>
                  <td className="px-4 py-4 text-gray-700 dark:text-slate-300">
                    {user.phoneNumber ? (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          openWhatsApp(user.phoneNumber || '');
                        }}
                        className="inline-flex items-center space-x-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-200 dark:hover:bg-emerald-500/25"
                        title="Abrir WhatsApp"
                      >
                        <Phone className="h-4 w-4" />
                        <span>{user.phoneNumber}</span>
                      </button>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-4 py-4 text-gray-700 dark:text-slate-300">
                    {user.email ? (
                      <span className="inline-flex items-center space-x-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-500/15 dark:text-blue-200">
                        <Mail className="h-4 w-4" />
                        <span>{user.email}</span>
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 text-xs font-medium ${getRoleBadgeColor(user.role)} rounded-full`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <button
                      type="button"
                      onClick={(event) => handleToggleUserStatus(user, event)}
                      disabled={!canUpdateUsers || togglingStatusId === user.id}
                      className={`px-2 py-1 text-xs font-medium transition-all ${
                        user.isActive
                          ? 'rounded-full bg-green-100 text-green-800 dark:bg-emerald-500/15 dark:text-emerald-200'
                          : 'rounded-full bg-red-100 text-red-800 dark:bg-rose-500/15 dark:text-rose-200'
                      } ${canUpdateUsers ? 'cursor-pointer hover:opacity-75' : 'cursor-default'} ${
                        togglingStatusId === user.id ? 'opacity-50 cursor-wait' : ''
                      }`}
                      title={canUpdateUsers ? 'Click para cambiar estado' : 'No tienes permisos para cambiar el estado'}
                    >
                      {togglingStatusId === user.id ? 'Cambiando...' : (user.isActive ? 'Activo' : 'Inactivo')}
                    </button>
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
    <UserFormModal
      isOpen={isModalOpen}
      mode={modalMode}
      initialUser={selectedUser ?? undefined}
      isSubmitting={modalSubmitting}
      errorMessage={modalError}
      canDelete={modalMode === 'edit' && canDeleteUsers}
      onClose={closeModal}
      onSubmit={handleSubmitModal}
      onDelete={modalMode === 'edit' && canDeleteUsers ? handleDeleteSelectedUser : undefined}
    />
    </>
  );
};
