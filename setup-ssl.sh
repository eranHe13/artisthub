#!/bin/bash

# SSL Setup Script for ArtistHub
# This script sets up Let's Encrypt SSL certificates and configures Nginx

set -e

# Configuration variables
DOMAIN="yourdomain.com"
EMAIL="your-email@example.com"
NGINX_SITES_AVAILABLE="/etc/nginx/sites-available"
NGINX_SITES_ENABLED="/etc/nginx/sites-enabled"

echo "🔒 Setting up SSL certificates for ArtistHub..."

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo "❌ This script must be run as root (use sudo)"
   exit 1
fi

# Update system packages
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install required packages
echo "📦 Installing required packages..."
apt install -y nginx certbot python3-certbot-nginx ufw

# Configure firewall
echo "🔥 Configuring firewall..."
ufw --force enable
ufw allow 'Nginx Full'
ufw allow OpenSSH
ufw --force reload

# Create initial Nginx configuration (HTTP only for Let's Encrypt verification)
echo "⚙️  Creating initial Nginx configuration..."
cat > "$NGINX_SITES_AVAILABLE/artisthub" << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Enable the site
ln -sf "$NGINX_SITES_AVAILABLE/artisthub" "$NGINX_SITES_ENABLED/"
rm -f "$NGINX_SITES_ENABLED/default"

# Test Nginx configuration
echo "🧪 Testing Nginx configuration..."
nginx -t

# Start Nginx
echo "🚀 Starting Nginx..."
systemctl enable nginx
systemctl restart nginx

# Obtain SSL certificate
echo "🔐 Obtaining SSL certificate from Let's Encrypt..."
certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --email "$EMAIL" --agree-tos --non-interactive

# Replace with hardened configuration
echo "🔒 Applying hardened Nginx configuration..."
cp nginx.conf "$NGINX_SITES_AVAILABLE/artisthub"

# Update domain placeholders in the config
sed -i "s/yourdomain.com/$DOMAIN/g" "$NGINX_SITES_AVAILABLE/artisthub"

# Test and reload Nginx
echo "🧪 Testing hardened configuration..."
nginx -t
systemctl reload nginx

# Set up auto-renewal
echo "🔄 Setting up SSL certificate auto-renewal..."
crontab -l | { cat; echo "0 12 * * * /usr/bin/certbot renew --quiet"; } | crontab -

# Security recommendations
echo "✅ SSL setup complete!"
echo ""
echo "🔒 Security Recommendations:"
echo "1. Update your DNS A records to point $DOMAIN to this server's IP"
echo "2. Update your .env files with the correct domain names"
echo "3. Test your SSL configuration at: https://www.ssllabs.com/ssltest/"
echo "4. Consider enabling fail2ban for additional protection"
echo "5. Regularly update your system and applications"
echo ""
echo "🌐 Your site should now be accessible at: https://$DOMAIN"

# Test the configuration
echo "🧪 Running final tests..."
curl -I "https://$DOMAIN" || echo "⚠️  Site may not be accessible yet - check DNS and application status"

echo "🎉 Setup completed successfully!"