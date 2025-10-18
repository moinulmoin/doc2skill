# 🎯 Skill Seekers Web

Simple web UI on top of the [Skill Seekers](https://github.com/yusufkaraaslan/Skill_Seekers) CLI tool.

## Features

- ✅ **Zero-friction UI**: Click preset or enter URL
- ✅ **Skills Gallery**: See all generated skills  
- ✅ **Direct Download**: One-click download
- ✅ **Persistence**: All skills saved in `./output/`
- ✅ **Modern Stack**: Next.js + FastAPI + Docker

## Quick Start

### Option 1: Docker (Recommended)

```bash
# One command - starts everything!
./docker-start.sh

# Or manually
docker-compose up -d --build
```

Then open: **http://localhost:3000**

### Option 2: Local Development

```bash
# Backend (with uv)
cd backend
../.venv/bin/uvicorn app:app --reload

# Frontend (with npm)
cd frontend
npm run dev
```

## Architecture

```
┌──────────────────────────────────────┐
│     Frontend (Next.js + TypeScript)  │
│            Port 3000                 │
└────────────┬─────────────────────────┘
             │ HTTP
             ▼
┌──────────────────────────────────────┐
│      Backend (FastAPI + uv)          │
│            Port 8000                 │
└────────────┬─────────────────────────┘
             │ subprocess.run()
             ▼
┌──────────────────────────────────────┐
│  Original CLI Tools (unchanged!)     │
│  • doc_scraper.py                    │
│  • enhance_skill.py                  │
│  • package_skill.py                  │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│         ./output/                    │
│    (Persisted Volume)                │
│    skill1.zip, skill2.zip...         │
└──────────────────────────────────────┘
```

## How It Works

1. User fills form → Clicks "Create Skill"
2. Backend API receives request
3. Backend calls `doc_scraper.py` (existing CLI tool)
4. Scraper scrapes docs (15-30 minutes)
5. Backend calls `package_skill.py` (existing CLI tool)
6. Skill appears in gallery
7. User downloads `.zip` file

**Key Insight**: This is just a thin web wrapper. The original CLI tools do all the heavy lifting!

## Tech Stack

### Backend
- **FastAPI**: Modern Python web framework
- **uv**: Fast Python package manager
- **Python 3.11**: Latest stable Python

### Frontend  
- **Next.js 15**: React framework with SSR
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS

### Infrastructure
- **Docker**: Containerization
- **Volume Mounts**: Persistence

## API Endpoints

```
GET  /                      - Health check
POST /api/create-skill      - Create new skill
GET  /api/jobs/{job_id}     - Get job status
GET  /api/download/{name}   - Download skill
GET  /api/presets           - List presets
GET  /api/skills            - List all skills
```

## Persistence

All generated skills are stored in `./output/` directory:

```bash
./output/
├── react.zip      # Generated skills
├── vue.zip
├── godot.zip
└── react_data/    # Scraped data (cached)
```

This directory is:
- ✅ Mounted as Docker volume (persists across restarts)
- ✅ Accessible on host machine  
- ✅ Shareable between containers
- ✅ Backed up with your code

## Commands

### Docker

```bash
# Start
./docker-start.sh

# View logs
docker-compose logs -f

# Stop
docker-compose down

# Rebuild
docker-compose up --build -d

# Remove everything (including volumes)
docker-compose down -v
```

### Local

```bash
# Start backend
cd backend && ../.venv/bin/uvicorn app:app --reload

# Start frontend
cd frontend && npm run dev

# Install dependencies
uv venv && uv pip install -r backend/requirements.txt
cd frontend && npm install
```

## Configuration

### Environment Variables

Create `.env` or `.env.local`:

```env
# Backend
PYTHONUNBUFFERED=1

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Presets

All presets from `configs/` directory are automatically loaded:
- react.json
- vue.json
- godot.json
- django.json
- fastapi.json
- etc.

## Deployment

### Production with Docker

```bash
# 1. Update API URL in docker-compose.yml
NEXT_PUBLIC_API_URL=https://api.yourdomain.com

# 2. Deploy
docker-compose -f docker-compose.yml up -d

# 3. Optional: Add nginx reverse proxy
```

### Deploy Separately

**Backend** (FastAPI):
- Deploy to Railway, Render, Fly.io, etc.
- Expose port 8000

**Frontend** (Next.js):
- Deploy to Vercel, Netlify, etc.
- Set `NEXT_PUBLIC_API_URL` to backend URL

## Troubleshooting

### Skills not saving?
```bash
# Check output directory permissions
ls -la ./output

# Check Docker volume
docker-compose exec backend ls -la /output
```

### Backend can't find CLI scripts?
```bash
# Verify mounts
docker-compose exec backend ls -la /

# Should see: doc_scraper.py, enhance_skill.py, package_skill.py
```

### Frontend can't reach backend?
```bash
# Check if backend is running
curl http://localhost:8000

# Check Docker network
docker-compose exec frontend ping backend
```

### Build fails?
```bash
# Clear Docker cache
docker-compose down
docker system prune -a
docker-compose up --build
```

## Performance

### First Run
- Docker build: ~2-3 minutes
- Skill generation: 15-30 minutes (depends on docs size)

### Subsequent Runs
- Docker start: ~10 seconds
- Skill generation: Same (15-30 min)

### Resource Usage
- Backend: ~500MB RAM
- Frontend: ~200MB RAM
- Disk: ~100-500KB per skill

## Security Notes

For production:
1. ❌ Don't expose backend port publicly
2. ✅ Use environment secrets (not .env files)
3. ✅ Add rate limiting
4. ✅ Enable HTTPS
5. ✅ Regular security updates
6. ✅ Input validation

## Credits

Built on top of [Skill Seekers](https://github.com/yusufkaraaslan/Skill_Seekers) by Yusuf Karaaslan.

Web UI by Moinul Moin ([@moinulmoin](https://github.com/moinulmoin)).

## License

MIT License - Same as original Skill Seekers

---

## Summary

✅ **Simple**: Just a web wrapper, CLI does the work
✅ **Fast**: Modern tools (uv, Next.js 15)
✅ **Persistent**: Skills saved in `./output/`
✅ **Production-ready**: Docker + standalone builds
✅ **Zero-friction**: No auth, no signup, just use it

🚀 **Get started**: `./docker-start.sh`
