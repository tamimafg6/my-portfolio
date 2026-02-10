#!/bin/sh
# Startup: start server first so health checks pass, then run DB setup in background.
# This avoids the container being killed when the DB is slow to accept connections.

echo "🚀 Starting auth-service..."

# Step 1: Start the service in background immediately (so readiness probe passes)
echo "🔧 Starting auth-service..."
npm start &
NPM_PID=$!

# Step 2: Wait for server to listen (so platform health checks succeed)
echo "⏳ Waiting for server to be ready..."
max_attempts=60
attempt=0
while [ $attempt -lt $max_attempts ]; do
  if wget --no-verbose --tries=1 --spider http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "✅ Auth-service is ready!"
    break
  fi
  attempt=$((attempt + 1))
  if [ $((attempt % 10)) -eq 0 ]; then
    echo "   Still waiting... ($attempt/$max_attempts)"
  fi
  sleep 1
done

if [ $attempt -eq $max_attempts ]; then
  echo "⚠️  Server did not become ready in time."
fi

# Step 3: Run DB setup in background (don't block; auth may 500 until DB is ready)
echo "📊 Setting up database in background..."
( ./scripts/setup-db.sh && echo "✅ Database setup done." || echo "⚠️  Database setup had errors." ) &

# Step 4: Seed users after a short delay (give DB setup a head start)
sleep 15
echo "🌱 Seeding users..."
./scripts/seed-users.sh
if [ $? -ne 0 ]; then
  echo "⚠️  User seeding failed. Create users via signup or run create-admin-user.js."
fi

echo "🔧 Auth-service is running (DB setup may still be in progress)."

# Keep container alive
wait $NPM_PID

