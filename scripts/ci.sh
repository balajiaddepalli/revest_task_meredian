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

echo "=== Running Docker Compose E2E tests ==="
cd e2e
npx playwright test tests/docker-compose.spec.ts --reporter=list
TEST_EXIT_CODE=$?

echo "=== Cleaning up ==="
cd ..
docker compose down

if [ $TEST_EXIT_CODE -ne 0 ]; then
  echo "=== Tests FAILED with exit code $TEST_EXIT_CODE ==="
  exit $TEST_EXIT_CODE
fi

echo "=== All tests PASSED ==="
