# Deployment Instructions

## VPS Manual Deployment

Since you are hosting on your own Linux VPS, you will need to manually pull code updates directly using Git and rebuild the Node.js application.

1. **Connect to your Server via SSH:**
   ```bash
   ssh root@inmersin.com.tr -p 22666
   ```

2. **Navigate to the Application Directory:**
   ```bash
   cd /var/www/inmersin
   ```

3. **Pull Changes from GitHub:**
   ```bash
   git pull origin main
   ```

4. **Install and Update Node Dependencies (optional but recommended):**
   ```bash
   npm install
   ```

5. **Rebuild the Application:**
   ```bash
   npm run build
   ```

6. **Restart the PM2 Process Manager:**
   ```bash
   pm2 restart inmersin
   ```
   
Your application will now be running the latest master branch version successfully.
