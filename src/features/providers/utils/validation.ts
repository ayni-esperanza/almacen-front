/**
 * Validaciones reutilizables para proveedores
 */

export interface ValidationError {
  field: string;
  message: string;
}

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

export const validateEmail = (email: string): ValidationError | null => {
  if (!email || email.trim().length === 0) {
    return { field: 'email', message: 'El email es requerido' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { field: 'email', message: 'El email debe tener un formato valido con dominio (ej: usuario@dominio.com)' };
  }

  if (email.length > 255) {
    return { field: 'email', message: 'El email no puede exceder 255 caracteres' };
  }

  return null;
};

export const validatePhone = (phone: string): ValidationError | null => {
  if (!phone || phone.trim().length === 0) {
    return { field: 'phone', message: 'Al menos un telefono es requerido' };
  }

  const normalized = phone.replace(/[\s\-\(\)]/g, '').replace(/^\+/, '');

  if (!/^\d+$/.test(normalized)) {
    return { field: 'phone', message: 'El telefono solo puede contener numeros' };
  }

  if (normalized.length < 7) {
    return { field: 'phone', message: 'El telefono debe tener al menos 7 digitos' };
  }

  if (normalized.length > 20) {
    return { field: 'phone', message: 'El telefono no puede exceder 20 digitos' };
  }

  return null;
};

export const validatePhones = (phones: string[]): ValidationError | null => {
  if (!phones || phones.length === 0) {
    return { field: 'phones', message: 'Al menos un telefono es requerido' };
  }

  if (phones[0]) {
    const firstPhoneError = validatePhone(phones[0]);
    if (firstPhoneError) return firstPhoneError;
  } else {
    return { field: 'phones', message: 'El telefono principal es requerido' };
  }

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

export const validateAddress = (address: string): ValidationError | null => {
  if (address && address.length > 255) {
    return { field: 'address', message: 'La direccion no puede exceder 255 caracteres' };
  }
  return null;
};

export const validateRuc = (ruc?: string | null): ValidationError | null => {
  if (!ruc || ruc.trim().length === 0) return null;

  if (!/^\d{11}$/.test(ruc.trim())) {
    return { field: 'ruc', message: 'El RUC debe tener exactamente 11 digitos' };
  }

  return null;
};

export const validateOptionalLength = (
  field: string,
  label: string,
  value?: string | null,
  maxLength: number = 255,
): ValidationError | null => {
  if (value && value.length > maxLength) {
    return { field, message: `${label} no puede exceder ${maxLength} caracteres` };
  }
  return null;
};

export interface ProviderBankAccountForm {
  banco: string;
  cta: string;
  cci: string;
}

export const cleanBankAccounts = (
  accounts: ProviderBankAccountForm[],
): ProviderBankAccountForm[] => {
  return accounts
    .map((account) => ({
      banco: account.banco.trim(),
      cta: account.cta.trim(),
      cci: account.cci.trim(),
    }))
    .filter(
      (account) =>
        account.banco.length > 0 ||
        account.cta.length > 0 ||
        account.cci.length > 0,
    );
};

export const validateBankAccount = (
  account: ProviderBankAccountForm,
  index: number,
): ValidationError | null => {
  const hasAny =
    account.banco.trim().length > 0 ||
    account.cta.trim().length > 0 ||
    account.cci.trim().length > 0;

  if (!hasAny) return null;

  if (!account.banco.trim()) {
    return {
      field: `bank-account-${index}-banco`,
      message: 'El banco es requerido en la cuenta bancaria',
    };
  }

  if (!account.cta.trim()) {
    return {
      field: `bank-account-${index}-cta`,
      message: 'La cuenta es requerida en la cuenta bancaria',
    };
  }

  if (!account.cci.trim()) {
    return {
      field: `bank-account-${index}-cci`,
      message: 'El CCI es requerido en la cuenta bancaria',
    };
  }

  if (account.banco.length > 80) {
    return {
      field: `bank-account-${index}-banco`,
      message: 'El banco no puede exceder 80 caracteres',
    };
  }

  if (account.cta.length > 80) {
    return {
      field: `bank-account-${index}-cta`,
      message: 'La cuenta no puede exceder 80 caracteres',
    };
  }

  if (account.cci.length > 80) {
    return {
      field: `bank-account-${index}-cci`,
      message: 'El CCI no puede exceder 80 caracteres',
    };
  }

  return null;
};

export const cleanPhones = (phones: string[]): string[] => {
  return Array.from(
    new Set(
      phones
        .map((phone) => phone.trim())
        .filter((phone) => phone.length > 0),
    ),
  );
};

export interface ProviderFormData {
  name: string;
  email: string;
  address: string;
  phones: string[];
  bankAccounts?: ProviderBankAccountForm[];
  ruc?: string | null;
  banco?: string | null;
  cta?: string | null;
  cci?: string | null;
  photoUrl?: string;
}

export const validateProviderForm = (data: ProviderFormData): ValidationError | null => {
  const nameError = validateName(data.name);
  if (nameError) return nameError;

  const emailError = validateEmail(data.email);
  if (emailError) return emailError;

  const phonesError = validatePhones(data.phones);
  if (phonesError) return phonesError;

  if (data.bankAccounts && data.bankAccounts.length > 0) {
    for (let i = 0; i < data.bankAccounts.length; i++) {
      const bankAccountError = validateBankAccount(data.bankAccounts[i], i);
      if (bankAccountError) return bankAccountError;
    }
  }

  const addressError = validateAddress(data.address);
  if (addressError) return addressError;

  const rucError = validateRuc(data.ruc);
  if (rucError) return rucError;

  const bancoError = validateOptionalLength('banco', 'El banco', data.banco);
  if (bancoError) return bancoError;

  const ctaError = validateOptionalLength('cta', 'La cuenta', data.cta);
  if (ctaError) return ctaError;

  const cciError = validateOptionalLength('cci', 'El CCI', data.cci);
  if (cciError) return cciError;

  return null;
};
