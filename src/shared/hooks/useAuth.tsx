import { createContext, useContext, useState, ReactNode } from 'react';
import { User, LoginCredentials } from '../../features/auth/types';

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    // Simulación de autenticación
    if (credentials.username === 'admin' && credentials.password === 'admin123') {
      setUser({
        username: credentials.username,
        isAuthenticated: true
      });
      return { success: true };
    } else {
      return { success: false, error: 'Usuario o contraseña incorrectos' };
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
