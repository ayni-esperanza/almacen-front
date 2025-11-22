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
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-slate-900 dark:to-slate-800">
      <div className="w-full max-w-sm p-6 bg-white border border-transparent shadow-2xl dark:bg-slate-950 rounded-2xl dark:border-slate-800">
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center w-14 h-14 mx-auto mb-3 bg-green-500 rounded-full dark:bg-green-600">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-slate-100">Sistema de Inventario</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-slate-300">Ingresa tus credenciales para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-slate-200">
              Usuario
            </label>
            <div className="relative">
              <User className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2 dark:text-slate-500" />
              <input
                type="text"
                name="username"
                value={credentials.username}
                onChange={handleChange}
                className="w-full py-2.5 pl-10 pr-4 transition-all border border-gray-300 rounded-lg dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent"
                placeholder="Ingresa tu usuario"
                required
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-slate-200">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2 dark:text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={credentials.password}
                onChange={handleChange}
                className="w-full py-2.5 pl-10 pr-12 transition-all border border-gray-300 rounded-lg dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent"
                placeholder="Ingresa tu contraseña"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute text-gray-400 transform -translate-y-1/2 right-3 top-1/2 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="px-4 py-3 text-sm text-red-700 border border-red-200 rounded-lg bg-red-50 dark:bg-red-500/10 dark:border-red-500/40 dark:text-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 font-medium text-white transition-colors bg-green-500 rounded-lg dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-500 focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
          >
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  );
};
