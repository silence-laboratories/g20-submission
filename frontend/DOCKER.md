# Docker Setup Guide

This document describes how to run the frontend application using Docker for both development and production environments.

## Prerequisites

- Docker Desktop or Docker Engine installed
- Docker Compose V2 installed
- `.env` file configured (copy from `env.example.txt`)

## Environment Setup

Before building, create your `.env` file:

```bash
cp env.example.txt .env
```

Then edit `.env` with your actual values:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_SIGN_IN_URL=/auth/sign-in
NEXT_PUBLIC_SIGN_UP_URL=/auth/sign-up
NEXT_PUBLIC_AFTER_SIGN_IN_URL=/dashboard/overview
NEXT_PUBLIC_AFTER_SIGN_UP_URL=/dashboard/overview
# ... other variables
```

## Production Build

### Using Docker Compose (Recommended)

```bash
# Build and run in production mode
docker-compose up -d

# View logs
docker-compose logs -f frontend

# Stop the container
docker-compose down
```

### Using Docker CLI

```bash
# Build the production image
docker build -t frontend-prod \
  --build-arg NEXT_PUBLIC_BACKEND_URL=http://localhost:8000 \
  .

# Run the production container
docker run -d \
  --name frontend-app \
  -p 3000:3000 \
  --env-file .env \
  frontend-prod

# View logs
docker logs -f frontend-app

# Stop the container
docker stop frontend-app
docker rm frontend-app
```

## Development Build

### Using Docker Compose (Recommended)

```bash
# Build and run in development mode with hot reload
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f frontend-dev

# Stop the container
docker-compose -f docker-compose.dev.yml down
```

### Using Docker CLI

```bash
# Build the development image
docker build -f Dockerfile.dev -t frontend-dev .

# Run the development container with volume mounts
docker run -d \
  --name frontend-dev-app \
  -p 3000:3000 \
  --env-file .env \
  -v $(pwd)/src:/app/src \
  -v $(pwd)/public:/app/public \
  frontend-dev

# View logs
docker logs -f frontend-dev-app

# Stop the container
docker stop frontend-dev-app
docker rm frontend-dev-app
```

## Key Features

### Production Dockerfile (`Dockerfile`)

- **Multi-stage build**: Optimized for minimal image size
- **Standalone output**: Uses Next.js standalone mode for efficient production builds
- **Security**: Runs as non-root user (nextjs:nodejs)
- **Build-time optimization**: Only includes necessary production files
- **Environment variables**: Passed via build args and runtime env vars

### Development Dockerfile (`Dockerfile.dev`)

- **Hot reload**: Source code changes are reflected immediately
- **Volume mounts**: Local code is mounted for development
- **Fast iteration**: No rebuild needed for code changes
- **Full tooling**: Includes all dev dependencies

## Architecture

### Production Build Stages

1. **Base**: Node 18 Alpine base image
2. **Deps**: Install production dependencies
3. **Builder**: Build the Next.js application
4. **Runner**: Minimal runtime with only necessary files

### Image Sizes (Approximate)

- Production: ~150-200 MB (optimized standalone build)
- Development: ~800 MB-1 GB (includes all dev dependencies)

## Troubleshooting

### Build Fails with Dependency Errors

If you encounter peer dependency conflicts:

```bash
# The Dockerfile already includes --legacy-peer-deps flag
# If issues persist, clear Docker cache and rebuild
docker-compose build --no-cache
```

### Port Already in Use

```bash
# Check what's using port 3000
lsof -i :3000

# Stop any existing containers
docker-compose down

# Or change the port mapping in docker-compose.yml
ports:
  - "3001:3000"  # Map to host port 3001 instead
```

### Environment Variables Not Working

- **Production**: Ensure NEXT*PUBLIC*\* variables are passed as build args
- **Runtime**: Non-NEXT*PUBLIC*\* variables can be passed at runtime
- **Check**: Verify .env file exists and is properly formatted

### Container Fails to Start

```bash
# Check logs
docker-compose logs frontend

# Inspect container
docker inspect <container-id>

# Enter container for debugging
docker exec -it <container-id> sh
```

## Best Practices

### For Production

1. **Never commit .env files** - Keep sensitive data secure
2. **Use secrets management** - Consider Docker secrets or cloud provider secrets
3. **Enable health checks** - Add health check endpoints
4. **Use reverse proxy** - Run behind nginx or similar
5. **Monitor logs** - Set up centralized logging
6. **Enable HTTPS** - Use SSL/TLS in production

### For Development

1. **Use docker-compose.dev.yml** - Better for local development
2. **Keep volumes mounted** - For hot reload functionality
3. **Check .dockerignore** - Ensure it excludes unnecessary files
4. **Regular cleanup** - Remove unused images and containers

## Commands Reference

```bash
# Build without cache
docker-compose build --no-cache

# Rebuild specific service
docker-compose up -d --build frontend

# View resource usage
docker stats

# Clean up everything
docker-compose down -v
docker system prune -a

# Inspect built image layers
docker history frontend-prod
```

## Integration with Backend

To connect frontend with backend in Docker:

1. Create a shared network in docker-compose.yml:

```yaml
networks:
  app-network:
    driver: bridge
```

2. Add both services to the network:

```yaml
services:
  frontend:
    networks:
      - app-network
  backend:
    networks:
      - app-network
```

3. Use service names for inter-container communication:

```env
NEXT_PUBLIC_BACKEND_URL=http://backend:8000
```

## Additional Resources

- [Next.js Docker Documentation](https://nextjs.org/docs/deployment#docker-image)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)
