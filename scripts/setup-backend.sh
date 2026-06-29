#!/usr/bin/env bash
# Apply user-service schema and seed demo data (run with backend services up)
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "📦 Applying user-service Prisma migrations..."
cd "$ROOT/backend/user-service"
if ! npx prisma migrate deploy 2>/dev/null; then
  echo "   Baselines existing database and retries..."
  npx prisma migrate resolve --applied 20260101000000_init
  npx prisma migrate deploy
fi

echo ""
echo "🌱 Seeding demo data..."
cd "$ROOT"
./scripts/seed.sh

echo ""
echo "✅ Backend setup complete."
echo "   Restart user-service + api-gateway if they were already running."
echo "   Admin: admin@meridian.com / admin123"
