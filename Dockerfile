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
    CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

# Nginx se inicia automáticamente
CMD ["nginx", "-g", "daemon off;"]
