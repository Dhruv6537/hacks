FROM node:18

# Set working directory
WORKDIR /app

# Copy backend package files
COPY defund/backend/package*.json ./

# Install all dependencies
RUN npm ci

# Copy backend source
COPY defund/backend/ ./

# Make node_modules binaries executable
RUN chmod -R +x node_modules/.bin

# Build TypeScript
RUN ./node_modules/.bin/tsc

# Expose port
EXPOSE 3001

# Start server
CMD ["node", "dist/index.js"]
