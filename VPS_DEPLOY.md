# VPS Deployment Guide (Ubuntu 22.04/24.04)

This guide walks you through deploying your Next.js application to a Linux VPS (DigitalOcean, Hetzner, AWS, etc.) using PM2 and Nginx.

## 1. Server Setup (Initial)
SSH into your server:
```bash
ssh root@your-server-ip
```

Update packages:
```bash
apt update && apt upgrade -y
```

Install essential tools:
```bash
apt install -y curl git unzip
```

## 2. Install Node.js (v20)
Using NVM (Node Version Manager) is recommended:
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
node -v # Should show v20.x.x
```

Instal PM2 (Process Manager):
```bash
npm install -g pm2
```

## 3. Prepare the Application
You can either clone via Git (recommended) or upload files via SFTP/SCP.

### Option A: Git (Recommended)
1. Generate an SSH key on the server: `ssh-keygen -t ed25519`
2. Add the public key (`cat ~/.ssh/id_ed25519.pub`) to your GitHub/GitLab Deploy Keys.
3. Clone:
```bash
mkdir -p /var/www/inmersin
git clone <your-repo-url> /var/www/inmersin
cd /var/www/inmersin
```

### Option B: SFTP Upload
Upload your project files to `/var/www/inmersin` (excluding `node_modules`, `.next`, `.git`).

## 4. Install Dependencies & Build
Navigate to project directory:
```bash
cd /var/www/inmersin
```

Create `.env` file:
```bash
nano .env
```
Paste your production variables:
```env
DATABASE_URL="file:./prod.db"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
NODE_ENV="production"
# Add other secrets (AUTH_SECRET, etc)
```

Install and Build:
```bash
npm ci
npm run build
```

**Initialize Database:**
```bash
# Push schema to the local sqlite file
npx drizzle-kit push
```

## 5. Start with PM2
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
# Follow the command output by pm2 startup to enable boot on restart
```

## 6. Configure Nginx (Reverse Proxy)
Install Nginx:
```bash
apt install -y nginx
```

Create config:
```bash
nano /etc/nginx/sites-available/inmersin
```

Content:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
ln -s /etc/nginx/sites-available/inmersin /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default # Remove default if needed
nginx -t
systemctl restart nginx
```

## 7. SSL with Certbot (HTTPS)
```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## 8. Updates
When you push new code:
```bash
cd /var/www/inmersin
git pull
npm install
npx drizzle-kit push # if DB schema changed
npm run build
pm2 restart inmersin-app
```
