# Build stage
FROM node:20 AS builder

# Create and set the working directory
WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the project files
COPY . .

# Build the static export
RUN npm run build

# Runtime stage
FROM nginx:latest

# Copy the static export to the nginx web root
COPY --from=builder /app/out /usr/share/nginx/html