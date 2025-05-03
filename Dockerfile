FROM node:20-alpine

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

# Set environment variables
ENV PORT=9200
ENV NODE_ENV=production

USER appuser

# Expose the app port
EXPOSE 9200

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD curl -f http://localhost:9200/health || exit 1

# Start the application
CMD ["npm", "start"]
