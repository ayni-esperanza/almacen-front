import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { X, Image as ImageIcon, Eye, EyeOff } from 'lucide-react';
import { User, UserRole } from '../types';

export interface UserFormSubmitInput {
  username: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  password?: string;
  firstName?: string;
  lastName?: string;
  avatarData?: string | null;
  avatarUrl?: string | null;
}

interface UserFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
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
  title = mode === 'create' ? 'Nuevo Usuario' : 'Editar Usuario',
  initialUser,
  isSubmitting = false,
  errorMessage,
  canDelete = false,
  onClose,
  onSubmit,
  onDelete,
}: UserFormModalProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>(DEFAULT_ROLE);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarData, setAvatarData] = useState<string | null>(null);
  const inputClasses = 'w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-blue-300 dark:focus:ring-blue-500/30';
  const labelClasses = 'mb-2 block text-sm font-semibold text-gray-700 dark:text-slate-200';

  const submitButtonLabel = useMemo(() => (mode === 'create' ? 'Agregar Usuario' : 'Guardar Cambios'), [mode]);

  useEffect(() => {
    if (!isOpen) return;

    if (initialUser) {
      const combinedName = [initialUser.firstName, initialUser.lastName].filter(Boolean).join(' ').trim();
      setFullName(combinedName);
      setRole(initialUser.role ?? DEFAULT_ROLE);
      setUsername(initialUser.username ?? '');
      setEmail(initialUser.email ?? '');
      setPhoneNumber(initialUser.phoneNumber ?? '');
      setPassword('');
      setAvatarPreview(initialUser.avatarUrl ?? null);
      setAvatarData(null);
    } else {
      setFullName('');
      setRole(DEFAULT_ROLE);
      setUsername('');
      setEmail('');
      setPhoneNumber('');
      setPassword('');
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
      const result = typeof reader.result === 'string' ? reader.result : null;
      setAvatarPreview(result);
      setAvatarData(result);
    };
    reader.readAsDataURL(file);
  };

  const togglePasswordVisibility = () => setShowPassword(prev => !prev);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = fullName.trim();
    const [firstName, ...rest] = trimmedName.split(' ');
    const lastName = rest.join(' ') || undefined;

    onSubmit({
      username: username.trim(),
      email: email.trim(),
      phoneNumber: phoneNumber.trim(),
      role,
      password: password.trim() ? password : undefined,
      firstName: firstName || undefined,
      lastName,
      avatarData,
      avatarUrl: avatarData ?? avatarPreview ?? null,
    });
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    const confirmed = window.confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.');
    if (!confirmed) return;
    await onDelete();
  };

  const showDeleteAction = mode === 'edit' && canDelete && onDelete;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-4xl rounded-3xl bg-white shadow-2xl dark:border dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center justify-between rounded-t-3xl bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 text-white">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            type="button"
            className="rounded-full p-1 transition-colors hover:bg-white hover:bg-opacity-20"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-8 pb-8 pt-6">
          <div className="grid gap-8 md:grid-cols-[220px_minmax(0,1fr)]">
            <div className="flex flex-col items-center justify-start">
              <span className="mb-3 text-sm font-semibold text-gray-600 dark:text-slate-300">Foto de Perfil</span>
              <div className="flex h-40 w-40 items-center justify-center rounded-[32px] border-4 border-blue-200 bg-blue-50 dark:border-blue-400/60 dark:bg-blue-500/15">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt={fullName || username || 'Usuario'}
                    className="h-full w-full rounded-[24px] object-cover"
                  />
                ) : (
                  <ImageIcon className="h-20 w-20 text-blue-300" />
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
                className="mt-4 rounded-full bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-md transition-colors hover:bg-blue-700"
              >
                Agregar Imagen
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className={labelClasses}>
                  Nombres *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={event => setFullName(event.target.value)}
                  className={inputClasses}
                  placeholder="Ingresa nombres"
                  required
                />
              </div>

              <div>
                <label className={labelClasses}>
                  Rol *
                </label>
                <select
                  value={role}
                  onChange={event => setRole(event.target.value as UserRole)}
                  className={`${inputClasses} appearance-none`}
                  required
                >
                  {Object.values(UserRole).map(roleOption => (
                    <option key={roleOption} value={roleOption}>
                      {roleOption}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClasses}>
                  Usuario *
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={event => setUsername(event.target.value)}
                  className={inputClasses}
                  placeholder="Nombre de usuario"
                  required
                />
              </div>

              <div>
                <label className={labelClasses}>
                  Teléfono *
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={event => setPhoneNumber(event.target.value)}
                  className={inputClasses}
                  placeholder="e.g. 123456789"
                  required
                />
              </div>

              <div>
                <label className={labelClasses}>
                  Email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                  className={inputClasses}
                  placeholder="correo@ejemplo.com"
                  required
                />
              </div>

              <div>
                <label className={labelClasses}>
                  Contraseña {mode === 'create' ? '*' : ''}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={event => setPassword(event.target.value)}
                    className={`${inputClasses} pr-10`}
                    placeholder={mode === 'create' ? 'Ingresa contraseña' : 'Dejar en blanco para mantener'}
                    required={mode === 'create'}
                    minLength={mode === 'create' ? 6 : undefined}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 dark:text-slate-400"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {mode === 'edit' && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">Deja el campo vacío si no deseas cambiar la contraseña.</p>
                )}
              </div>
            </div>
          </div>

          <hr className="my-8 border-gray-200 dark:border-slate-800" />

          {errorMessage && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
              {errorMessage}
            </div>
          )}

          <div
            className={`flex flex-col gap-4 sm:flex-row sm:items-center ${
              showDeleteAction ? 'sm:justify-between' : 'sm:justify-end'
            }`}
          >
            {showDeleteAction && (
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-full border border-red-200 px-6 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 dark:border-rose-500/30 dark:text-rose-300 dark:hover:bg-rose-500/10"
                disabled={isSubmitting}
              >
                Eliminar Usuario
              </button>
            )}
            <div className="flex flex-col gap-4 self-end sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-gray-300 px-6 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-full bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-md transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Guardando...' : submitButtonLabel}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
