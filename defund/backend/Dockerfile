FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy backend package files
COPY defund/backend/package*.json ./

# Install dependencies (including dev for tsc)
RUN npm install

# Copy backend source
COPY defund/backend/ ./

# Build TypeScript using npx to avoid permission issues
RUN npx tsc

# Expose port
EXPOSE 3001

# Start server
CMD ["node", "dist/index.js"]
