import React, { useState, useRef } from 'react';
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
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhoneChange = (idx: number, value: string) => {
    const updated = [...phones];
    updated[idx] = value;
    setPhones(updated);
  };

  const handleAddPhone = () => {
    setPhones([...phones, '']);
  };

  const handleRemovePhone = (idx: number) => {
    setPhones(phones.filter((_, i) => i !== idx));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
  <div className="bg-white rounded-2xl shadow-lg w-full max-w-3xl">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-lg px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">Nuevo Proveedor</h3>
          <button onClick={onClose} className="text-white text-2xl font-bold">×</button>
        </div>
        <form onSubmit={handleSubmit} className="px-8 py-6">
          <div className="flex gap-8">
            <div className="flex flex-col items-center w-1/4 justify-center py-2">
              <label className="block text-sm font-medium mb-3 text-center" style={{ color: '#374151' }}>Foto de Perfil</label>
              <div className="border-2 border-purple-400 rounded-lg p-4 mb-4 w-32 h-32 flex items-center justify-center bg-purple-50">
                {photoUrl ? (
                  <img src={photoUrl} alt="Foto" className="w-28 h-28 object-cover rounded" />
                ) : (
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-user">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
                  </svg>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleImageChange}
              />
              <button
                type="button"
                className="bg-purple-600 text-white px-4 py-2 rounded mb-2 text-sm"
                onClick={() => fileInputRef.current?.click()}
              >
                Agregar Imagen
              </button>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Nombre *</label>
                <input type="text" value={name} onChange={e => {
                  if (e.target.value.split(' ').length <= 40) setName(e.target.value);
                }} required maxLength={255} className="w-full border rounded px-3 py-2 transition-all duration-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Telefono *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={phones[0]}
                    onChange={e => {
                      if (/^\d*$/.test(e.target.value)) handlePhoneChange(0, e.target.value);
                    }}
                    required
                    className="w-full border rounded px-3 py-2 transition-all duration-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  />
                  <button type="button" onClick={handleAddPhone} disabled={phones.length >= 4} className={`bg-purple-600 text-white px-2 rounded text-lg ${phones.length >= 4 ? 'opacity-50 cursor-not-allowed' : ''}`}>+</button>
                </div>
                {phones.length > 1 && phones.slice(1).map((phone, idx) => (
                  <div key={idx} className="flex gap-2 mt-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={phone}
                      onChange={e => {
                        if (/^\d*$/.test(e.target.value)) handlePhoneChange(idx + 1, e.target.value);
                      }}
                      required
                      className="w-full border rounded px-3 py-2 transition-all duration-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                    />
                    <button type="button" onClick={() => handleRemovePhone(idx + 1)} className="bg-red-500 text-white px-2 rounded text-lg">–</button>
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Email *</label>
                <input type="email" value={email} onChange={e => {
                  if (e.target.value.split(' ').length <= 50) setEmail(e.target.value);
                }} required maxLength={255} className="w-full border rounded px-3 py-2 transition-all duration-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Dirección</label>
                <input type="text" value={address} onChange={e => {
                  if (e.target.value.split(' ').length <= 50) setAddress(e.target.value);
                }} maxLength={255} className="w-full border rounded px-3 py-2 transition-all duration-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none" />
              </div>
            </div>
          </div>
          <hr className="my-6" />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200">Cancelar</button>
            <button type="submit" className="px-4 py-2 rounded bg-purple-600 text-white">Agregar Proveedor</button>
          </div>
        </form>
      </div>
    </div>
  );
};
