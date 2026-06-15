#!/usr/bin/env bash
set -Eeuo pipefail

APP_ROOT="${APP_ROOT:-/var/www/milosevac.com}"
FRONTEND_DIR="${FRONTEND_DIR:-$APP_ROOT/httpdocs}"
REF="${1:-main}"
NPM_BIN="${NPM_BIN:-npm}"
LOCK_FILE="$APP_ROOT/deploy-frontend.lock"

test -d "$FRONTEND_DIR/.git" || { echo "Missing frontend repository: $FRONTEND_DIR"; exit 1; }

exec 9>"$LOCK_FILE"
flock -n 9 || { echo "Another frontend deployment is running."; exit 1; }

git -C "$FRONTEND_DIR" fetch --depth 1 origin "$REF"
git -C "$FRONTEND_DIR" checkout --force --detach FETCH_HEAD

(
  cd "$FRONTEND_DIR"
  "$NPM_BIN" ci
  VITE_BACKEND_PUBLIC_URL="${VITE_BACKEND_PUBLIC_URL:-https://milosevac.com}" "$NPM_BIN" run build
)

echo "Frontend deployment completed: $(git -C "$FRONTEND_DIR" rev-parse --short HEAD)"
