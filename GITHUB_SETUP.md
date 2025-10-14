# GitHub Auto-Save Setup Guide

This guide will help you set up automatic saving to GitHub so that when you click "Save Changes" in the family tree app, it automatically commits and pushes changes to your repository.

## Step 1: Create a GitHub Personal Access Token

1. **Go to GitHub Settings**
   - Navigate to: https://github.com/settings/tokens
   - Or: Click your profile picture → Settings → Developer settings → Personal access tokens → Tokens (classic)

2. **Generate New Token**
   - Click "Generate new token" → "Generate new token (classic)"
   - **Note**: Give it a descriptive name like "Family Tree Auto-Save"
   - **Expiration**: Choose "No expiration" (or set a custom date)
   
3. **Set Permissions**
   - ✅ Check **`repo`** (Full control of private repositories)
     - This will automatically check all sub-options under `repo`
   - Leave all other permissions unchecked

4. **Generate and Copy Token**
   - Click "Generate token" at the bottom
   - **IMPORTANT**: Copy the token immediately! You won't be able to see it again.
   - Save it somewhere secure temporarily (you'll need it in Step 2)

## Step 2: Configure Environment Variables

### For Local Development:

1. **Create `.env` file**
   ```bash
   # In your project root directory
   cp .env.example .env
   ```

2. **Edit `.env` file** with your values:
   ```env
   VITE_GITHUB_OWNER=emmanuelikinya
   VITE_GITHUB_REPO=Orodho_family_tree
   VITE_GITHUB_TOKEN=ghp_YourActualTokenHere123456789
   ```

3. **Replace with your actual values:**
   - `VITE_GITHUB_OWNER`: Your GitHub username
   - `VITE_GITHUB_REPO`: Your repository name
   - `VITE_GITHUB_TOKEN`: The token you copied in Step 1

### For Netlify Deployment:

1. **Go to Netlify Dashboard**
   - Navigate to: https://app.netlify.com
   - Select your "Orodho Family Tree" site

2. **Add Environment Variables**
   - Go to: Site settings → Environment variables
   - Click "Add a variable" for each:

   | Key | Value | Scopes |
   |-----|-------|--------|
   | `VITE_GITHUB_OWNER` | `emmanuelikinya` | All |
   | `VITE_GITHUB_REPO` | `Orodho_family_tree` | All |
   | `VITE_GITHUB_TOKEN` | `ghp_YourActualTokenHere` | All |

3. **Redeploy Site**
   - After adding variables, go to: Deploys → Trigger deploy → Deploy site
   - This ensures the new environment variables are included in the build

## Step 3: Test the Auto-Save Feature

1. **Open your deployed site**
   - Visit your Netlify URL

2. **Make a test change**
   - Click on any person in the tree
   - Click the edit icon
   - Make a small change (e.g., update a description)
   - Click "Save Changes" button (top right)

3. **Verify the save**
   - You should see a green success message: "Changes saved to GitHub! Netlify will deploy updates in 2-3 minutes."
   - Check your GitHub repository for the new commit
   - Wait 2-3 minutes for Netlify to auto-deploy

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never commit `.env` file**
   - The `.env` file is already in `.gitignore`
   - Never share your token publicly

2. **Token Security**
   - Tokens are like passwords - keep them secret
   - If compromised, revoke it immediately at: https://github.com/settings/tokens
   - Generate a new one if needed

3. **Repository Permissions**
   - This token has full access to your repository
   - Only share access with trusted people

## Troubleshooting

### "Downloaded JSON file (GitHub not configured)"
- **Problem**: Environment variables not set up
- **Solution**: Complete Step 2 above

### "Failed to save to GitHub"
- **Problem**: Invalid token or permissions
- **Solution**: 
  1. Check that token has `repo` permission
  2. Verify token is still valid (not expired)
  3. Generate a new token if needed

### "Unauthorized" or "403" errors
- **Problem**: Token is invalid or doesn't have correct permissions
- **Solution**: 
  1. Delete old token from GitHub
  2. Create new token with `repo` permission
  3. Update `.env` or Netlify environment variables

### Changes not showing on site
- **Problem**: Netlify hasn't deployed yet
- **Solution**: Wait 2-3 minutes for automatic deployment

## How It Works

1. User clicks "Save Changes" button
2. App calls GitHub API with your token
3. Creates a new commit in your repository
4. Pushes commit to the `main` branch
5. Netlify detects the commit and auto-deploys
6. Updated site is live in 2-3 minutes

## Fallback Mode

If GitHub is not configured, the app will automatically fall back to the old behavior:
- Downloads the JSON file to your computer
- You manually replace the file in the repository
- You commit and push manually

---

**Questions?** Check the console (F12) for detailed error messages.
