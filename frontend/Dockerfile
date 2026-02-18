# Frontend Dockerfile (Next.js)
FROM node:18-alpine AS builder

WORKDIR /app

# Accept build-time env vars for Next.js (NEXT_PUBLIC_ vars are inlined at build time)
ARG NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY
ENV NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY=$NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY

COPY package*.json ./
RUN npm ci

COPY . .

# Build Next.js app
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy necessary files
COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/messages ./messages

EXPOSE 3000

CMD ["node", "server.js"]
