# ✅ Deployment Checklist

## Pre-Deployment

- [ ] All code committed and pushed to GitHub
- [ ] `docker-compose.prod.yml` exists
- [ ] Backend `Dockerfile` updated with CLI scripts
- [ ] Frontend `Dockerfile` configured for standalone build
- [ ] `.env.example` created

## Dokploy Setup

- [ ] Dokploy account created
- [ ] GitHub repository connected to Dokploy
- [ ] Project created in Dokploy dashboard

## Configuration

- [ ] Docker Compose file: `docker-compose.prod.yml`
- [ ] Environment variable set: `NEXT_PUBLIC_API_URL`
- [ ] Backend port: `8000` configured
- [ ] Frontend port: `3000` configured
- [ ] Volume `output_data` configured

## First Deploy

- [ ] Click "Deploy" in Dokploy
- [ ] Wait for build to complete (~5 min)
- [ ] Check build logs for errors
- [ ] Access frontend URL
- [ ] Test creating a skill
- [ ] Verify download works

## Post-Deployment

- [ ] Custom domain configured (optional)
- [ ] SSL certificate working
- [ ] Health checks passing
- [ ] Logs accessible in dashboard
- [ ] Skills persisting in volume

## Testing

- [ ] Frontend loads correctly
- [ ] Backend API responding
- [ ] Presets loading
- [ ] Create skill form works
- [ ] Job status updates
- [ ] Download skill works
- [ ] Gallery shows generated skills
- [ ] Skills persist after restart

## Production Ready

- [ ] Monitoring enabled
- [ ] Alerts configured
- [ ] Backup strategy in place
- [ ] Documentation updated
- [ ] Team has access

## Quick Test Commands

```bash
# Test backend
curl https://your-domain.com/api/presets

# Test frontend
curl https://your-domain.com

# Check health
curl https://your-domain.com/
```

## Rollback Plan

If deployment fails:
1. Check Dokploy logs
2. Revert to previous deployment
3. Fix issues locally
4. Redeploy

## Success Criteria

✅ Frontend accessible at public URL
✅ Backend responding to API requests  
✅ Skills can be created and downloaded
✅ Skills persist across restarts
✅ No errors in logs

---

**Estimated deployment time**: 10-15 minutes
**Minimum instance**: Small (512MB RAM, 1 CPU)
