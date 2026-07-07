#!/bin/bash
set -e

# Railway injects PORT env variable. Apache needs to listen on it.
PORT=${PORT:-80}

# Force Apache to ONLY listen on the injected PORT
echo "Listen ${PORT}" > /etc/apache2/ports.conf

# Replace ${PORT} in our custom virtualhost config with the actual number
sed -i "s/\*:\${PORT}/*:${PORT}/g" /etc/apache2/sites-available/000-default.conf

# --- Fix: Ensure only ONE MPM module is loaded at runtime ---
# Disable conflicting MPMs first, then enable prefork (required for mod_php)
a2dismod mpm_event mpm_worker 2>/dev/null || true
a2enmod mpm_prefork 2>/dev/null || true

# Start Apache in foreground
exec apache2-foreground
