# Deployment Instructions

## Vercel Deployment

Since you have the Vercel CLI installed, you can deploy directly from your terminal.

1. **Login to Vercel (if not already logged in):**
   ```bash
   vercel login
   ```

2. **Deploy:**
   Run the following command in your project root:
   ```bash
   vercel
   ```
   - Follow the prompts (Keep default settings mostly).
   - Use `c:\Users\dell\Documents\HTML WEB\antigravity\inmersin` as the root directory.

3. **Environment Variables:**
   - **Important:** Vercel will ask if you want to link your local `.env` file. Say **YES** (or manually add the env vars in Vercel dashboard).
   - Ensure `DATABASE_URL` and `TURSO_AUTH_TOKEN` are set in the Vercel project settings.

4. **Production Deployment:**
   Once verified, deploy to production:
   ```bash
   vercel --prod
   ```
