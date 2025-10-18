# 🐳 Docker Deployment

## Quick Start

```bash
# Build and run everything
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

Then open: **http://localhost:3000**

## Architecture

```
┌─────────────┐      ┌─────────────┐
│  Frontend   │─────▶│   Backend   │
│  (Next.js)  │      │  (FastAPI)  │
│  Port 3000  │      │  Port 8000  │
└─────────────┘      └──────┬──────┘
                            │
                            ▼
                     ┌─────────────┐
                     │   Volume    │
                     │  ./output/  │
                     │  (Persisted)│
                     └─────────────┘
```

## Persistence

Generated skills are stored in `./output/` directory which is mounted as a volume.

**This means:**
- ✅ Skills persist across container restarts
- ✅ You can access files directly on host
- ✅ Multiple containers can share the same output

## Services

### Backend (FastAPI)
- **Port**: 8000
- **Tech**: Python 3.11 + uv + FastAPI
- **Mounts**: CLI scripts, configs, output directory

### Frontend (Next.js)
- **Port**: 3000
- **Tech**: Next.js 15 + React + TypeScript
- **Build**: Standalone output for production

## Commands

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild after code changes
docker-compose up --build

# Remove volumes (deletes generated skills!)
docker-compose down -v
```

## Environment Variables

Create `.env` file:

```env
# Backend
PYTHONUNBUFFERED=1

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Production Deployment

### 1. Update API URL

```bash
# In docker-compose.yml, change:
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

### 2. Add Reverse Proxy (Optional)

Use nginx to serve both frontend and backend on same domain:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://frontend:3000;
    }

    location /api {
        proxy_pass http://backend:8000;
    }
}
```

### 3. Scale (Optional)

```bash
# Run multiple backend workers
docker-compose up --scale backend=3
```

## Volumes Explained

### `./output` (Persisted)
- All generated skill files (.zip)
- Persists across restarts
- Can be backed up easily

### CLI Scripts (Read-only mounts)
- `doc_scraper.py`
- `enhance_skill.py`
- `package_skill.py`
- `configs/`

These are mounted read-only so the container uses the exact CLI tools.

## Troubleshooting

### Skills not persisting?
Check volume mount:
```bash
docker-compose exec backend ls -la /output
```

### Backend can't find CLI scripts?
Check mounts:
```bash
docker-compose exec backend ls -la /
```

### Frontend can't reach backend?
Check network:
```bash
docker-compose exec frontend ping backend
```

## Performance

### Build Time
- Backend: ~30 seconds
- Frontend: ~2 minutes
- Total: ~2.5 minutes

### Runtime
- Memory: ~500MB (backend) + ~200MB (frontend)
- CPU: Varies based on scraping jobs

## Advanced

### Add Redis for Job Persistence

Add to `docker-compose.yml`:

```yaml
services:
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data

  backend:
    environment:
      - REDIS_URL=redis://redis:6379/0

volumes:
  redis-data:
```

Then update `backend/app.py` to use Redis instead of in-memory dict.

### Add Monitoring

Add to `docker-compose.yml`:

```yaml
services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
```

## Security

For production:
1. Don't expose backend port publicly
2. Use environment secrets (not .env files)
3. Add rate limiting
4. Enable HTTPS
5. Regular security updates

## Summary

✅ **One command**: `docker-compose up -d`
✅ **Persisted data**: Skills saved in `./output/`
✅ **Production-ready**: Standalone builds
✅ **Easy scaling**: Add more backend workers

🚀 That's it! Simple and powerful.
