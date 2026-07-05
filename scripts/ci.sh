#!/bin/bash
set -e

echo "=== Building and starting all services ==="
docker compose -f docker-compose.yml up -d --build

echo "=== Waiting for services to be healthy ==="
echo "Waiting for API Gateway..."
until docker compose exec -T api-gateway wget --spider -q http://localhost:3000/api/health 2>/dev/null; do
  echo "  API Gateway not ready yet..."
  sleep 5
done
echo "  API Gateway is healthy!"

echo "=== Cleaning up ==="
docker compose down
