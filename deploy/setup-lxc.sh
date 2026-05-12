#!/usr/bin/env bash
set -euo pipefail

REPO_URL="${1:?Usage: setup-lxc.sh <git-clone-url>}"
SITE_DIR="/var/www/portfolio"
PORT=8080

apt-get update
apt-get install -y git python3

git clone "$REPO_URL" "$SITE_DIR"

cat > /etc/systemd/system/portfolio.service <<EOF
[Unit]
Description=Portfolio static file server
After=network.target

[Service]
WorkingDirectory=$SITE_DIR
ExecStart=/usr/bin/python3 -m http.server $PORT --bind 0.0.0.0
Restart=always
User=www-data

[Install]
WantedBy=multi-user.target
EOF

chown -R www-data:www-data "$SITE_DIR"
systemctl daemon-reload
systemctl enable --now portfolio

echo "Done. Serving $SITE_DIR on port $PORT."
