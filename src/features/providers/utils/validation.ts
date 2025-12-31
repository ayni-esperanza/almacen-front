/**
 * Validaciones reutilizables para proveedores
 */

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Valida si el nombre es válido
 */
export const validateName = (name: string): ValidationError | null => {
  if (!name || name.trim().length === 0) {
    return { field: 'name', message: 'El nombre es requerido' };
  }
  if (name.length > 255) {
    return { field: 'name', message: 'El nombre no puede exceder 255 caracteres' };
  }
  if (name.length < 3) {
    return { field: 'name', message: 'El nombre debe tener al menos 3 caracteres' };
  }
  return null;
};

/**
 * Valida si el email es válido
 */
export const validateEmail = (email: string): ValidationError | null => {
  if (!email || email.trim().length === 0) {
    return { field: 'email', message: 'El email es requerido' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { field: 'email', message: 'El email debe tener un formato válido con dominio (ej: usuario@dominio.com)' };
  }
  
  if (email.length > 255) {
    return { field: 'email', message: 'El email no puede exceder 255 caracteres' };
  }
  
  return null;
};

/**
 * Valida si el teléfono es válido
 */
export const validatePhone = (phone: string): ValidationError | null => {
  if (!phone || phone.trim().length === 0) {
    return { field: 'phone', message: 'Al menos un teléfono es requerido' };
  }

  // Permitir prefijo + y limpiar espacios/paréntesis/guiones
  const normalized = phone
    .replace(/[\s\-\(\)]/g, '')
    .replace(/^\+/, '');

  if (!/^\d+$/.test(normalized)) {
    return { field: 'phone', message: 'El teléfono solo puede contener números' };
  }
  
  if (normalized.length < 7) {
    return { field: 'phone', message: 'El teléfono debe tener al menos 7 dígitos' };
  }
  
  if (normalized.length > 20) {
    return { field: 'phone', message: 'El teléfono no puede exceder 20 dígitos' };
  }
  
  return null;
};

/**
 * Valida un array de teléfonos
 */
export const validatePhones = (phones: string[]): ValidationError | null => {
  if (!phones || phones.length === 0) {
    return { field: 'phones', message: 'Al menos un teléfono es requerido' };
  }
  
  // Validar el primer teléfono (obligatorio)
  if (phones[0]) {
    const firstPhoneError = validatePhone(phones[0]);
    if (firstPhoneError) return firstPhoneError;
  } else {
    return { field: 'phones', message: 'El teléfono principal es requerido' };
  }
  
  // Validar teléfonos adicionales (opcionales, pero si existen deben ser válidos)
  for (let i = 1; i < phones.length; i++) {
    if (phones[i] && phones[i].trim().length > 0) {
      const error = validatePhone(phones[i]);
      if (error) {
        return { ...error, field: `phone-${i}` };
      }
    }
  }
  
  return null;
};

/**
 * Valida la dirección (opcional)
 */
export const validateAddress = (address: string): ValidationError | null => {
  if (address && address.length > 255) {
    return { field: 'address', message: 'La dirección no puede exceder 255 caracteres' };
  }
  return null;
};

/**
 * Limpia el array de teléfonos removiendo vacíos y duplicados
 */
export const cleanPhones = (phones: string[]): string[] => {
  return Array.from(
    new Set(
      phones
        .map((phone) => phone.trim())
        .filter((phone) => phone.length > 0)
    )
  );
};

/**
 * Valida todos los campos del formulario de proveedor
 */
export interface ProviderFormData {
  name: string;
  email: string;
  address: string;
  phones: string[];
  photoUrl?: string;
}

export const validateProviderForm = (data: ProviderFormData): ValidationError | null => {
  // Validar nombre
  const nameError = validateName(data.name);
  if (nameError) return nameError;
  
  // Validar email
  const emailError = validateEmail(data.email);
  if (emailError) return emailError;
  
  // Validar teléfonos
  const phonesError = validatePhones(data.phones);
  if (phonesError) return phonesError;
  
  // Validar dirección (opcional)
  const addressError = validateAddress(data.address);
  if (addressError) return addressError;
  
  return null;
};
