# Environment Variables Setup

## For Vercel Deployment

After deploying your frontend to Vercel, set this environment variable in the Vercel dashboard:

### Step 1: Go to Project Settings
1. Open your project in Vercel dashboard
2. Click "Settings" tab
3. Click "Environment Variables" in the sidebar

### Step 2: Add Variable
- **Name**: `VITE_API_URL`
- **Value**: Your backend URL (e.g., `https://your-app.railway.app`)
- **Environments**: Check all (Production, Preview, Development)

### Step 3: Redeploy
Click "Redeploy" to apply the changes.

---

## For Local Development

Create a `.env.local` file in the root directory:

```env
VITE_API_URL=http://localhost:5000
```

This file is git-ignored and won't be committed.

---

## Default Behavior

If `VITE_API_URL` is not set:
- **Development mode**: Uses `http://localhost:5000`
- **Production mode**: Uses `/api` (for same-domain API)

Most cases: Set `VITE_API_URL` to your Railway/Render backend URL.
