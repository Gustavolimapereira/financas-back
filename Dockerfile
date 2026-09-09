# =====================================================
# ETAPA 1 - BUILD
# =====================================================
FROM node:20-bookworm-slim AS builder

WORKDIR /app

# Necessário para:
# - argon2 / node-gyp
# - Prisma/OpenSSL
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    openssl \
    && rm -rf /var/lib/apt/lists/*

# Copia primeiro os arquivos de dependências
COPY package*.json ./

# Instala dependências, incluindo devDependencies
RUN npm ci

# Prisma precisa do schema para gerar o client
COPY prisma ./prisma

RUN npx prisma generate

# Copia o restante do projeto
COPY . .

# Compila o NestJS
RUN npm run build

# Remove dependências usadas somente no desenvolvimento
RUN npm prune --omit=dev


# =====================================================
# ETAPA 2 - PRODUÇÃO
# =====================================================
FROM node:20-bookworm-slim AS production

WORKDIR /app

ENV NODE_ENV=production

# Prisma precisa do OpenSSL em runtime
RUN apt-get update && apt-get install -y \
    openssl \
    && rm -rf /var/lib/apt/lists/*

# Copia somente o necessário da etapa de build
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["node", "dist/main"]