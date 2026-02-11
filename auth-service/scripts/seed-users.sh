#!/bin/sh
# Seed test users using Better Auth's signup API
# This ensures passwords are properly hashed
#
# Admin user is created from ADMIN_EMAIL and ADMIN_PASSWORD (set in .env / app env, never commit).
# Optional test users (customer, teambuyer) are seeded when enabled (including in production).

echo "🌱 Seeding test users..."

# Use DATABASE_URL when set (e.g. Digital Ocean); otherwise use individual vars (e.g. docker-compose with host auth-db)
if [ -n "$DATABASE_URL" ]; then
  DB_CONNECTION="$DATABASE_URL"
  echo "Database configuration: Using DATABASE_URL"
else
  DB_HOST="${POSTGRES_HOST:-auth-db}"
  DB_USER="${POSTGRES_USER:-postgres}"
  DB_NAME="${POSTGRES_DB:-auth}"
  DB_PASSWORD="${POSTGRES_PASSWORD:-password}"
  DB_CONNECTION="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:5432/${DB_NAME}"
  echo "Database configuration:"
  echo "   DB_HOST=$DB_HOST"
  echo "   DB_USER=$DB_USER"
  echo "   DB_NAME=$DB_NAME"
  echo "   DB_PASSWORD is set: $([ -n "${DB_PASSWORD}" ] && echo "yes" || echo "no")"
fi

# Wait for auth-service to be ready
# Try localhost first (when running in same container), then try service name (when running separately)
echo "Waiting for auth-service to be ready..."
max_attempts=60
attempt=0
AUTH_URL=""
while [ $attempt -lt $max_attempts ]; do
  # Try localhost first (same container)
  if wget --no-verbose --tries=1 --spider http://localhost:3001/api/health > /dev/null 2>&1; then
    AUTH_URL="http://localhost:3001"
    echo "Auth service is ready (localhost)!"
    break
  fi
  # Try service name (different container)
  if wget --no-verbose --tries=1 --spider http://auth-service:3001/api/health > /dev/null 2>&1; then
    AUTH_URL="http://auth-service:3001"
    echo "Auth service is ready (service name)!"
    break
  fi
  attempt=$((attempt + 1))
  echo "Waiting for auth-service... ($attempt/$max_attempts)"
  sleep 1
done

if [ $attempt -eq $max_attempts ]; then
  echo "⚠️  Auth service not ready, skipping user seeding"
  echo "   You can create test users manually via the signup page"
  exit 0
fi

# Helper function to normalize and escape strings for SQL
# Takes a string, lowercases it, and escapes single quotes by doubling them
escape_sql_string() {
  echo "$1" | tr '[:upper:]' '[:lower:]' | sed "s/'/''/g"
}

# Helper function to escape SQL strings without lowercasing
# Used for roles and other values that must preserve case
escape_sql_string_preserve_case() {
  echo "$1" | sed "s/'/''/g"
}

# Helper function to update user in database
# Uses proper SQL escaping for variables
update_user_in_db() {
  local email_lower="$1"
  local role_escaped="$2"
  
  psql "$DB_CONNECTION" \
    -c "UPDATE \"user\" SET role = '$role_escaped', \"emailVerified\" = true, \"updatedAt\" = NOW() WHERE LOWER(email) = LOWER('$email_lower');" \
    || { echo "   ❌ Failed to update user in database" >&2; return 1; }
  
  psql "$DB_CONNECTION" \
    -c "DELETE FROM login_attempt WHERE LOWER(email) = LOWER('$email_lower') AND success = false;" \
    || { echo "   ❌ Failed to clear login attempts" >&2; return 1; }
}

# Function to create user via signup API and set role
create_user() {
  email=$1
  password=$2
  name=$3
  role=$4
  
  echo "Creating user: $email"
  
  # Normalize and escape email (lowercase is fine for email)
  email_lower=$(escape_sql_string "$email")
  # Escape role preserving case (backend expects uppercase roles like "ADMIN")
  role_escaped=$(escape_sql_string_preserve_case "$role")
  
  # Check if user already exists (using psql with proper escaping)
  psql_output=$(psql "$DB_CONNECTION" \
    -t -c "SELECT id FROM \"user\" WHERE LOWER(email) = LOWER('$email_lower');" 2>&1)
  psql_exit_code=$?
  if [ $psql_exit_code -ne 0 ]; then
    echo "   ❌ Failed to check if user exists: $psql_output" >&2
    return 1
  fi
  existing_user=$(echo "$psql_output" | tr -d ' ')
  
  if [ -n "$existing_user" ]; then
    echo "   ⏭️  User $email already exists, updating role, verifying email, and clearing lockout..."
    update_user_in_db "$email_lower" "$role_escaped" || return 1
    echo "   ✅ Updated role to: $role"
    echo "   ✅ Email verified"
    echo "   ✅ Account unlocked"
    return 0
  fi
  
  # Create user via signup API (Better Auth uses /sign-up/email endpoint)
  # Use AUTH_URL if set, otherwise default to auth-service
  SIGNUP_URL="${AUTH_URL:-http://auth-service:3001}/api/auth/sign-up/email"
  response=$(wget --quiet --output-document=- --server-response --post-data="email=$email&password=$password&name=$name" \
    --header="Content-Type: application/x-www-form-urlencoded" \
    "$SIGNUP_URL" 2>&1)
  
  # Extract HTTP status code (wget with --server-response outputs "HTTP/X.X XXX" lines)
  # Use POSIX-compliant extraction (no grep -P or bash string slicing)
  http_status=$(echo "$response" | grep 'HTTP/' | tail -1 | awk '{print $2}')
  
  # If extraction failed, log raw response for debugging
  if [ -z "$http_status" ]; then
    echo "   ❌ Failed to parse HTTP status from response"
    echo "   Raw response (first 500 chars):"
    echo "$response" | head -c 500
    return 1
  fi
  
  if [ "$http_status" != "200" ] && [ "$http_status" != "201" ]; then
    echo "   ❌ Failed to create $email (HTTP $http_status)"
    echo "   Response: $response"
    return 1
  else
    echo "   ✅ Created: $email"
    
    # Update role and verify email directly in database (bypassing admin API for dev seeding)
    update_user_in_db "$email_lower" "$role_escaped" || return 1
    if [ "$role" != "CUSTOMER" ]; then
      echo "   ✅ Set role to: $role"
    fi
    echo "   ✅ Email verified"
    echo "   ✅ Account unlocked"
    return 0
  fi
}

# Admin user: use ADMIN_EMAIL/ADMIN_PASSWORD from env if set; otherwise seed same as other test users (admin@test.com)
if [ -n "${ADMIN_EMAIL}" ] && [ -n "${ADMIN_PASSWORD}" ]; then
  create_user "${ADMIN_EMAIL}" "${ADMIN_PASSWORD}" "Admin User" "ADMIN"
else
  create_user "admin@test.com" "password123" "Admin User" "ADMIN"
fi

# Test users (same pattern as admin)
create_user "customer@test.com" "password123" "Customer User" "CUSTOMER"
create_user "teambuyer@test.com" "password123" "Team Buyer" "TEAM_BUYER"

echo ""
echo "✅ User seeding complete!"
echo ""
if [ -n "${ADMIN_EMAIL}" ]; then
  echo "📝 Admin: log in with ADMIN_EMAIL from your .env"
else
  echo "📝 Admin: admin@test.com / password123 (or set ADMIN_EMAIL and ADMIN_PASSWORD to use custom credentials)"
fi
echo "   Test users: customer@test.com, teambuyer@test.com / password123"
echo ""

