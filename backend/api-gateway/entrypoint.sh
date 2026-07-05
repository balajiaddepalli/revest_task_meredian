#!/bin/sh
set -e

echo "🚀 Starting API Gateway..."
node dist/main &
PID=$!

echo "⏳ Waiting for API Gateway to be healthy..."
until wget --no-verbose --tries=1 --spider http://localhost:3000/api/health 2>/dev/null; do
  sleep 2
done
echo "✅ API Gateway is healthy"

echo "🌱 Running seed script..."
sh /app/seed.sh

echo "🎉 Ready!"
wait $PID
