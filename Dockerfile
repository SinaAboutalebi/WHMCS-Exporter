FROM node:20-alpine

# Add non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Install curl for healthcheck
RUN apk add --no-cache curl

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --omit=dev


COPY . .

# Set environment variables
ENV PORT=9200
ENV NODE_ENV=production

# Use non-root user
USER appuser

# Expose the application port
EXPOSE 9200

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD curl -f http://localhost:9200/health || exit 1

# Start the application
CMD ["npm", "start"]
