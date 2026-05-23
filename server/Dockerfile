FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Production image
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install only production dependencies
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copy compiled source from builder
COPY --from=builder /app/dist ./dist
# Copy uploads directory to prevent missing folder errors
RUN mkdir uploads

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 serveruser
RUN chown -R serveruser:nodejs /app/uploads
USER serveruser

EXPOSE 5000 5001

CMD ["node", "dist/index.js"]
