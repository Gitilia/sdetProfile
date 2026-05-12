#!/usr/bin/env bash
set -euo pipefail

SITE_DIR="/var/www/portfolio"

cd "$SITE_DIR"
git fetch origin
git reset --hard origin/master
chown -R www-data:www-data "$SITE_DIR"

echo "Updated to $(git rev-parse --short HEAD)"
