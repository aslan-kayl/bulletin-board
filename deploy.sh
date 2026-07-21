#!/bin/bash
set -e

echo "=== Bulletin Board Deploy ==="

# Install Docker if missing
if ! command -v docker &>/dev/null; then
  echo "Installing Docker..."
  curl -fsSL https://get.docker.com | sh
  systemctl enable docker
  systemctl start docker
fi

# Pull latest code
if [ -d ".git" ]; then
  git pull
fi

# Build and start
docker compose -f docker-compose.prod.yml up -d --build

# Seed categories (ignore error if already seeded)
docker compose -f docker-compose.prod.yml exec -T backend python seed.py || true

DOMAIN=$(grep '^DOMAIN=' .env | cut -d= -f2)
echo ""
echo "✅ Done! App is running at https://${DOMAIN}"
