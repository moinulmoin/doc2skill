FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Copy CLI scripts
COPY doc_scraper.py /doc_scraper.py
COPY enhance_skill.py /enhance_skill.py
COPY enhance_skill_local.py /enhance_skill_local.py
COPY package_skill.py /package_skill.py
COPY configs /configs

# Install Python dependencies
COPY backend/requirements.txt .
RUN uv pip install --system -r requirements.txt

# Copy application code
COPY backend/app.py .

# Create output directory
RUN mkdir -p /output

EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8000/ || exit 1

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers"]
