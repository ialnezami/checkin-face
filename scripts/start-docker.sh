#!/bin/bash

# Start Docker Compose
cd "$(dirname "$0")/../docker" || exit

echo "Starting Employee Check-In System with Docker..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Error: Docker is not running. Please start Docker and try again."
    exit 1
fi

# Start services
docker-compose up --build

