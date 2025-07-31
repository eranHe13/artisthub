# Security Deployment Guide - ArtistHub

## Overview
This guide implements critical security improvements for the ArtistHub application, addressing JWT security, token storage, HTTPS enforcement, and CORS hardening.

## 🔧 What Was Implemented

### 1. JWT Secret Rotation ✅
- **Changed**: JWT signing key now uses dedicated `JWT_SECRET_KEY` environment variable
- **Security**: 256-bit secret key instead of reusing Google OAuth secret

### 2. Secure Cookie Authentication ✅
- **Removed**: All `localStorage` token storage (XSS vulnerable)
- **Added**: HTTP-only, Secure, SameSite cookies
- **Token Lifetime**: Reduced from 7 days to 1 hour
- **Auto-logout**: Server-side session invalidation

### 3. HTTPS & Security Headers ✅
- **Nginx Configuration**: Complete SSL/TLS setup with Let's Encrypt
- **Security Headers**: HSTS, CSP, X-Frame-Options, X-Content-Type-Options
- **TLS**: Only 1.2+ enabled with strong cipher suites

### 4. Hardened CORS ✅
- **Origins**: Restricted to production domains only
- **Methods**: Limited to required HTTP methods
- **Headers**: Specific headers only (no wildcards)

## 🚀 Deployment Steps

### Step 1: Environment Setup

Create your backend `.env` file:
```bash
cd backend
cp .env.example .env
```

Update with your values:
```env
# Generate with: openssl rand -hex 32
JWT_SECRET_KEY=your-256-bit-secret-key-here

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=https://yourdomain.com/auth/callback

# Production domains (comma-separated)
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Database
DATABASE_URL=sqlite:///./app/core/data/database.db
```

### Step 2: SSL Certificate Setup

Run the automated SSL setup script:
```bash
# Update domain and email in setup-ssl.sh first
sudo ./setup-ssl.sh
```

**Manual SSL Setup Alternative:**
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Copy nginx configuration
sudo cp nginx.conf /etc/nginx/sites-available/artisthub
sudo ln -sf /etc/nginx/sites-available/artisthub /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### Step 3: Application Deployment

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run build
npm start
```

**Production Process Manager (PM2):**
```bash
# Install PM2
npm install -g pm2

# Backend
pm2 start "uvicorn app.main:app --host 0.0.0.0 --port 8000" --name artisthub-api

# Frontend  
pm2 start "npm start" --name artisthub-frontend

# Save PM2 configuration
pm2 save
pm2 startup
```

### Step 4: Security Verification

**Test SSL Configuration:**
```bash
# Check SSL grade
curl -I https://yourdomain.com

# Verify headers
curl -I https://yourdomain.com | grep -E "(Strict-Transport|X-Content|X-Frame|X-XSS)"

# Test online: https://www.ssllabs.com/ssltest/
```

**Test Authentication Flow:**
1. Visit `https://yourdomain.com/login`
2. Click "Login with Google"
3. Complete OAuth flow
4. Verify cookie is set (Browser DevTools → Application → Cookies)
5. Verify no localStorage data
6. Test logout clears cookie

## 🔒 Security Features Implemented

### Cookie Security
```javascript
// Backend sets secure cookies
response.set_cookie(
    key="access_token",
    value=jwt_token,
    max_age=3600,      // 1 hour
    httponly=True,     // No JavaScript access
    secure=True,       // HTTPS only  
    samesite="lax"     // CSRF protection
)
```

### Security Headers
```nginx
# Nginx adds these headers to all responses
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'; ...
```

### Rate Limiting
```nginx
# API rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=100r/m;
limit_req_zone $binary_remote_addr zone=auth:10m rate=5r/m;
```

## 🧪 Testing Checklist

- [ ] **SSL Certificate**: A+ grade on SSL Labs
- [ ] **Security Headers**: All headers present in response
- [ ] **Cookie Authentication**: Login sets HTTP-only cookie
- [ ] **No localStorage**: Dev tools show no JWT in localStorage
- [ ] **Token Expiry**: 1-hour expiration enforced
- [ ] **Logout**: Cookie cleared on logout
- [ ] **CORS**: Only allowed origins can make requests
- [ ] **Rate Limiting**: Auth endpoints limited to 5 req/min
- [ ] **HTTPS Redirect**: HTTP automatically redirects to HTTPS

## 🔍 Monitoring & Maintenance

### Log Monitoring
```bash
# Nginx logs
tail -f /var/log/nginx/artisthub_access.log
tail -f /var/log/nginx/artisthub_error.log

# Application logs
pm2 logs artisthub-api
pm2 logs artisthub-frontend
```

### Security Maintenance
- **SSL Renewal**: Automatic via certbot cron job
- **Dependencies**: Regular updates for security patches
- **Log Review**: Monitor for suspicious activity
- **Rate Limit Tuning**: Adjust based on usage patterns

### Emergency Security Response
```bash
# Block IP address
sudo ufw deny from <malicious-ip>

# Revoke all sessions (emergency)
# Restart backend to invalidate all JWTs
pm2 restart artisthub-api

# Check for intrusion
sudo fail2ban-client status
```

## 🚨 Security Alerts

### Failed Login Monitoring
Backend logs failed attempts - consider implementing:
- Email alerts for multiple failed attempts
- Automatic IP blocking
- User account lockout policies

### Security Headers Monitoring  
Monitor for missing security headers:
```bash
# Test script
curl -s -D- https://yourdomain.com | grep -E "(Strict-Transport|X-Content|X-Frame)"
```

## 📋 Environment Variables Reference

### Backend `.env`
```env
JWT_SECRET_KEY=<256-bit-hex-secret>
GOOGLE_CLIENT_ID=<google-oauth-client-id>
GOOGLE_CLIENT_SECRET=<google-oauth-client-secret>
GOOGLE_REDIRECT_URI=https://yourdomain.com/auth/callback
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
DATABASE_URL=sqlite:///./app/core/data/database.db
```

### Production Considerations
- Use PostgreSQL instead of SQLite
- Enable Redis for session storage
- Implement rate limiting with Redis
- Add monitoring with Prometheus/Grafana
- Set up automated backups
- Configure log rotation

## 🎯 Next Steps

1. **Deploy to staging environment first**
2. **Run security tests**  
3. **Performance testing under load**
4. **Monitor logs for 24-48 hours**
5. **Deploy to production**
6. **Set up monitoring alerts**

---

**⚠️ Important Notes:**
- Test all changes in staging first
- Backup your database before deploying
- Have rollback plan ready
- Monitor logs after deployment
- Update DNS records to point to your server

**🔐 Security Contacts:**
- Report vulnerabilities immediately
- Keep all dependencies updated
- Review security logs weekly