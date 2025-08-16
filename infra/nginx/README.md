# TagPay Nginx Infrastructure

This directory contains the nginx reverse proxy configuration for the TagPay application.

## Overview

The nginx setup provides:

- **Reverse Proxy**: Routes traffic between admin dashboard and API server
- **Load Balancing**: Distributes requests across multiple backend instances
- **Security Headers**: Implements security best practices
- **Rate Limiting**: Protects against abuse and DDoS attacks
- **SSL Termination**: Handles HTTPS termination (when configured)
- **Caching**: Optimizes static asset delivery
- **Health Checks**: Monitors backend service health

## Files

### Core Configuration

- `Dockerfile` - Production nginx container
- `Dockerfile.dev` - Development nginx container
- `nginx.conf` - Main nginx configuration
- `default.conf` - Production server configuration
- `default.dev.conf` - Development server configuration

### Security Features

- **Rate Limiting**: API endpoints (10 req/s), auth endpoints (1 req/s)
- **Security Headers**: XSS protection, content type sniffing, frame options
- **CORS Support**: Proper CORS headers for API requests
- **WebSocket Support**: Real-time communication support

## Configuration Details

### Production Configuration (`default.conf`)

- Strict rate limiting for API endpoints
- Comprehensive security headers
- Optimized caching for static assets
- WebSocket support for real-time features
- Error page handling

### Development Configuration (`default.dev.conf`)

- Relaxed rate limiting for development
- Basic security headers
- Extended timeouts for debugging
- WebSocket support maintained

### Routing Rules

- `/api/*` → API Server (server:3000)
- `/api/ws` → WebSocket connections
- `/health` → Health check endpoint
- `/*` → Admin Dashboard (admin:80)

## Usage

### Production

```bash
# Build and start with docker-compose
docker-compose up nginx

# Or use the management script
./scripts/docker.sh up
```

### Development

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up nginx

# Or use the management script
./scripts/docker.sh dev
```

## Health Checks

The nginx container includes health checks:

- **Endpoint**: `http://localhost/health`
- **Interval**: 30 seconds
- **Timeout**: 3 seconds
- **Retries**: 3 attempts

## Monitoring

### Logs

```bash
# View nginx logs
docker-compose logs nginx

# Follow logs in real-time
docker-compose logs -f nginx
```

### Metrics

Nginx provides access logs with detailed metrics:

- Request time
- Upstream connect time
- Upstream header time
- Upstream response time

## Security Considerations

### Rate Limiting

- **API Endpoints**: 10 requests per second with burst of 20
- **Auth Endpoints**: 1 request per second with burst of 5
- **Zone Size**: 10MB per zone

### Security Headers

- `X-Frame-Options`: Prevents clickjacking
- `X-XSS-Protection`: XSS protection
- `X-Content-Type-Options`: Prevents MIME type sniffing
- `Strict-Transport-Security`: Enforces HTTPS
- `Content-Security-Policy`: Controls resource loading

## Customization

### Adding New Routes

Edit `default.conf` or `default.dev.conf`:

```nginx
location /new-route/ {
    proxy_pass http://new-service:port;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

### Modifying Rate Limits

Update the rate limiting zones in `nginx.conf`:

```nginx
limit_req_zone $binary_remote_addr zone=custom:10m rate=5r/s;
```

### SSL Configuration

For production SSL, add SSL configuration to `default.conf`:

```nginx
server {
    listen 443 ssl http2;
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    # ... rest of configuration
}
```

## Troubleshooting

### Common Issues

1. **502 Bad Gateway**

   - Check if backend services are running
   - Verify service names in upstream configuration
   - Check service health status

2. **Rate Limiting Issues**

   - Review rate limiting configuration
   - Check if client IP is being properly detected
   - Adjust rate limits if needed

3. **WebSocket Connection Issues**
   - Verify WebSocket proxy configuration
   - Check if backend supports WebSocket upgrades
   - Review timeout settings

### Debug Commands

```bash
# Check nginx configuration
docker-compose exec nginx nginx -t

# View nginx error logs
docker-compose exec nginx tail -f /var/log/nginx/error.log

# Test health endpoint
curl http://localhost:8080/health
```
