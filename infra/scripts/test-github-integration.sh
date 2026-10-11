#!/usr/bin/env sh
set -eu

if [ -f .env ]; then
  set -a
  . ./.env
  set +a
fi

: "${GITHUB_CLIENT_ID:?Set GITHUB_CLIENT_ID in .env}"
: "${GITHUB_CLIENT_SECRET:?Set GITHUB_CLIENT_SECRET in .env}"
: "${FRONTEND_URL:?Set FRONTEND_URL in .env}"

API_BASE_URL=${API_BASE_URL:-http://localhost:4000}
status=$(curl -sS -o /dev/null -w '%{http_code}' "$API_BASE_URL/api/github/auth/github" || true)

case "$status" in
  302|401)
    printf 'GitHub API route is reachable (HTTP %s).\n' "$status"
    ;;
  *)
    printf 'GitHub API route check failed (HTTP %s) at %s.\n' "$status" "$API_BASE_URL" >&2
    exit 1
    ;;
esac
