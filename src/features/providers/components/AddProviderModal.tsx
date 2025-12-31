import React, { useRef, useState } from 'react';
import { Image as ImageIcon, Minus, Plus } from 'lucide-react';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { Provider } from '../types';
import { useModalScrollLock } from '../../../shared/hooks/useModalScrollLock';
import { useEscapeKey } from '../../../shared/hooks/useEscapeKey';
import { useClickOutside } from '../../../shared/hooks/useClickOutside';
import { useToast } from '../../../shared/hooks/useToast';
import { validateProviderForm, cleanPhones } from '../utils/validation';
import { usePhoneDropdown } from '../../../shared/hooks/usePhoneDropdown';

interface AddProviderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (provider: Omit<Provider, 'id'>) => void;
}

export const AddProviderModal: React.FC<AddProviderModalProps> = ({ isOpen, onClose, onAdd }) => {
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

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [phones, setPhones] = useState<string[]>(['']);
  const [photoUrl, setPhotoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const inputClasses = 'w-full rounded-xl border border-gray-300 px-3 py-1.5 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-purple-300 dark:focus:ring-purple-500/30';
  const labelClasses = 'mb-1 block text-xs font-semibold text-gray-700 dark:text-slate-200';
  const { registerField, getDropdownStyle, handleChange } = usePhoneDropdown({
    isOpen,
    fieldCount: phones.length,
  });

  const handleAddPhone = () => {
    setPhones(prev => (prev.length >= 4 ? prev : [...prev, '']));
  };

  const handleRemovePhone = (index: number) => {
    setPhones(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setPhotoUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setEmail(value);
    
    // Validar formato de email con dominio
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) {
      event.target.setCustomValidity('El correo debe tener un formato válido con dominio (ej: usuario@dominio.com)');
    } else {
      event.target.setCustomValidity('');
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
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
      addToast(error.message, 'error', 5000);
      return;
    }
    
    // Si la validación pasó, proceder con la creación
    setIsSubmitting(true);
    try {
      onAdd({ name, email, address, phones: cleanedPhones, photoUrl });
      addToast('Proveedor creado exitosamente', 'success');
      // Limpiar formulario
      setName('');
      setEmail('');
      setAddress('');
      setPhones(['']);
      setPhotoUrl('');
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear el proveedor';
      addToast(errorMessage, 'error', 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm dark:bg-slate-950/70 p-4">
      <div
        ref={modalRef}
        className="w-full max-w-3xl max-h-95vh rounded-3xl bg-white shadow-2xl dark:border dark:border-slate-800 dark:bg-slate-950 flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between rounded-t-3xl bg-gradient-to-r from-purple-500 to-purple-600 px-4 py-2 text-white flex-shrink-0">
          <h3 className="text-base font-semibold">Nuevo Proveedor</h3>
          <button type="button" onClick={onClose} className="text-2xl font-bold leading-none">×</button>
        </div>

        <div className="overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="px-4 pb-4 pt-4">
          <div className="grid gap-4 md:grid-cols-[180px_minmax(0,1fr)]">
            <div className="flex flex-col items-center">
              <span className="mb-2 text-xs font-semibold text-gray-600 dark:text-slate-300">Foto de Perfil</span>
              <div className="flex h-32 w-32 items-center justify-center rounded-3xl border-[3px] border-purple-200 bg-purple-50 dark:border-purple-400/50 dark:bg-purple-500/15">
                {photoUrl ? (
                  <img src={photoUrl} alt="Foto" className="h-full w-full rounded-[24px] object-cover" />
                ) : (
                  <ImageIcon className="h-12 w-12 text-purple-400" />
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
                Agregar Imagen
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="md:col-span-2">
                <span className={labelClasses}>Nombre *</span>
                <input
                  type="text"
                  value={name}
                  onChange={event => setName(event.target.value)}
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
                    className={`flex h-10 w-10 items-center justify-center rounded-full border border-purple-300 text-purple-600 transition-colors hover:bg-purple-50 dark:border-purple-400/50 dark:text-purple-200 dark:hover:bg-purple-500/15 ${phones.length >= 4 ? 'cursor-not-allowed opacity-40 hover:bg-transparent dark:hover:bg-transparent' : ''}`}
                    title="Agregar teléfono"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </label>

              <label>
                <span className={labelClasses}>Email *</span>
                <input
                  ref={emailInputRef}
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  required
                  maxLength={255}
                  className={inputClasses}
                  placeholder="correo@ejemplo.com"
                  pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
                  title="El correo debe tener un formato válido con dominio (ej: usuario@dominio.com)"
                />
              </label>

              <label className="md:col-span-2">
                <span className={labelClasses}>Dirección</span>
                <input
                  type="text"
                  value={address}
                  onChange={event => setAddress(event.target.value)}
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
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-red-200 text-red-500 transition-colors hover:bg-red-50 dark:border-rose-500/30 dark:text-rose-300 dark:hover:bg-rose-500/15"
                      title="Eliminar teléfono"
                    >
                      <Minus className="h-4 w-4" />
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
              {isSubmitting ? 'Creando...' : 'Agregar Proveedor'}
            </button>
          </div>
          </form>
        </div>
      </div>
    </div>
  );
};
