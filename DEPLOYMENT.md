# Deployment Guide - Orodho Family Tree

This guide will help you deploy your family tree application with **Frontend on Netlify** and **Backend on Render**.

## Prerequisites

- GitHub account
- Netlify account (free): https://netlify.com
- Render account (free): https://render.com

---

## Part 1: Deploy Backend to Render

### Step 1: Push Your Code to GitHub

Make sure all your latest changes are committed and pushed:
```bash
git add -A
git commit -m "Prepare for deployment"
git push origin main
```

### Step 2: Create Render Account & New Web Service

1. Go to https://render.com and sign up/login
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account if not already connected
4. Select your **"Orodho_family_tree"** repository

### Step 3: Configure the Web Service

Fill in the following settings:

- **Name**: `orodho-family-tree-backend` (or any name you prefer)
- **Region**: Choose closest to your location
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Instance Type**: `Free`

### Step 4: Add Environment Variables (Optional)

Click **"Advanced"** and add any environment variables if needed:
- Currently, none are required for basic functionality

### Step 5: Deploy

1. Click **"Create Web Service"**
2. Wait 5-10 minutes for deployment to complete
3. Once deployed, you'll get a URL like: `https://orodho-family-tree-backend.onrender.com`
4. **IMPORTANT**: Copy this URL - you'll need it for the frontend!

### Step 6: Add Persistent Disk for Photos (Recommended)

1. In your Render dashboard, go to your web service
2. Click **"Disks"** in the left sidebar
3. Click **"Add Disk"**
4. Configure:
   - **Name**: `photos-storage`
   - **Mount Path**: `/opt/render/project/src/public/photos`
   - **Size**: 1GB (costs $0.25/month)
5. Click **"Save"**
6. Your service will restart automatically

### Step 7: Test the Backend

Visit: `https://your-backend-url.onrender.com/api/health`

You should see: `{"status":"ok","message":"Server is running"}`

---

## Part 2: Deploy Frontend to Netlify

### Step 1: Update Environment Variable

1. Go to Netlify: https://netlify.com
2. Login and click **"Add new site"** → **"Import an existing project"**
3. Choose **"GitHub"** and select your **"Orodho_family_tree"** repository

### Step 2: Configure Build Settings

Netlify should auto-detect these settings:

- **Branch to deploy**: `main`
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Base directory**: Leave empty (root)

### Step 3: Add Environment Variables

Before deploying, click **"Add environment variables"**:

- **Key**: `VITE_API_URL`
- **Value**: `https://your-backend-url.onrender.com/api` (use your Render URL from Part 1)

Example: `https://orodho-family-tree-backend.onrender.com/api`

**⚠️ IMPORTANT**: Do NOT add `/api` at the end if your Render backend URL already has it!

### Step 4: Deploy

1. Click **"Deploy site"**
2. Wait 2-3 minutes for build to complete
3. Netlify will give you a URL like: `https://random-name-12345.netlify.app`

### Step 5: Custom Domain (Optional)

1. In Netlify dashboard, go to **"Domain settings"**
2. Click **"Add custom domain"**
3. Choose a custom subdomain like `orodho-family-tree.netlify.app`

---

## Part 3: Update Backend CORS Settings

Your backend needs to allow requests from your Netlify domain.

### Step 1: Update backend/server.js

In your `backend/server.js`, find the CORS configuration and update it:

```javascript
// Current (allows all origins):
app.use(cors());

// Change to (allows specific origins):
const allowedOrigins = [
  'http://localhost:5173',
  'https://your-netlify-site.netlify.app', // Replace with your Netlify URL
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('CORS policy violation'), false);
    }
    return callback(null, true);
  },
  credentials: true
}));
```

### Step 2: Commit and Push

```bash
git add backend/server.js
git commit -m "Update CORS for production"
git push origin main
```

Render will automatically redeploy your backend with the new settings.

---

## Part 4: Testing Your Deployed Application

### Test Checklist:

1. **Visit your Netlify URL** - Family tree should load
2. **Test backend connection**:
   - Open browser console (F12)
   - Look for API errors
   - Should see node positions loading
3. **Test photo upload**:
   - Click on a family member
   - Upload a photo
   - Refresh page to see the new photo
4. **Test position saving**:
   - Move a card
   - Refresh page
   - Card should stay in new position

---

## Common Issues & Solutions

### Issue 1: Photos Not Uploading
**Solution**: Make sure you added a Persistent Disk in Render (Part 1, Step 6)

### Issue 2: Backend Connection Failed
**Solutions**:
- Check that VITE_API_URL is correct in Netlify environment variables
- Make sure Render backend is not sleeping (visit the /api/health endpoint)
- Check browser console for CORS errors

### Issue 3: Render Backend Sleeps
**Note**: Free tier Render services sleep after 15 minutes of inactivity
**Solutions**:
- Upgrade to paid plan ($7/month)
- Use a service like UptimeRobot to ping your backend every 14 minutes
- Accept the 30-second wake-up delay (fine for family use)

### Issue 4: CORS Errors
**Solution**: Make sure you updated CORS settings in Part 3

---

## Maintenance

### Update Family Data
1. Edit `src/data/familyData.json` locally
2. Commit and push to GitHub
3. Netlify will automatically rebuild and deploy

### Upload Photos
- Use the "Upload Photo" feature in the app
- Photos are stored on Render's persistent disk

### View Logs
- **Backend logs**: Render dashboard → Your service → "Logs" tab
- **Frontend logs**: Browser console (F12)

---

## Cost Summary

**Free Setup** (Recommended for family use):
- Netlify Frontend: $0/month (100GB bandwidth)
- Render Backend: $0/month (sleeps after 15 min inactivity)
- **Total: $0/month**

**Paid Setup** (No sleeping, better performance):
- Netlify Frontend: $0/month
- Render Backend: $7/month (always on)
- Render Persistent Disk: $0.25/month per GB
- **Total: ~$7.25/month**

---

## Support

If you encounter issues:
1. Check browser console (F12) for errors
2. Check Render logs for backend errors
3. Verify environment variables are set correctly
4. Make sure both services are deployed successfully

---

**Your deployed URLs:**
- Frontend: `https://your-site.netlify.app`
- Backend: `https://your-backend.onrender.com`
- Backend Health Check: `https://your-backend.onrender.com/api/health`

Save these URLs for reference!
