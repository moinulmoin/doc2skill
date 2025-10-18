# 🚀 Quick Start - Web Version

## 1. Start the App (One Command)

```bash
./start.sh
```

Then open: **http://localhost:3000**

## 2. Create Your First Skill

1. Click a preset (e.g., "react") OR enter custom URL
2. Click "Create Skill"
3. Wait 15-30 minutes for scraping
4. Download your skill.zip

## 3. View Generated Skills

All generated skills appear in the gallery below the create form.

## That's It! 🎯

The web UI is just calling the existing CLI tools underneath.

---

## Manual Start (if script doesn't work)

**Terminal 1 - Backend:**
```bash
cd backend
../.venv/bin/uvicorn app:app --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend  
npm run dev
```

Then open: http://localhost:3000
