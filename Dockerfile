# --- Stage 1: Build ---
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Install all dependencies (including dev)
RUN npm ci

# Copy source and prisma
COPY prisma ./prisma
COPY prisma.config.ts ./
COPY src ./src

# Generate Prisma Client
RUN mkdir -p src/generated/prisma
RUN npx prisma generate

RUN ls -la src/generated/prisma

# Build NestJS
RUN npm run build

# --- Stage 2: Development ---
FROM node:22-alpine AS development

WORKDIR /app

# Copy all files from builder (including devDependencies and Prisma)
COPY --from=builder /app /app

# Expose the API port
EXPOSE 3000

# Default command for development (can be overridden in docker-compose)
CMD ["npm", "run", "start:dev"]

# --- Stage 3: Production ---
FROM node:22-alpine AS production

WORKDIR /app

# Copy package files and install production deps only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy Prisma artifacts (needed at runtime)
# We copy to both locations because the code in dist/ expects it at dist/src/generated
# while some other tools might expect it at src/generated
COPY --from=builder /app/src/generated ./src/generated
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# Copy built NestJS app
COPY --from=builder /app/dist ./dist

# Create a symlink or copy to ensure dist/src/generated exists
RUN mkdir -p dist/src && cp -r src/generated dist/src/

RUN npx prisma generate

EXPOSE 3000

CMD ["node", "dist/src/main.js"]
