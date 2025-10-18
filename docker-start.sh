#!/bin/bash

echo "🐳 Starting Skill Seekers with Docker..."
echo ""

# Check if docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running"
    echo "Please start Docker Desktop and try again"
    exit 1
fi

# Build and start
echo "Building containers (this may take a few minutes)..."
docker-compose up --build -d

# Wait for services to be ready
echo ""
echo "Waiting for services to start..."
sleep 5

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo ""
    echo "✅ Services started successfully!"
    echo ""
    echo "📱 Frontend: http://localhost:3000"
    echo "🔌 Backend:  http://localhost:8000"
    echo "📂 Output:   ./output/"
    echo ""
    echo "View logs: docker-compose logs -f"
    echo "Stop:      docker-compose down"
else
    echo ""
    echo "❌ Error: Services failed to start"
    echo "Check logs: docker-compose logs"
fi
