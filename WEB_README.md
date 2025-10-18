# 🎯 Skill Seekers Web

Simple web UI on top of the Skill Seekers CLI tool.

## Features

- ✅ **Create Skills**: Web form with preset configurations
- ✅ **Gallery View**: See all generated skills
- ✅ **Direct Download**: Download any generated skill
- ✅ **Modern Stack**: Next.js + FastAPI + uv

## Quick Start

### 1. Install Dependencies

```bash
# Backend (using uv - modern Python package manager)
uv venv
uv pip install fastapi uvicorn pydantic requests beautifulsoup4

# Frontend (Next.js)
cd frontend && npm install
```

### 2. Start Services

```bash
# Easy way - use start script
./start.sh

# OR manually:

# Terminal 1 - Backend
cd backend
../.venv/bin/uvicorn app:app --reload

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### 3. Open Browser

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000

## How It Works

The web UI is just a thin wrapper that calls the existing CLI tools:

```
User submits form → API calls doc_scraper.py → Scrapes docs → 
Packages skill → Shows in gallery → User downloads
```

## Architecture

```
doc2skill/
├── doc_scraper.py          # Original CLI (unchanged)
├── enhance_skill.py        # Original CLI (unchanged)
├── package_skill.py        # Original CLI (unchanged)
├── configs/                # Original presets
├── backend/
│   └── app.py             # Thin FastAPI wrapper
└── frontend/              # Next.js UI
    └── app/page.tsx       # Gallery + Create form
```

## Tech Stack

- **Backend**: FastAPI + uv (modern Python)
- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **Original Tool**: Python CLI scripts (unchanged)

## API Endpoints

- `POST /api/create-skill` - Create new skill
- `GET /api/jobs/{job_id}` - Get job status
- `GET /api/download/{name}` - Download skill
- `GET /api/presets` - List available presets
- `GET /api/skills` - List all generated skills

## Deploy

### Docker (coming soon)

```bash
docker-compose up -d
```

### Manual Deploy

1. Deploy backend (FastAPI) to any Python hosting
2. Deploy frontend (Next.js) to Vercel/Netlify
3. Set `NEXT_PUBLIC_API_URL` environment variable

## Credits

Built on top of [Skill Seekers](https://github.com/yusufkaraaslan/Skill_Seekers) by Yusuf Karaaslan.
