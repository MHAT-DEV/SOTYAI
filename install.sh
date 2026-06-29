#!/bin/bash
# SOTYAI HAKP Network - One-Click Installer
# This script installs and configures the SOTYAI Network using Docker Compose.

set -e

echo "============================================================"
echo "    SOTYAI Human-AI Knowledge Platform (HAKP) Network       "
echo "               One-Click Installation Script                "
echo "============================================================"
echo ""

# 1. Check Docker & Docker Compose
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed. Please install Docker first."
    exit 1
fi

if ! docker compose version &> /dev/null; then
    echo "❌ Error: Docker Compose (V2) is not installed. Please install it."
    exit 1
fi
echo "✅ Docker and Docker Compose are installed."

# 2. Check Port Availability function
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 1 # Port in use
    else
        return 0 # Port available
    fi
}

echo "🔍 Checking port availability..."
HTTP_PORT=80
HTTPS_PORT=443

if ! check_port $HTTP_PORT; then
    echo "⚠️  Warning: Port $HTTP_PORT is already in use (possibly by an existing Nginx or Apache server)."
    HTTP_PORT=8080
    echo "🔄 Falling back to alternative HTTP port: $HTTP_PORT"
    while ! check_port $HTTP_PORT; do
        HTTP_PORT=$((HTTP_PORT + 1))
        echo "🔄 Falling back to alternative HTTP port: $HTTP_PORT"
    done
fi

if ! check_port $HTTPS_PORT; then
    echo "⚠️  Warning: Port $HTTPS_PORT is already in use."
    HTTPS_PORT=8443
    echo "🔄 Falling back to alternative HTTPS port: $HTTPS_PORT"
    while ! check_port $HTTPS_PORT; do
        HTTPS_PORT=$((HTTPS_PORT + 1))
        echo "🔄 Falling back to alternative HTTPS port: $HTTPS_PORT"
    done
fi

echo "✅ Using HTTP Port: $HTTP_PORT"
echo "✅ Using HTTPS Port: $HTTPS_PORT"

# 3. Setup Environment Variables
echo "⚙️  Setting up environment configuration..."
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ Created .env from .env.example"
        echo "⚠️  Please remember to update the secrets and API keys in the .env file later."
    else
        echo "❌ Error: .env.example not found!"
        exit 1
    fi
else
    echo "ℹ️  .env file already exists. Skipping creation."
fi

# Append or update ports in .env
if grep -q "HTTP_PORT=" .env; then
    sed -i "s/^HTTP_PORT=.*/HTTP_PORT=$HTTP_PORT/" .env
else
    echo "HTTP_PORT=$HTTP_PORT" >> .env
fi

if grep -q "HTTPS_PORT=" .env; then
    sed -i "s/^HTTPS_PORT=.*/HTTPS_PORT=$HTTPS_PORT/" .env
else
    echo "HTTPS_PORT=$HTTPS_PORT" >> .env
fi

echo "ℹ️  Exporting ports so Docker Compose can use them if configured..."
export HTTP_PORT=$HTTP_PORT
export HTTPS_PORT=$HTTPS_PORT

# 4. Starting the containers
echo "🚀 Starting SOTYAI Network containers via Docker Compose..."
# Use docker-compose if needed
if [ -f docker-compose.prod.yml ]; then
    docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
else
    docker compose up -d --build
fi

echo ""
echo "============================================================"
echo "✅ Installation Complete!"
echo "============================================================"
echo "Your SOTYAI HAKP Network is starting up in the background."
echo "To view logs: docker compose logs -f"
echo "To stop: docker compose down"
echo "Please update .env with your actual Gemini API Key and other production secrets."
