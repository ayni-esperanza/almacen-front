import { Phone, Mail } from "lucide-react";
import { User } from "../types";
import { useSelectableRowClick } from "../../../shared/hooks/useSelectableRowClick";

interface UserTableRowProps {
  user: User;
  canUpdateUsers: boolean;
  togglingStatusId: number | null;
  getRoleBadgeColor: (role: any) => string;
  openEditModal: (user: User) => void;
  openWhatsApp: (phone: string) => void;
  handleToggleUserStatus: (user: User, event: React.MouseEvent) => void;
}

export const UserTableRow: React.FC<UserTableRowProps> = ({
  user,
  canUpdateUsers,
  togglingStatusId,
  getRoleBadgeColor,
  openEditModal,
  openWhatsApp,
  handleToggleUserStatus,
}) => {
  const handleRowClick = useSelectableRowClick(() => {
    if (canUpdateUsers) {
      openEditModal(user);
    }
  });

  return (
    <tr
      key={user.id}
      onClick={handleRowClick}
      style={{ userSelect: "text" }}
      className={`border-b border-gray-100 transition-colors dark:border-slate-800 ${
        canUpdateUsers
          ? "cursor-pointer hover:bg-blue-50 dark:hover:bg-slate-800"
          : "hover:bg-gray-50 dark:hover:bg-slate-800"
      }`}
    >
      <td className="px-4 py-4">
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.username}
            className="object-cover w-10 h-10 border border-gray-200 rounded-full dark:border-slate-700"
          />
        ) : (
          <div className="flex items-center justify-center w-10 h-10 font-semibold text-blue-600 border border-blue-100 rounded-full bg-blue-50 dark:border-blue-500/40 dark:bg-blue-500/15 dark:text-blue-200">
            {user.firstName?.[0] || user.username[0]}
          </div>
        )}
      </td>
      <td className="px-4 py-4 font-medium text-gray-900 dark:text-slate-100 select-text">
        {user.username}
      </td>
      <td className="px-4 py-4 text-gray-700 dark:text-slate-300 select-text">
        {[user.firstName, user.lastName].filter(Boolean).join(" ") || "-"}
      </td>
      <td className="px-4 py-4 text-gray-700 dark:text-slate-300">
        {user.phoneNumber ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              openWhatsApp(user.phoneNumber || "");
            }}
            className="inline-flex items-center px-3 py-1 space-x-2 text-sm font-medium transition-colors rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-200 dark:hover:bg-emerald-500/25"
            title="Abrir WhatsApp"
          >
            <Phone className="w-4 h-4" />
            <span className="select-text">{user.phoneNumber}</span>
          </button>
        ) : (
          "-"
        )}
      </td>
      <td className="px-4 py-4 text-gray-700 dark:text-slate-300">
        {user.email ? (
          <span className="inline-flex items-center px-3 py-1 space-x-2 text-sm font-medium text-blue-700 rounded-full bg-blue-50 dark:bg-blue-500/15 dark:text-blue-200 select-text">
            <Mail className="w-4 h-4" />
            <span>{user.email}</span>
          </span>
        ) : (
          "-"
        )}
      </td>
      <td className="px-4 py-4">
        <span
          className={`px-2 py-1 text-xs font-medium ${getRoleBadgeColor(
            user.role
          )} rounded-full`}
        >
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
              ? "rounded-full bg-green-100 text-green-800 dark:bg-emerald-500/15 dark:text-emerald-200"
              : "rounded-full bg-red-100 text-red-800 dark:bg-rose-500/15 dark:text-rose-200"
          } ${
            canUpdateUsers
              ? "cursor-pointer hover:opacity-75"
              : "cursor-default"
          } ${
            togglingStatusId === user.id ? "opacity-50 cursor-wait" : ""
          }`}
          title={
            canUpdateUsers
              ? "Click para cambiar estado"
              : "No tienes permisos para cambiar el estado"
          }
        >
          {togglingStatusId === user.id
            ? "Cambiando..."
            : user.isActive
            ? "Activo"
            : "Inactivo"}
        </button>
      </td>
    </tr>
  );
};
