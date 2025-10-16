import React, { useRef, useState } from 'react';
import { Image as ImageIcon, Minus, Plus } from 'lucide-react';
import { Provider } from '../types';

interface AddProviderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (provider: Omit<Provider, 'id'>) => void;
}

export const AddProviderModal: React.FC<AddProviderModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [phones, setPhones] = useState<string[]>(['']);
  const [photoUrl, setPhotoUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhoneChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    setPhones(prev => prev.map((phone, idx) => (idx === index ? value : phone)));
  };

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

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onAdd({ name, email, address, phones, photoUrl });
    setName('');
    setEmail('');
    setAddress('');
    setPhones(['']);
    setPhotoUrl('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-4xl rounded-[32px] bg-white shadow-2xl">
        <div className="flex items-center justify-between rounded-t-[32px] bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4 text-white">
          <h3 className="text-lg font-semibold">Nuevo Proveedor</h3>
          <button type="button" onClick={onClose} className="text-2xl font-bold leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="px-8 pb-8 pt-6">
          <div className="grid gap-8 md:grid-cols-[240px_minmax(0,1fr)]">
            <div className="flex flex-col items-center">
              <span className="mb-3 text-sm font-semibold text-gray-600">Foto de Perfil</span>
              <div className="flex h-40 w-40 items-center justify-center rounded-[32px] border-[3px] border-purple-200 bg-purple-50">
                {photoUrl ? (
                  <img src={photoUrl} alt="Foto" className="h-full w-full rounded-[24px] object-cover" />
                ) : (
                  <ImageIcon className="h-16 w-16 text-purple-400" />
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
                className="mt-4 rounded-full bg-purple-600 px-5 py-2 text-sm font-medium text-white shadow-md transition-colors hover:bg-purple-700"
                onClick={() => fileInputRef.current?.click()}
              >
                Agregar Imagen
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <label className="md:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-gray-700">Nombre *</span>
                <input
                  type="text"
                  value={name}
                  onChange={event => setName(event.target.value)}
                  required
                  maxLength={255}
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
                  placeholder="Nombre del proveedor"
                />
              </label>

              <label>
                <span className="mb-2 block text-sm font-semibold text-gray-700">Teléfono *</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={phones[0]}
                    onChange={event => handlePhoneChange(0, event.target.value)}
                    required
                    className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
                    placeholder="Número principal"
                  />
                  <button
                    type="button"
                    onClick={handleAddPhone}
                    disabled={phones.length >= 4}
                    className={`flex h-10 w-10 items-center justify-center rounded-full border border-purple-300 text-purple-600 transition-colors hover:bg-purple-50 ${phones.length >= 4 ? 'cursor-not-allowed opacity-40 hover:bg-transparent' : ''}`}
                    title="Agregar teléfono"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </label>

              <label>
                <span className="mb-2 block text-sm font-semibold text-gray-700">Email *</span>
                <input
                  type="email"
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                  required
                  maxLength={255}
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
                  placeholder="correo@ejemplo.com"
                />
              </label>

              <label className="md:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-gray-700">Dirección</span>
                <input
                  type="text"
                  value={address}
                  onChange={event => setAddress(event.target.value)}
                  maxLength={255}
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
                  placeholder="Dirección comercial"
                />
              </label>

              {phones.slice(1).map((phone, idx) => (
                <label key={idx} className="md:col-span-2">
                  <span className="mb-2 block text-sm font-semibold text-gray-700">Teléfono adicional</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={phone}
                      onChange={event => handlePhoneChange(idx + 1, event.target.value)}
                      required
                      className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
                      placeholder="Número adicional"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePhone(idx + 1)}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-red-200 text-red-500 transition-colors hover:bg-red-50"
                      title="Eliminar teléfono"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <hr className="my-8 border-gray-200" />

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-full border border-gray-300 px-6 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 sm:w-auto"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-full rounded-full bg-purple-600 px-6 py-2 text-sm font-semibold text-white shadow-md transition-colors hover:bg-purple-700 sm:w-auto"
            >
              Agregar Proveedor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
