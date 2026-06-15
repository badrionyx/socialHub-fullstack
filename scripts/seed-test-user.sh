#!/usr/bin/env bash
# Seed a test user and create a post on SocialHub.
# Usage: ./scripts/seed-test-user.sh [message]
# Optional env vars: BASE, USERNAME, EMAIL, PASSWORD, IMAGE
set -euo pipefail

BASE="${BASE:-https://socialhub-szwp.onrender.com}"
USERNAME="${USERNAME:-friend_bot}"
EMAIL="${EMAIL:-friend_bot@example.com}"
PASSWORD="${PASSWORD:-Test@1234}"
MESSAGE="${1:-Hello from a fresh test account! Just exploring SocialHub.}"

echo "-> Registering $USERNAME ..."
REG_CODE=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE/api/auth/register" \
  -H 'Content-Type: application/json' \
  -d '{"username":"'"$USERNAME"'","email":"'"$EMAIL"'","password":"'"$PASSWORD"'"}')
if [ "$REG_CODE" = "200" ] || [ "$REG_CODE" = "201" ]; then
  echo "   Registered."
else
  echo "   Register returned HTTP $REG_CODE (user may already exist - continuing)."
fi

echo "-> Logging in ..."
LOGIN_BODY=$(curl -s -X POST "$BASE/api/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"email":"'"$EMAIL"'","password":"'"$PASSWORD"'"}')
TOKEN=$(printf '%s' "$LOGIN_BODY" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
if [ -z "$TOKEN" ]; then
  echo "   Login failed. Response: $LOGIN_BODY"
  exit 1
fi
echo "   Got token."

echo "-> Creating post ..."
if [ -n "${IMAGE:-}" ]; then
  RESP=$(curl -s -X POST "$BASE/api/posts" \
    -H "Authorization: Bearer $TOKEN" \
    -F "content=$MESSAGE" \
    -F "file=@$IMAGE")
else
  RESP=$(curl -s -X POST "$BASE/api/posts" \
    -H "Authorization: Bearer $TOKEN" \
    -F "content=$MESSAGE")
fi

echo "   Done. Response:"
printf '%s\n' "$RESP"
