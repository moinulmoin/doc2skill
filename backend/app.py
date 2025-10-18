#!/usr/bin/env python3
"""
Simple FastAPI wrapper for Skill Seekers CLI tool.
Just calls the existing Python scripts - no reimplementation needed!
"""

from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import subprocess
import uuid
import json
import os
from pathlib import Path
from typing import Optional

app = FastAPI(title="Skill Seekers API")

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory job tracking (simple!)
# For production, consider using Redis or a database
jobs = {}

# Ensure output directory exists
os.makedirs("../output", exist_ok=True)

class SkillRequest(BaseModel):
    url: str
    name: str
    description: Optional[str] = None
    enhance: bool = True
    config: Optional[dict] = None

class JobStatus(BaseModel):
    job_id: str
    status: str  # "processing", "completed", "failed"
    progress: int
    message: str
    download_url: Optional[str] = None
    error: Optional[str] = None


@app.get("/")
async def root():
    return {"message": "Skill Seekers API", "version": "1.0.0"}


@app.post("/api/create-skill")
async def create_skill(request: SkillRequest, background_tasks: BackgroundTasks):
    """Create a new skill from documentation URL"""
    job_id = str(uuid.uuid4())
    
    jobs[job_id] = {
        "status": "processing",
        "progress": 0,
        "message": "Starting scraper...",
        "download_url": None,
        "error": None
    }
    
    # Run the existing CLI tool in background
    background_tasks.add_task(
        run_scraper,
        job_id=job_id,
        url=request.url,
        name=request.name,
        description=request.description,
        enhance=request.enhance,
        config=request.config
    )
    
    return {"job_id": job_id, "status": "processing"}


def run_scraper(job_id: str, url: str, name: str, description: Optional[str], enhance: bool, config: Optional[dict]):
    """Run the existing doc_scraper.py script"""
    try:
        jobs[job_id]["message"] = "Scraping documentation..."
        jobs[job_id]["progress"] = 10
        
        # Build command
        cmd = ["python3", "../doc_scraper.py"]
        
        if config:
            # Save config temporarily
            config_path = f"/tmp/{name}_config.json"
            with open(config_path, 'w') as f:
                json.dump(config, f)
            cmd.extend(["--config", config_path])
        else:
            cmd.extend([
                "--url", url,
                "--name", name
            ])
            if description:
                cmd.extend(["--description", description])
        
        if enhance:
            # Use API-based enhancement for web (not local)
            cmd.append("--enhance")
        
        # Set environment variables for enhancement
        env = os.environ.copy()
        if enhance:
            # Pass Anthropic API credentials from environment
            anthropic_api_key = os.environ.get('ANTHROPIC_API_KEY')
            anthropic_base_url = os.environ.get('ANTHROPIC_BASE_URL', 'https://api.anthropic.com')
            
            if anthropic_api_key:
                env['ANTHROPIC_API_KEY'] = anthropic_api_key
            if anthropic_base_url:
                env['ANTHROPIC_BASE_URL'] = anthropic_base_url
            
            # Set timeout for Anthropic API calls
            env['ANTHROPIC_TIMEOUT_MS'] = os.environ.get('ANTHROPIC_TIMEOUT_MS', '3000000')
        
        # Run scraper
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            cwd="..",  # Run from parent directory
            timeout=3600,  # 1 hour max
            env=env
        )
        
        if result.returncode != 0:
            raise Exception(f"Scraper failed: {result.stderr}")
        
        jobs[job_id]["progress"] = 70
        jobs[job_id]["message"] = "Packaging skill..."
        
        # Package the skill
        package_result = subprocess.run(
            ["python3", "../package_skill.py", f"../output/{name}/"],
            capture_output=True,
            text=True,
            cwd="..",
            timeout=300
        )
        
        if package_result.returncode != 0:
            raise Exception(f"Packaging failed: {package_result.stderr}")
        
        # Check if file exists
        zip_path = f"../output/{name}.zip"
        if not os.path.exists(zip_path):
            raise Exception("Skill file not created")
        
        jobs[job_id]["status"] = "completed"
        jobs[job_id]["progress"] = 100
        jobs[job_id]["message"] = "Skill created successfully!"
        jobs[job_id]["download_url"] = f"/api/download/{name}"
        
    except subprocess.TimeoutExpired:
        jobs[job_id]["status"] = "failed"
        jobs[job_id]["error"] = "Scraping took too long (timeout)"
    except Exception as e:
        jobs[job_id]["status"] = "failed"
        jobs[job_id]["error"] = str(e)


@app.get("/api/jobs/{job_id}")
async def get_job(job_id: str):
    """Get job status"""
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return jobs[job_id]


@app.get("/api/download/{name}")
async def download_skill(name: str):
    """Download completed skill"""
    file_path = f"../output/{name}.zip"
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Skill file not found")
    
    return FileResponse(
        file_path,
        media_type="application/zip",
        filename=f"{name}.zip"
    )


@app.get("/api/presets")
async def get_presets():
    """Get available config presets"""
    presets = {}
    configs_dir = Path("../configs")
    
    if configs_dir.exists():
        for config_file in configs_dir.glob("*.json"):
            try:
                with open(config_file, 'r') as f:
                    preset_name = config_file.stem
                    presets[preset_name] = json.load(f)
            except:
                continue
    
    return {"presets": presets}


@app.get("/api/skills")
async def list_skills():
    """List all generated skills"""
    output_dir = Path("../output")
    skills = []
    
    if output_dir.exists():
        for zip_file in output_dir.glob("*.zip"):
            skills.append({
                "name": zip_file.stem,
                "size": zip_file.stat().st_size,
                "created": zip_file.stat().st_mtime,
                "download_url": f"/api/download/{zip_file.stem}"
            })
    
    return {"skills": sorted(skills, key=lambda x: x['created'], reverse=True)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
