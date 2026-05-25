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

ENV VITE_API_URL="https://linea.aynisac.com/api"
ENV VITE_APP_NAME="AYNI Almacén"
ENV VITE_APP_ENV="production"

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