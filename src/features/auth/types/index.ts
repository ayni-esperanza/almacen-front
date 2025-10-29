// Import from a shared enum or define locally to match backend
export enum UserRole {
  GERENTE = "GERENTE",
  AYUDANTE = "AYUDANTE",
  ASISTENTE = "ASISTENTE",
}

export interface User {
  id: number;
  username: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  phoneNumber?: string | null;
  avatarUrl?: string | null;
  role: UserRole;
  isActive: boolean;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface CreateUserData {
  username: string;
  password: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  phoneNumber?: string;
  avatarUrl?: string | null;
}

export interface UpdateUserData extends Partial<CreateUserData> {
  isActive?: boolean;
}
