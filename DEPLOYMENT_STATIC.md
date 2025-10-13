# Static Deployment Guide - Orodho Family Tree

## 🎯 Overview

This guide shows how to deploy your family tree as a **100% FREE static website** on Netlify.

### What You Get:
- ✅ Beautiful interactive family tree
- ✅ All family members and relationships
- ✅ Photos served from your deployment
- ✅ Fast loading (served from CDN)
- ✅ **Completely FREE forever**

### What You DON'T Get (Backend Features):
- ❌ Photo upload through browser (add photos via GitHub instead)
- ❌ Position sync across browsers (positions save in browser only)

**Trade-off:** You add photos by updating the GitHub repo (simple!), and Netlify rebuilds automatically.

---

## 🚀 Deployment Steps (5 Minutes)

### Step 1: Make Sure Code is on GitHub

Your code is already on GitHub at:
`https://github.com/emmanuelikinya/Orodho_family_tree`

✅ You're ready!

### Step 2: Sign Up for Netlify

1. Go to https://netlify.com
2. Click **"Sign up"**
3. Choose **"Sign up with GitHub"**
4. Authorize Netlify to access your GitHub

### Step 3: Create New Site

1. Click **"Add new site"** → **"Import an existing project"**
2. Choose **"Deploy with GitHub"**
3. Select your repository: **`Orodho_family_tree`**

### Step 4: Configure Build Settings

Netlify should auto-detect these settings:

- **Branch to deploy**: `main`
- **Build command**: `npm run build`
- **Publish directory**: `dist`

**Leave everything as default** - don't add any environment variables (we don't need backend!)

### Step 5: Deploy!

1. Click **"Deploy site"**
2. Wait 2-3 minutes for build to complete
3. You'll get a URL like: `https://random-name-12345.netlify.app`

### Step 6: Visit Your Site!

Click on your Netlify URL and see your family tree live! 🎉

---

## 🎨 Customize Your Domain (Optional)

### Change Site Name

1. In Netlify dashboard, click **"Site settings"**
2. Click **"Change site name"**
3. Enter a name like: `orodho-family-tree`
4. Your new URL: `https://orodho-family-tree.netlify.app`

### Use Custom Domain (Optional)

If you own a domain:
1. Go to **"Domain settings"**
2. Click **"Add custom domain"**
3. Follow the instructions
4. Example: `family.yourdomain.com`

---

## 📸 Adding Photos

Photos are added to the repository and deployed with the site.

### Quick Process:

1. **Add photo** to `public/photos/` folder
2. **Update** `src/data/familyData.json` with photo path
3. **Commit & push** to GitHub
4. **Netlify rebuilds** automatically (2-3 minutes)
5. **Photo appears** on your site!

**📖 See `ADDING_PHOTOS.md` for detailed instructions**

---

## 👥 Adding New Family Members

Edit `src/data/familyData.json` locally, then:

```bash
git add src/data/familyData.json
git commit -m "Add new family member"
git push origin main
```

Netlify automatically rebuilds. Done!

---

## 🔄 Updating the Site

### Any Changes You Make:

1. Edit files locally
2. Commit changes: `git add . && git commit -m "Your message"`
3. Push to GitHub: `git push origin main`
4. Netlify rebuilds automatically
5. Changes live in 2-3 minutes!

### Monitor Deployments:

- Go to Netlify dashboard
- Click **"Deploys"**
- See build progress and logs
- Green checkmark = successful!

---

## ⚙️ Advanced Settings

### Build & Deploy Settings

In Netlify dashboard → **Site settings** → **Build & deploy**:

**Build settings:**
- Base directory: (leave empty)
- Build command: `npm run build`
- Publish directory: `dist`
- Node version: 18 (auto-detected)

**Deploy contexts:**
- Production branch: `main`
- Branch deploys: Enabled (optional)

### Environment Variables

**Not needed for static deployment!**

If you later add backend features:
- Go to **Site settings** → **Environment variables**
- Add `VITE_API_URL` with your backend URL

---

## 📊 Netlify Features You Get (FREE)

### Included:
- ✅ 100 GB bandwidth/month
- ✅ 300 build minutes/month
- ✅ Automatic HTTPS
- ✅ CDN (fast loading worldwide)
- ✅ Automatic deploys from GitHub
- ✅ Deploy previews for pull requests
- ✅ Custom domain support

### Limits (FREE tier):
- 100 GB bandwidth/month (plenty for family site)
- 300 build minutes/month (you'll use ~3 min per deploy)
- 1 concurrent build

**For a family tree:** These limits are more than enough! 🎉

---

## 🐛 Troubleshooting

### Build Failed?

**Check build logs:**
1. Go to Netlify dashboard
2. Click **"Deploys"**
3. Click on failed deploy
4. Scroll to bottom to see error

**Common fixes:**
- Make sure `package.json` is in root directory
- Check Node version compatibility
- Verify all dependencies are in `package.json`

### Site Shows Blank Page?

**Check browser console:**
1. Press F12 (or Cmd+Option+I on Mac)
2. Look for errors in Console tab
3. Common issue: Missing files

**Fix:**
- Clear browser cache (Ctrl+Shift+R)
- Try incognito/private window
- Check if build completed successfully

### Photos Not Showing?

**Checklist:**
- Photo is in `public/photos/` folder
- Path in JSON starts with `/photos/`
- Filename matches exactly (case-sensitive)
- Changes committed and pushed to GitHub
- Netlify rebuild completed

**📖 See `ADDING_PHOTOS.md` for detailed troubleshooting**

---

## 💰 Cost Breakdown

### Netlify (Static Site)
- **Monthly cost:** $0
- **Bandwidth:** 100 GB (free)
- **Builds:** 300 minutes (free)
- **SSL/HTTPS:** Included
- **CDN:** Included

### Total Monthly Cost: **$0** 🎉

---

## 🔐 Security & Privacy

### Your Site is Public

Anyone with the URL can view your family tree.

**Options for privacy:**

1. **Use obscure URL** - Don't share widely
2. **Password protect (Paid feature)**
   - Netlify Pro: $19/month
   - Adds password protection
3. **Deploy to private server** (requires backend)

### Recommendation:

For family use, an obscure URL is usually sufficient:
- Share only with family members
- URL is hard to guess: `https://orodho-family-tree-a8s9d7f6.netlify.app`

---

## 📈 Monitoring Your Site

### View Analytics (Free)

Netlify provides basic analytics:
1. Go to Netlify dashboard
2. Click **"Analytics"** tab
3. See page views, bandwidth usage, etc.

### Deploy Notifications

Get notified when deploys succeed/fail:
1. Go to **Site settings** → **Build & deploy**
2. Scroll to **Deploy notifications**
3. Add email or Slack notification

---

## 🚀 Future Enhancements

### If You Want Backend Features Later:

**Option 1: Add Backend Server ($7/month)**
- Deploy backend to Render/Railway
- Enable photo uploads through browser
- Position sync across devices

**Option 2: Use Serverless (Free)**
- Convert to Netlify Functions
- Use Cloudinary for photos (free tier)
- Keep everything on Netlify

**For now:** Static deployment is perfect for viewing and managing the family tree!

---

## 📞 Support

### Resources:

- **Netlify Docs:** https://docs.netlify.com
- **Adding Photos:** See `ADDING_PHOTOS.md`
- **Full Deployment Guide:** See `DEPLOYMENT.md`

### Common Questions:

**Q: How do I add a new person?**
A: Edit `src/data/familyData.json`, commit, push to GitHub

**Q: Can I upload photos through the website?**
A: Not with static deployment. Add photos via GitHub (see `ADDING_PHOTOS.md`)

**Q: How much does this cost?**
A: **$0/month** - completely free!

**Q: Can I use my own domain?**
A: Yes! Free with Netlify (see "Customize Your Domain" above)

**Q: Is the site secure?**
A: Yes - automatic HTTPS included

---

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Netlify account created
- [ ] Site imported from GitHub
- [ ] Build settings configured
- [ ] First deploy successful
- [ ] Site is live and accessible
- [ ] Photos displaying correctly
- [ ] Family tree navigates properly
- [ ] (Optional) Custom domain configured
- [ ] Share URL with family! 🎉

---

**Your site is now live!** 🚀

**Next steps:**
1. Share the URL with family members
2. Add photos using `ADDING_PHOTOS.md` guide
3. Update family information as needed
4. Enjoy your beautiful family tree!
