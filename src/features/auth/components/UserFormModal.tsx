import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { X, Image as ImageIcon, Eye, EyeOff } from "lucide-react";
import { User, UserRole } from "../types";
import { useModalScrollLock } from "../../../shared/hooks/useModalScrollLock";

export interface UserFormSubmitInput {
  username: string;
  email?: string;
  phoneNumber?: string;
  role: UserRole;
  password?: string;
  firstName?: string;
  lastName?: string;
  avatarData?: string | null;
  avatarUrl?: string | null;
}

interface UserFormModalProps {
  isOpen: boolean;
  mode: "create" | "edit";
  title?: string;
  initialUser?: User | null;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  canDelete?: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormSubmitInput) => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
}

const DEFAULT_ROLE = UserRole.ASISTENTE;

export const UserFormModal = ({
  isOpen,
  mode,
  title = mode === "create" ? "Nuevo Usuario" : "Editar Usuario",
  initialUser,
  isSubmitting = false,
  errorMessage,
  canDelete = false,
  onClose,
  onSubmit,
  onDelete,
}: UserFormModalProps) => {
  // Bloquear scroll
  useModalScrollLock(isOpen);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState<UserRole>(DEFAULT_ROLE);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarData, setAvatarData] = useState<string | null>(null);
  const emailInputRef = useRef<HTMLInputElement | null>(null);
  const inputClasses =
    "w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-blue-300 dark:focus:ring-blue-500/30";
  const labelClasses =
    "mb-2 block text-sm font-semibold text-gray-700 dark:text-slate-200";

  const submitButtonLabel = useMemo(
    () => (mode === "create" ? "Agregar Usuario" : "Guardar Cambios"),
    [mode]
  );

  useEffect(() => {
    if (!isOpen) return;

    if (initialUser) {
      setFirstName(initialUser.firstName ?? "");
      setLastName(initialUser.lastName ?? "");
      setRole(initialUser.role ?? DEFAULT_ROLE);
      setUsername(initialUser.username ?? "");
      setEmail(initialUser.email ?? "");
      setPhoneNumber(initialUser.phoneNumber ?? "");
      setPassword("");
      setAvatarPreview(initialUser.avatarUrl ?? null);
      setAvatarData(null);
    } else {
      setFirstName("");
      setLastName("");
      setRole(DEFAULT_ROLE);
      setUsername("");
      setEmail("");
      setPhoneNumber("");
      setPassword("");
      setAvatarPreview(null);
      setAvatarData(null);
    }
  }, [initialUser, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = typeof reader.result === "string" ? reader.result : null;
      setAvatarPreview(result);
      setAvatarData(result);
    };
    reader.readAsDataURL(file);
  };

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setEmail(value);

    // Validar formato de email con dominio
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) {
      event.target.setCustomValidity(
        "El correo debe tener un formato válido con dominio (ej: usuario@dominio.com)"
      );
    } else {
      event.target.setCustomValidity("");
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    onSubmit({
      username: username.trim(),
      email: email.trim() || undefined,
      phoneNumber: phoneNumber.trim() || undefined,
      role,
      password: password.trim() ? password : undefined,
      firstName: firstName.trim() || undefined,
      lastName: lastName.trim() || undefined,
      avatarData,
      avatarUrl: avatarData ?? avatarPreview ?? null,
    });
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    const confirmed = window.confirm(
      "¿Estás seguro de desactivar este usuario? El usuario quedará inactivo pero podrás reactivarlo más tarde."
    );
    if (!confirmed) return;
    await onDelete();
  };

  const showDeleteAction = mode === "edit" && canDelete && onDelete;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm dark:bg-slate-950/70">
      <div className="w-full max-w-4xl max-h-[90vh] rounded-3xl bg-white shadow-2xl dark:border dark:border-slate-800 dark:bg-slate-950 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between flex-shrink-0 px-6 py-4 text-white rounded-t-3xl bg-gradient-to-r from-blue-500 to-blue-600">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            type="button"
            className="p-1 transition-colors rounded-full hover:bg-white hover:bg-opacity-20"
            onClick={onClose}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="px-8 pt-6 pb-8">
            <div className="grid gap-8 md:grid-cols-[220px_minmax(0,1fr)]">
              <div className="flex flex-col items-center justify-start">
                <span className="mb-3 text-sm font-semibold text-gray-600 dark:text-slate-300">
                  Foto de Perfil
                </span>
                <div className="flex h-40 w-40 items-center justify-center rounded-[32px] border-4 border-blue-200 bg-blue-50 dark:border-blue-400/60 dark:bg-blue-500/15">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt={
                        [firstName, lastName].filter(Boolean).join(" ") ||
                        username ||
                        "Usuario"
                      }
                      className="h-full w-full rounded-[24px] object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-20 h-20 text-blue-300" />
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-2 mt-4 text-sm font-medium text-white transition-colors bg-blue-600 rounded-full shadow-md hover:bg-blue-700"
                >
                  Agregar Imagen
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className={labelClasses}>Nombre(s) *</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(event) => setFirstName(event.target.value)}
                      className={inputClasses}
                      placeholder="Ingresa el nombre"
                      required
                    />
                  </div>

                  <div>
                    <label className={labelClasses}>Apellido(s)</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(event) => setLastName(event.target.value)}
                      className={inputClasses}
                      placeholder="Ingresa el apellido"
                    />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className={labelClasses}>Rol *</label>
                    <select
                      value={role}
                      onChange={(event) =>
                        setRole(event.target.value as UserRole)
                      }
                      className={`${inputClasses} appearance-none`}
                      required
                    >
                      {Object.values(UserRole).map((roleOption) => (
                        <option key={roleOption} value={roleOption}>
                          {roleOption}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelClasses}>Usuario *</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      className={inputClasses}
                      placeholder="Nombre de usuario"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className={labelClasses}>Teléfono *</label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(event) => setPhoneNumber(event.target.value)}
                      className={inputClasses}
                      placeholder="e.g. 123456789"
                      required
                    />
                  </div>

                  <div>
                    <label className={labelClasses}>Email *</label>
                    <input
                      ref={emailInputRef}
                      type="email"
                      value={email}
                      onChange={handleEmailChange}
                      className={inputClasses}
                      placeholder="correo@ejemplo.com"
                      required
                      pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
                      title="El correo debe tener un formato válido con dominio (ej: usuario@dominio.com)"
                    />
                  </div>

                  <div>
                    <label className={labelClasses}>
                      Contraseña {mode === "create" ? "*" : ""}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className={`${inputClasses} pr-10`}
                        placeholder={
                          mode === "create"
                            ? "Ingresa contraseña"
                            : "Dejar en blanco para mantener"
                        }
                        required={mode === "create"}
                        minLength={mode === "create" ? 6 : undefined}
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute inset-y-0 flex items-center text-gray-500 right-3 dark:text-slate-400"
                        aria-label={
                          showPassword
                            ? "Ocultar contraseña"
                            : "Mostrar contraseña"
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {mode === "edit" && (
                      <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                        Deja el campo vacío si no deseas cambiar la contraseña.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <hr className="my-8 border-gray-200 dark:border-slate-800" />

            {errorMessage && (
              <div className="px-4 py-3 mb-6 text-sm text-red-700 border border-red-200 rounded-xl bg-red-50 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
                {errorMessage}
              </div>
            )}

            <div
              className={`flex flex-col gap-4 sm:flex-row sm:items-center ${
                showDeleteAction ? "sm:justify-between" : "sm:justify-end"
              }`}
            >
              {showDeleteAction && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-6 py-2 text-sm font-semibold text-red-600 transition-colors border border-red-200 rounded-full hover:bg-red-50 dark:border-rose-500/30 dark:text-rose-300 dark:hover:bg-rose-500/10"
                  disabled={isSubmitting}
                >
                  Desactivar Usuario
                </button>
              )}
              <div className="flex flex-col self-end gap-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 text-sm font-semibold text-gray-700 transition-colors border border-gray-300 rounded-full hover:bg-gray-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-sm font-semibold text-white transition-colors bg-blue-600 rounded-full shadow-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Guardando..." : submitButtonLabel}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
