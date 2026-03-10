#!/bin/sh
# Inject shop-specific branding at container startup (runtime, not build time)
# This avoids a full npm rebuild per shop — the image is built once and reused.
cat > /usr/share/nginx/html/config.js <<EOF
window.__ENV__ = {
  SHOP_SLUG: "${SHOP_SLUG:-default}",
  SHOP_NAME: "${SHOP_NAME:-Kids Bookstore}",
  PRIMARY_COLOR: "${PRIMARY_COLOR:-#3f51b5}",
  LOGO_URL: "${LOGO_URL:-}",
  API_URL: "${API_URL:-http://localhost:8081/api}"
};
EOF

echo "Shop container config injected for: ${SHOP_NAME} (${SHOP_SLUG})"
exec nginx -g "daemon off;"
