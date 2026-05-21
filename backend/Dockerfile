# ─── Build stage ─────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Prisma needs OpenSSL on alpine
RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build
# Compile the seed to plain JS so the runtime image needs no ts-node.
# (run AFTER nest build, which clears dist/). Output → dist/seed/seed.js
RUN npx tsc prisma/seed.ts \
      --outDir dist/seed \
      --module commonjs \
      --target ES2021 \
      --moduleResolution node \
      --esModuleInterop \
      --skipLibCheck \
      --resolveJsonModule

# ─── Runtime stage ───────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache openssl

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/prisma ./prisma

# Entrypoint: apply schema, seed, then start the API
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

EXPOSE 4000
ENTRYPOINT ["./docker-entrypoint.sh"]
