# ====================================
# Stage 1: Dependencies
# ====================================
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ====================================
# Stage 2: Builder
# ====================================
FROM node:20-alpine AS builder
WORKDIR /app

# Recibir argumentos de Dokploy
ARG VITE_API_URL
ARG VITE_APP_NAME
ARG VITE_APP_ENV

# Inyectar variables para el build de Vite
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_APP_NAME=$VITE_APP_NAME
ENV VITE_APP_ENV=$VITE_APP_ENV

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ====================================
# Stage 3: Runner (Producción)
# ====================================
FROM nginx:alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]