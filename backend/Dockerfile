# Backend Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/db/schema ./dist/db/schema
COPY --from=builder /app/drizzle ./drizzle

EXPOSE 4000

# Run migrations then start the server (DATABASE_URL is set at runtime)
CMD ["sh", "-c", "node dist/migrate.js && node dist/server.js"]
