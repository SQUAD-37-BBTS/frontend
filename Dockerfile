# ---------- Stage 1: build ----------
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# VITE_* é embutido no bundle em tempo de build
ARG VITE_API_URL="https://api.treifit.com.br"
ARG VITE_API_TIMEOUT_MS="15000"

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_API_TIMEOUT_MS=$VITE_API_TIMEOUT_MS


RUN npm run build

# ---------- Stage 2: produção ----------
FROM node:22-alpine AS production
WORKDIR /app

# Servidor estático leve; -s faz fallback para index.html (SPA / react-router)
RUN npm install -g serve

COPY --from=build /app/dist ./dist

USER node
EXPOSE 5173
CMD ["serve", "-s", "dist", "-l", "5173"]
