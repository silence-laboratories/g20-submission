FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Copy .env file (make sure to create .env from env.example.txt before building)
# For production, use docker-compose or build args to pass environment variables
COPY .env* ./

# Expose the development port
EXPOSE 3000

# Start the development server
# Next.js will automatically load .env files
CMD ["npm", "run", "dev"]