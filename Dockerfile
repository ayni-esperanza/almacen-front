# ====================================
# Stage 1: Dependencies
# ====================================
FROM node:20-alpine AS deps

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# ====================================
# Stage 2: Builder
# ====================================
FROM node:20-alpine AS builder

WORKDIR /app

# Declarar build arguments (se pasan desde Dokploy)
ARG VITE_API_URL
ARG VITE_APP_NAME
ARG VITE_APP_ENV

# Convertir a variables de entorno para el build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_APP_NAME=$VITE_APP_NAME
ENV VITE_APP_ENV=$VITE_APP_ENV

# Copiar dependencias del stage anterior
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build de Vite para producción
RUN npm run build

# ====================================
# Stage 3: Runner (Producción con Nginx)
# ====================================
FROM nginx:alpine AS runner

# Copiar archivos compilados desde builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración personalizada de Nginx para SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# Nginx se inicia automáticamente
CMD ["nginx", "-g", "daemon off;"]
