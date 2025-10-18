# 🚀 Deploy to Dokploy.com

Quick guide to deploy Skill Seekers Web on [dokploy.com](https://dokploy.com).

## Prerequisites

1. ✅ Dokploy account
2. ✅ GitHub repo connected
3. ✅ This repository pushed to GitHub

## Deployment Steps

### 1. Connect Repository

In Dokploy dashboard:
1. Click "New Project"
2. Select "Docker Compose"
3. Connect your GitHub repo: `moinulmoin/doc2skill`
4. Branch: `main` (or your branch)

### 2. Configure Build

Set these in Dokploy:

**Docker Compose File**: `docker-compose.prod.yml`

**Environment Variables**:
```env
NEXT_PUBLIC_API_URL=https://your-dokploy-domain.com
PYTHONUNBUFFERED=1
NODE_ENV=production

# Anthropic API (Required for AI Enhancement)
ANTHROPIC_API_KEY=sk-ant-your-api-key-here
ANTHROPIC_BASE_URL=https://api.anthropic.com
ANTHROPIC_TIMEOUT_MS=3000000
```

### 3. Port Configuration

**Backend**:
- Container Port: `8000`
- Public Port: `8000` (or let Dokploy assign)

**Frontend**:
- Container Port: `3000`  
- Public Port: `80` or `443` (with SSL)

### 4. Deploy

Click "Deploy" button in Dokploy dashboard.

Wait 3-5 minutes for build to complete.

### 5. Access Your App

Your app will be available at:
```
https://your-dokploy-subdomain.dokploy.com
```

## Persistence

Dokploy automatically handles the `output_data` volume for generated skills.

**Skills will persist** across redeployments! ✅

## Alternative: Simple Dockerfile (Single Container)

If you want to deploy as a single container instead of docker-compose:

### Create `Dockerfile.all`

```dockerfile
FROM python:3.11-slim as backend

WORKDIR /app

# Install dependencies
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Copy CLI scripts
COPY doc_scraper.py /doc_scraper.py
COPY enhance_skill.py /enhance_skill.py
COPY package_skill.py /package_skill.py
COPY configs /configs

# Install backend
COPY backend/requirements.txt .
RUN uv pip install --system -r requirements.txt
COPY backend/app.py .
RUN mkdir -p /output

# Install Node for frontend
FROM node:20-alpine

WORKDIR /app

# Copy backend from previous stage
COPY --from=backend / /

# Build frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend .
RUN npm run build

# Install supervisor to run both services
RUN apk add --no-cache supervisor

# Supervisor config
RUN echo '[supervisord]' > /etc/supervisord.conf && \
    echo 'nodaemon=true' >> /etc/supervisord.conf && \
    echo '[program:backend]' >> /etc/supervisord.conf && \
    echo 'command=uvicorn app:app --host 0.0.0.0 --port 8000' >> /etc/supervisord.conf && \
    echo '[program:frontend]' >> /etc/supervisord.conf && \
    echo 'command=node server.js' >> /etc/supervisord.conf

EXPOSE 3000 8000

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
```

Then in Dokploy:
- Use single Dockerfile instead of docker-compose
- Expose port 3000 (frontend) and 8000 (backend)

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | ✅ | `http://localhost:8000` | Backend API URL |
| `PYTHONUNBUFFERED` | ❌ | `1` | Python output buffering |
| `NODE_ENV` | ❌ | `production` | Node environment |

## Custom Domain

In Dokploy:
1. Go to Settings → Domains
2. Add your custom domain
3. Update `NEXT_PUBLIC_API_URL` to your domain
4. Redeploy

## Health Checks

Both services have health checks configured:

**Backend**: `GET http://backend:8000/`
**Frontend**: Automatic (Next.js)

Dokploy will automatically restart unhealthy containers.

## Logs

View logs in Dokploy dashboard:
- Click on your project
- Go to "Logs" tab
- Select service (backend or frontend)

## Scaling

To handle more traffic:

1. In Dokploy dashboard
2. Go to "Scale" section
3. Increase replicas for backend

```yaml
deploy:
  replicas: 3  # Run 3 backend instances
```

## Storage

Generated skills are stored in Docker volume:
- Volume name: `output_data`
- Mount point: `/output`
- Persists across deployments: ✅

## Troubleshooting

### Build fails?

Check Dokploy build logs for errors. Common issues:
- Missing environment variables
- Incorrect docker-compose path
- GitHub connection issues

### Backend can't find CLI scripts?

Verify in Dockerfile:
```dockerfile
COPY doc_scraper.py /doc_scraper.py
COPY package_skill.py /package_skill.py
```

### Frontend can't reach backend?

Update `NEXT_PUBLIC_API_URL` to correct backend URL.

### Skills not persisting?

Check volume configuration in Dokploy:
```yaml
volumes:
  output_data:
    driver: local
```

## Cost Estimate

Dokploy pricing (approximate):
- Small instance: ~$5-10/month
- Medium instance: ~$20/month
- Large instance: ~$50/month

Sufficient for:
- 10-50 concurrent users
- 100+ skills generated/month

## Monitoring

Add monitoring in Dokploy:
1. Enable metrics
2. Set up alerts for:
   - High CPU usage
   - High memory usage
   - Service down

## Backup

Backup generated skills:

```bash
# From Dokploy console
docker cp <container>:/output ./backup
```

Or use Dokploy's backup feature.

## Summary

✅ **Simple deployment**: Connect GitHub → Deploy
✅ **Persistence**: Skills saved in Docker volume
✅ **Health checks**: Auto-restart on failure
✅ **Scalable**: Easy to add more replicas
✅ **Logs**: Real-time in dashboard

🚀 **Deploy time**: 5-10 minutes
💰 **Cost**: Starting at $5/month

---

## Quick Commands

```bash
# Push to GitHub
git add .
git commit -m "Ready for dokploy deployment"
git push origin main

# In Dokploy: Click "Deploy"
```

That's it! 🎯
