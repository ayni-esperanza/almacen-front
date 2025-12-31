import React, { useEffect, useRef, useState } from "react";
import { Image as ImageIcon, Minus, Plus, AlertCircle } from "lucide-react";
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { Provider } from "../types";
import { useModalScrollLock } from "../../../shared/hooks/useModalScrollLock";
import { useEscapeKey } from "../../../shared/hooks/useEscapeKey";
import { useClickOutside } from "../../../shared/hooks/useClickOutside";
import { useToast } from "../../../shared/hooks/useToast";
import { validateProviderForm, cleanPhones } from "../utils/validation";
import { usePhoneDropdown } from "../../../shared/hooks/usePhoneDropdown";

interface EditProviderModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: Provider | null;
  onEdit: (provider: Provider) => void;
  onDelete?: (provider: Provider) => void | Promise<void>;
}

export const EditProviderModal: React.FC<EditProviderModalProps> = ({
  isOpen,
  onClose,
  provider,
  onEdit,
  onDelete,
}) => {
  // Bloquear scroll
  useModalScrollLock(isOpen);
  // Cerrar modal con tecla ESC
  useEscapeKey(onClose, isOpen);
  // Referencia para detectar clicks fuera de la modal
  const modalRef = useRef<HTMLDivElement>(null);
  // Cerrar modal al hacer click fuera
  useClickOutside(modalRef, onClose, isOpen);
  
  // Hook de notificaciones
  const { addToast } = useToast();

  const [name, setName] = useState(provider?.name || "");
  const [email, setEmail] = useState(provider?.email || "");
  const [address, setAddress] = useState(provider?.address || "");
  const [phones, setPhones] = useState<string[]>(
    provider?.phones?.length ? provider.phones : [""]
  );
  const [photoUrl, setPhotoUrl] = useState<string>(provider?.photoUrl || "");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputClasses =
    "w-full rounded-xl border border-gray-300 px-3 py-1.5 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-purple-300 dark:focus:ring-purple-500/30";
  const labelClasses =
    "mb-1 block text-xs font-semibold text-gray-700 dark:text-slate-200";

  const { registerField, getDropdownStyle, handleChange } = usePhoneDropdown({
    isOpen,
    fieldCount: phones.length,
  });

  useEffect(() => {
    if (!provider) return;
    setName(provider.name);
    setEmail(provider.email);
    setAddress(provider.address);
    setPhones(provider.phones.length ? provider.phones : [""]);
    setPhotoUrl(provider.photoUrl || "");
    setValidationError(null);
  }, [provider]);

  const handleAddPhone = () => {
    setPhones((prev) => (prev.length >= 4 ? prev : [...prev, ""]));
  };

  const handleRemovePhone = (index: number) => {
    setPhones((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setPhotoUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!provider) return;

    // Limpiar teléfonos vacíos
    const cleanedPhones = cleanPhones(phones);

    // Validar datos
    const error = validateProviderForm({
      name,
      email,
      address,
      phones: cleanedPhones,
      photoUrl,
    });

    if (error) {
      setValidationError(error.message);
      addToast(error.message, 'error', 5000);
      return;
    }

    // Si la validación pasó, proceder con la actualización
    setIsSubmitting(true);
    try {
      onEdit({ ...provider, name, email, address, phones: cleanedPhones, photoUrl });
      addToast('Proveedor actualizado exitosamente', 'success');
      setValidationError(null);
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar el proveedor';
      setValidationError(errorMessage);
      addToast(errorMessage, 'error', 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!provider || !onDelete) return;

    const confirmed = window.confirm(
      "¿Eliminar este proveedor? Esta acción no se puede deshacer."
    );

    if (!confirmed) return;

    try {
      setIsDeleting(true); // Bloquear botón
      await onDelete(provider);
      addToast('Proveedor eliminado exitosamente', 'success');
      // Si tiene éxito, el padre cerrará el modal
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar el proveedor';
      console.error("Error al eliminar:", error);
      addToast(errorMessage, 'error', 5000);
      setIsDeleting(false); // Desbloquear si falla
    }
  };

  if (!isOpen || !provider) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm dark:bg-slate-950/70">
      <div
        ref={modalRef}
        className="flex flex-col w-full max-w-3xl overflow-hidden bg-white shadow-2xl max-h-95vh rounded-3xl dark:border dark:border-slate-800 dark:bg-slate-950"
      >
        <div className="flex items-center justify-between flex-shrink-0 px-4 py-2 text-white rounded-t-3xl bg-gradient-to-r from-purple-500 to-purple-600">
          <h3 className="text-base font-semibold">Editar Proveedor</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-2xl font-bold leading-none"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="px-4 pt-4 pb-4">
            {validationError && (
              <div className="mb-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-500/30 dark:bg-red-500/10">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">
                    Error en el formulario
                  </p>
                  <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                    {validationError}
                  </p>
                </div>
              </div>
            )}
            <div className="grid gap-4 md:grid-cols-[180px_minmax(0,1fr)]">
              <div className="flex flex-col items-center">
                <span className="mb-2 text-xs font-semibold text-gray-600 dark:text-slate-300">
                  Foto de Perfil
                </span>
                <div className="flex h-32 w-32 items-center justify-center rounded-3xl border-[3px] border-purple-200 bg-purple-50 dark:border-purple-400/50 dark:bg-purple-500/15">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt="Foto"
                      className="h-full w-full rounded-[24px] object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-12 h-12 text-purple-400" />
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <button
                  type="button"
                  className="mt-2 rounded-full bg-purple-600 px-3 py-1.5 text-xs font-medium text-white shadow-md transition-colors hover:bg-purple-700"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Cambiar Imagen
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="md:col-span-2">
                  <span className={labelClasses}>Nombre *</span>
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                    maxLength={60}
                    className={inputClasses}
                    placeholder="Nombre del proveedor"
                  />
                </label>

                <label>
                  <span className={labelClasses}>Teléfono *</span>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 relative" ref={registerField(0)}>
                      <PhoneInput
                        defaultCountry="pe"
                        value={phones[0]}
                        onChange={(phone, meta) =>
                          handleChange(0, phone, meta?.country?.iso2, cleaned => {
                            setPhones(prev => prev.map((p, i) => (i === 0 ? cleaned : p)));
                            if (validationError) setValidationError(null);
                          })
                        }
                        inputClassName="!w-full !rounded-xl !border-gray-300 !px-3 !py-1.5 !text-gray-900 focus:!border-purple-500 focus:!outline-none focus:!ring-2 focus:!ring-purple-100 dark:!border-slate-700 dark:!bg-slate-900 dark:!text-slate-200 dark:focus:!border-purple-300 dark:focus:!ring-purple-500/30"
                        countrySelectorStyleProps={{
                          buttonClassName: '!rounded-l-xl !border-gray-300 !px-2 hover:!bg-gray-50 dark:!border-slate-700 dark:!bg-slate-900 dark:!text-slate-200 dark:hover:!bg-slate-800',
                          dropdownStyleProps: {
                            className: '!fixed !z-[9999] !bg-white dark:!bg-slate-900 !border !border-gray-300 dark:!border-slate-700 !shadow-xl !max-h-60 !overflow-auto !rounded-lg',
                            style: getDropdownStyle(0),
                            listItemClassName: '!cursor-pointer !px-3 !py-2 hover:!bg-gray-100 dark:hover:!bg-slate-800 dark:!text-slate-200',
                          }
                        }}
                        disableDialCodePrefill
                        forceDialCode
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddPhone}
                      disabled={phones.length >= 4}
                      className={`flex h-10 w-10 items-center justify-center rounded-full border border-purple-300 text-purple-600 transition-colors hover:bg-purple-50 dark:border-purple-400/50 dark:text-purple-200 dark:hover:bg-purple-500/15 ${
                        phones.length >= 4
                          ? "cursor-not-allowed opacity-40 hover:bg-transparent dark:hover:bg-transparent"
                          : ""
                      }`}
                      title="Agregar teléfono"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </label>

                <label>
                  <span className={labelClasses}>Email *</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    maxLength={255}
                    className={inputClasses}
                    placeholder="correo@ejemplo.com"
                  />
                </label>

                <label className="md:col-span-2">
                  <span className={labelClasses}>Dirección</span>
                  <input
                    type="text"
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                    maxLength={80}
                    className={inputClasses}
                    placeholder="Dirección comercial"
                  />
                </label>

                {phones.slice(1).map((phone, idx) => (
                  <label key={idx} className="md:col-span-2">
                    <span className={labelClasses}>Teléfono adicional</span>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 relative" ref={registerField(idx + 1)}>
                        <PhoneInput
                          defaultCountry="pe"
                          value={phone}
                          onChange={(phone, meta) =>
                            handleChange(idx + 1, phone, meta?.country?.iso2, cleaned => {
                              setPhones(prev => prev.map((p, i) => (i === idx + 1 ? cleaned : p)));
                              if (validationError) setValidationError(null);
                            })
                          }
                          inputClassName="!w-full !rounded-xl !border-gray-300 !px-3 !py-1.5 !text-gray-900 focus:!border-purple-500 focus:!outline-none focus:!ring-2 focus:!ring-purple-100 dark:!border-slate-700 dark:!bg-slate-900 dark:!text-slate-200 dark:focus:!border-purple-300 dark:focus:!ring-purple-500/30"
                          countrySelectorStyleProps={{
                            buttonClassName: '!rounded-l-xl !border-gray-300 !px-2 hover:!bg-gray-50 dark:!border-slate-700 dark:!bg-slate-900 dark:!text-slate-200 dark:hover:!bg-slate-800',
                            dropdownStyleProps: {
                              className: '!fixed !z-[9999] !bg-white dark:!bg-slate-900 !border !border-gray-300 dark:!border-slate-700 !shadow-xl !max-h-60 !overflow-auto !rounded-lg',
                              style: getDropdownStyle(idx + 1),
                              listItemClassName: '!cursor-pointer !px-3 !py-2 hover:!bg-gray-100 dark:hover:!bg-slate-800 dark:!text-slate-200',
                            }
                          }}
                          disableDialCodePrefill
                          forceDialCode
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemovePhone(idx + 1)}
                        className="flex items-center justify-center w-10 h-10 text-red-500 transition-colors border border-red-200 rounded-full hover:bg-red-50 dark:border-rose-500/30 dark:text-rose-300 dark:hover:bg-rose-500/15"
                        title="Eliminar teléfono"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <hr className="my-4 border-gray-200 dark:border-slate-800" />

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting || isSubmitting}
                className="w-full rounded-full border border-red-200 px-4 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-500/40 dark:text-rose-200 dark:hover:bg-rose-500/10 sm:w-auto"
              >
                {isDeleting ? "Eliminando..." : "Eliminar"}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="w-full rounded-full border border-gray-300 px-4 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 sm:w-auto"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-full bg-purple-600 px-4 py-1.5 text-xs font-semibold text-white shadow-md transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-purple-500 dark:hover:bg-purple-400 sm:w-auto"
              >
                {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
