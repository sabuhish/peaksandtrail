# Production Deployment Guide

## Overview
This application is production-ready and designed to run behind a global nginx reverse proxy on your server.

## Architecture
- **Frontend**: Built React app served on port 5173
- **Backend**: FastAPI with Gunicorn on port 8000
- **Database**: PostgreSQL on port 5432
- **Global Nginx**: Reverse proxy on your server (handles SSL, routing)

## Build and Deploy

### 1. Configure Environment Variables
Ensure you have a `.env` file in the project root with production values:
```bash
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-secure-password
POSTGRES_DB=tourmanagement

DB_USER=postgres
DB_PASSWORD=your-secure-password
DB_HOST=db
DB_PORT=5432
DB_NAME=tourmanagement

# Security
SECRET_KEY=your-production-secret-key-min-32-chars
ALGORITHM=HS256

# Frontend API URL
VITE_API_URL=http://your-domain.com:8000
```

### 2. Build and Start Services
```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

### 3. Configure Global Nginx Reverse Proxy

On your server, add this configuration to nginx:

```nginx
# /etc/nginx/sites-available/peakstrail

server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/peakstrail /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. SSL Configuration (Optional but Recommended)

Using Let's Encrypt:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Management Commands

```bash
# Stop services
docker-compose down

# Stop and remove volumes (WARNING: deletes database data)
docker-compose down -v

# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db

# Restart a service
docker-compose restart backend

# Rebuild after code changes
docker-compose up -d --build
```

## Port Configuration for Multiple Apps

To run multiple apps on the same server:

1. Change ports in `docker-compose.yml`:
```yaml
services:
  backend:
    ports:
      - "8001:8000"  # External:Internal
  frontend:
    ports:
      - "5174:5173"
```

2. Update nginx config to proxy to new ports
3. Each app gets its own subdomain or path

## Health Checks

- Frontend: http://localhost:5173
- Backend: http://localhost:8000/docs (Swagger UI)
- Database: `docker exec -it tour_management_db psql -U postgres -d tourmanagement`

## Troubleshooting

**Frontend not loading:**
- Check if container is running: `docker-compose ps`
- Check logs: `docker-compose logs frontend`
- Verify build completed: Look for "dist" folder in build logs

**Backend API errors:**
- Check database connection: `docker-compose logs db`
- Verify migrations ran: `docker-compose logs backend | grep alembic`
- Check environment variables are set correctly

**Database connection issues:**
- Ensure DB_HOST=db (service name in docker-compose)
- Wait for healthcheck to pass: `docker-compose ps db`
