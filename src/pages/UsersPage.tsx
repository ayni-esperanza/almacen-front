import { useState, useEffect, useMemo } from "react";
import { Plus, Users, AlertCircle } from "lucide-react";
import { User, UserRole } from "../features/auth/types";
import { usersService } from "../shared/services/users.service";
import { ProtectedComponent } from "../shared/components/ProtectedComponent";
import { Pagination } from "../shared/components/Pagination";
import { TableWithFixedHeader } from "../shared/components/TableWithFixedHeader";
import { Permission } from "../shared/types/permissions";
import { usePagination } from "../shared/hooks/usePagination";
import { usePermissions } from "../shared/hooks/usePermissions";
import { useAuth } from "../shared/hooks/useAuth";
import { UserTableRow } from "../features/auth/components/UserTableRow";
import {
  UserFormModal,
  UserFormSubmitInput,
} from "../features/auth/components/UserFormModal";

export const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { checkPermission } = usePermissions();
  const { user: currentUser } = useAuth();
  const canUpdateUsers = checkPermission(Permission.USERS_UPDATE);
  const canDeleteUsers = checkPermission(Permission.USERS_DELETE);
  const [togglingStatusId, setTogglingStatusId] = useState<number | null>(null);
  const searchInputClasses =
    "w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-blue-400 dark:focus:ring-blue-500/40";

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return users;

    return users.filter((user) => {
      const fullName = [user.firstName, user.lastName]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return (
        user.username.toLowerCase().includes(term) ||
        (user.email?.toLowerCase() ?? "").includes(term) ||
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
      setError(err instanceof Error ? err.message : "Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const getRoleBadgeColor = (role: UserRole): string => {
    switch (role) {
      case UserRole.GERENTE:
        return "bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-200";
      case UserRole.AYUDANTE:
        return "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-200";
      case UserRole.ASISTENTE:
        return "bg-green-100 text-green-800 dark:bg-emerald-500/20 dark:text-emerald-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-slate-700/30 dark:text-slate-200";
    }
  };

  const openWhatsApp = (phone: string) => {
    const sanitized = phone.replace(/\D/g, "");
    if (!sanitized) return;
    window.open(`https://wa.me/${sanitized}`, "_blank");
  };

  const openCreateModal = () => {
    setModalMode("create");
    setSelectedUser(null);
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    if (!canUpdateUsers) return;
    setModalMode("edit");
    setSelectedUser(user);
    setModalError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setModalError(null);
  };

  const buildAvatarValue = (values: UserFormSubmitInput) =>
    values.avatarData ?? values.avatarUrl ?? undefined;

  const handleSubmitModal = async (formValues: UserFormSubmitInput) => {
    try {
      setModalError(null);
      setModalSubmitting(true);

      if (modalMode === "create") {
        if (!formValues.password) {
          throw new Error(
            "La contraseña es obligatoria para crear un usuario."
          );
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
      setModalError(
        err instanceof Error ? err.message : "No se pudo guardar el usuario"
      );
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleDeleteSelectedUser = async () => {
    if (!selectedUser) return;

    // Prevenir que un usuario se desactive a sí mismo
    if (currentUser && currentUser.id === selectedUser.id) {
      setModalError("No puedes desactivar tu propia cuenta");
      return;
    }

    try {
      setModalError(null);
      setModalSubmitting(true);
      // Cambiar el estado del usuario (activar/desactivar) en lugar de eliminarlo
      const updatedUser = await usersService.toggleUserStatus(
        selectedUser.id,
        !selectedUser.isActive
      );

      if (updatedUser) {
        // Actualizar el usuario en el estado local
        setUsers((prevUsers) =>
          prevUsers.map((u) => (u.id === updatedUser.id ? updatedUser : u))
        );
      }
      closeModal();
    } catch (err) {
      setModalError(
        err instanceof Error
          ? err.message
          : "No se pudo cambiar el estado del usuario"
      );
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleToggleUserStatus = async (
    user: User,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();

    if (!canUpdateUsers) return;

    // Prevenir que un usuario se desactive a sí mismo
    if (currentUser && currentUser.id === user.id && user.isActive) {
      alert("No puedes desactivar tu propia cuenta");
      return;
    }

    try {
      setTogglingStatusId(user.id);
      const updatedUser = await usersService.toggleUserStatus(
        user.id,
        !user.isActive
      );

      if (updatedUser) {
        // Actualizar el usuario en el estado local en lugar de recargar toda la lista
        setUsers((prevUsers) =>
          prevUsers.map((u) => (u.id === updatedUser.id ? updatedUser : u))
        );
      }
    } catch (err) {
      console.error("Error al cambiar el estado del usuario:", err);
      alert(
        err instanceof Error
          ? err.message
          : "No se pudo cambiar el estado del usuario"
      );
    } finally {
      setTogglingStatusId(null);
    }
  };

  if (loading) {
    return (
      <div className="overflow-hidden bg-white border border-transparent shadow-lg rounded-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="px-6 py-4 text-white bg-gradient-to-r from-blue-500 to-blue-600">
          <div className="flex items-center space-x-3">
            <Users className="w-6 h-6" />
            <h2 className="text-xl font-bold">Gestión de Usuarios</h2>
          </div>
        </div>
        <div className="p-8 text-center">
          <div className="w-12 h-12 mx-auto border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 dark:text-slate-300">
            Cargando usuarios...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="overflow-hidden bg-white border border-transparent shadow-lg rounded-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="px-6 py-4 text-white bg-gradient-to-r from-blue-500 to-blue-600">
          <div className="flex items-center space-x-3">
            <Users className="w-5 h-5" />
            <h2 className="text-xl font-bold">Gestión de Usuarios</h2>
          </div>
        </div>
        <div className="p-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <p className="mb-4 text-red-600 dark:text-rose-300">{error}</p>
          <button
            onClick={fetchUsers}
            className="px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden bg-white border border-transparent shadow-lg rounded-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="px-6 py-4 text-white rounded-t-xl bg-gradient-to-r from-blue-500 to-blue-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Users className="w-6 h-6" />
              <h2 className="text-xl font-bold">Gestión de Usuarios</h2>
            </div>
          </div>
        </div>
        <div className="p-4 border-b bg-gray-50 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar por usuario, nombre, email o rol..."
                className={searchInputClasses}
              />
            </div>
            <ProtectedComponent permission={Permission.USERS_CREATE}>
              <button
                type="button"
                className="flex items-center px-6 py-2 space-x-2 font-medium text-white transition-colors bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 whitespace-nowrap flex-shrink-0"
                onClick={openCreateModal}
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo Usuario</span>
              </button>
            </ProtectedComponent>
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-slate-600" />
            <p>No se encontraron usuarios</p>
          </div>
        ) : (
          <>
            <TableWithFixedHeader maxHeight="600px">
              <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-slate-900">
                <tr className="border-b border-gray-200 dark:border-slate-800">
                  <th className="px-4 py-4 font-semibold text-left text-gray-700 bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                    Foto
                  </th>
                  <th className="px-4 py-4 font-semibold text-left text-gray-700 bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                    Usuario
                  </th>
                  <th className="px-4 py-4 font-semibold text-left text-gray-700 bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                    Nombre
                  </th>
                  <th className="px-4 py-4 font-semibold text-left text-gray-700 bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                    Teléfono
                  </th>
                  <th className="px-4 py-4 font-semibold text-left text-gray-700 bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                    Email
                  </th>
                  <th className="px-4 py-4 font-semibold text-left text-gray-700 bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                    Rol
                  </th>
                  <th className="px-4 py-4 font-semibold text-left text-gray-700 bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => (
                  <UserTableRow
                    key={user.id}
                    user={user}
                    canUpdateUsers={canUpdateUsers}
                    togglingStatusId={togglingStatusId}
                    getRoleBadgeColor={getRoleBadgeColor}
                    openEditModal={openEditModal}
                    openWhatsApp={openWhatsApp}
                    handleToggleUserStatus={handleToggleUserStatus}
                  />
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

      {isModalOpen && (
        <UserFormModal
          isOpen={isModalOpen}
          mode={modalMode}
          title={
            modalMode === "create" ? "Crear Nuevo Usuario" : "Editar Usuario"
          }
          initialUser={modalMode === "edit" ? selectedUser : null}
          isSubmitting={modalSubmitting}
          errorMessage={modalError}
          canDelete={modalMode === "edit" && canDeleteUsers}
          onClose={closeModal}
          onSubmit={handleSubmitModal}
          onDelete={handleDeleteSelectedUser}
        />
      )}
    </>
  );
};
