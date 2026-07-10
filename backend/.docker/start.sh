#!/bin/bash
set -e

# Railway injects PORT env variable. Apache needs to listen on it.
PORT=${PORT:-80}

# Force export of Railway variables to Apache envvars so PHP can see them
echo "export DB_HOST=\"${DB_HOST}\"" >> /etc/apache2/envvars
echo "export DB_USER=\"${DB_USER}\"" >> /etc/apache2/envvars
echo "export DB_PASSWORD=\"${DB_PASSWORD}\"" >> /etc/apache2/envvars
echo "export DB_NAME=\"${DB_NAME}\"" >> /etc/apache2/envvars
echo "export DB_PORT=\"${DB_PORT}\"" >> /etc/apache2/envvars
echo "export GOOGLE_CLIENT_ID=\"${GOOGLE_CLIENT_ID}\"" >> /etc/apache2/envvars
echo "export GOOGLE_CLIENT_SECRET=\"${GOOGLE_CLIENT_SECRET}\"" >> /etc/apache2/envvars
echo "export SUPABASE_URL=\"${SUPABASE_URL}\"" >> /etc/apache2/envvars
echo "export SUPABASE_KEY=\"${SUPABASE_KEY}\"" >> /etc/apache2/envvars
echo "export RESEND_API_KEY=\"${RESEND_API_KEY}\"" >> /etc/apache2/envvars
echo "export EMAIL_USERNAME=\"${EMAIL_USERNAME}\"" >> /etc/apache2/envvars
echo "export EMAIL_PASSWORD=\"${EMAIL_PASSWORD}\"" >> /etc/apache2/envvars

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
