# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./

# Install dependencies with legacy peer deps support
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build application
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Add build arguments
ARG PROXMOX_API_URL
ARG PROXMOX_USERNAME
ARG PROXMOX_PASSWORD

# Set environment variables for build
ENV PROXMOX_API_URL=$PROXMOX_API_URL
ENV PROXMOX_USERNAME=$PROXMOX_USERNAME
ENV PROXMOX_PASSWORD=$PROXMOX_PASSWORD

# Disable TypeScript strict checks and attempt build
RUN npm run build || \
    (npm install --legacy-peer-deps --force && npm run build) || \
    (export NODE_OPTIONS=--max_old_space_size=4096 && npm run build)

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Add non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/package.json ./package.json

# Set correct permissions
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application
CMD ["node", "server.js"] 