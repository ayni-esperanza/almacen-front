/**
 * Configuración centralizada de la aplicación
 * Lee las variables de entorno de Vite
 */

export const config = {
  // URL de la API backend
  apiUrl: import.meta.env.VITE_API_URL || "http://localhost:3001",

  // Nombre de la aplicación
  appName: import.meta.env.VITE_APP_NAME || "AYNI Almacén",

  // Entorno actual
  environment: import.meta.env.VITE_APP_ENV || "development",

  // Modo de desarrollo
  isDevelopment: import.meta.env.DEV,

  // Modo de producción
  isProduction: import.meta.env.PROD,
} as const;

export default config;
