#!/usr/bin/env bash
# Run on the EC2 instance (Ubuntu) after pointing your domain A record to this server.
# Usage: sudo ./ec2-setup-https.sh yourdomain.com

set -euo pipefail

DOMAIN="${1:-}"
if [[ -z "$DOMAIN" ]]; then
  echo "Usage: sudo $0 yourdomain.com"
  exit 1
fi

apt-get update
apt-get install -y nginx certbot python3-certbot-nginx

CONF="/etc/nginx/sites-available/nutritiontracker"
sed "s/YOUR_DOMAIN/${DOMAIN}/g" "$(dirname "$0")/../infra/nginx/nutritiontracker.conf" > "$CONF"
ln -sf "$CONF" /etc/nginx/sites-enabled/nutritiontracker
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m abs.personal12@gmail.com --redirect

echo "HTTPS ready. Add to Google OAuth Authorized JavaScript origins:"
echo "  https://${DOMAIN}"
