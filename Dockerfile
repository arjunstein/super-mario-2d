# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install native dependencies required for better-sqlite3 compilation
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm install

COPY . .

# Build Vite frontend and TypeScript server
RUN npm run build
RUN npm prune --omit=dev

# Stage 2: Production runtime stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV DB_PATH=/app/data/mario.db

# better-sqlite3 compiled binary requires libstdc++ runtime
RUN apk add --no-cache libstdc++

# Create non-root user and persistent data directory
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN mkdir -p /app/data && chown -R appuser:appgroup /app

COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/dist ./dist
COPY --from=builder --chown=appuser:appgroup /app/dist-server ./dist-server
COPY --from=builder --chown=appuser:appgroup /app/package.json ./package.json

USER appuser

EXPOSE 3000

VOLUME ["/app/data"]

CMD ["node", "dist-server/index.js"]

