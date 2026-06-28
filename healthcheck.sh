#!/bin/sh
# healthcheck.sh
# Simple healthcheck script for Node.js services

PORT=${PORT:-3000}
URL="http://localhost:${PORT}/api/health"

# Test the health endpoint
curl -f -s "$URL" || exit 1
