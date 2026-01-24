FROM node:18-alpine

# Set working directory to the backend folder
WORKDIR /app

# Copy backend package files
COPY defund/backend/package*.json ./

# Install dependencies
RUN npm install

# Copy backend source
COPY defund/backend/ ./

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3001

# Start server
CMD ["npm", "start"]
