import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff } from 'lucide-react';
import { LoginCredentials } from '../types';

interface LoginFormProps {
  onLogin: (credentials: LoginCredentials) => void;
  error?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin, error }) => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(credentials);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-2xl w-full max-w-md p-8 border border-transparent dark:border-slate-800">
        <div className="text-center mb-8">
          <div className="bg-green-500 dark:bg-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100">Sistema de Inventario</h1>
          <p className="text-gray-600 dark:text-slate-300 mt-2">Ingresa tus credenciales para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
              Usuario
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500 w-5 h-5" />
              <input
                type="text"
                name="username"
                value={credentials.username}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent transition-all"
                placeholder="Ingresa tu usuario"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500 w-5 h-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={credentials.password}
                onChange={handleChange}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent transition-all"
                placeholder="Ingresa tu contraseña"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/40 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-green-500 dark:bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-600 dark:hover:bg-green-500 transition-colors focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
          >
            Iniciar Sesión
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500 dark:text-slate-400">
          <p>Credenciales de prueba:</p>
          <p className="font-mono">admin / admin123</p>
        </div>
      </div>
    </div>
  );
};
