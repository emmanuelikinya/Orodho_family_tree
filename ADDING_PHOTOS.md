# How to Add Photos to Family Tree

Since we're using a **static deployment** (no backend server), photos are added directly to the repository and deployed with the site.

## 📸 Adding a Photo (3 Simple Steps)

### Step 1: Add Photo to Public Folder

1. Get your photo file (JPEG, PNG, or GIF)
2. Rename it to something simple, like: `john-smith.jpg` or `mary-orodho.png`
3. Copy it to: `public/photos/` folder in your project

**Example:**
```
public/
  └── photos/
      ├── canon-ezekiel.jpg
      ├── beldinah-indieka.jpg
      ├── edward-ohare.jpg
      └── agnes-ohare.jpg
```

### Step 2: Update familyData.json

1. Open `src/data/familyData.json`
2. Find the person's entry by searching for their `id`
3. Update their `photo` field with the new path

**Example:**

```json
{
  "id": "ezekiel-orodho",
  "name": "Canon Ezekiel Orodho",
  "photo": "/photos/canon-ezekiel.jpg",  ← Update this line
  ...
}
```

**Important:**
- Path must start with `/photos/`
- Use the exact filename (case-sensitive!)
- Common formats: `.jpg`, `.jpeg`, `.png`, `.gif`

### Step 3: Deploy to Netlify

**Option A: Automatic (via GitHub)**
1. Commit your changes:
   ```bash
   git add public/photos/
   git add src/data/familyData.json
   git commit -m "Add photo for John Smith"
   git push origin main
   ```
2. Netlify automatically rebuilds (2-3 minutes)
3. Visit your site - photo is live!

**Option B: Manual (via Netlify Dashboard)**
1. Go to Netlify dashboard
2. Click "Deploys" → "Trigger deploy" → "Deploy site"
3. Wait 2-3 minutes
4. Visit your site

---

## 📋 Quick Reference

### Photo Naming Best Practices

✅ **Good names:**
- `john-aluko.jpg`
- `mary-ohare.png`
- `ezekiel-orodho-2023.jpg`

❌ **Avoid:**
- `Photo 123.jpg` (spaces)
- `MOM's Picture.PNG` (apostrophes, caps)
- `photo-with-very-long-name-that-is-hard-to-remember.jpg`

### Recommended Photo Sizes

- **Minimum:** 200x200 pixels
- **Recommended:** 400x400 pixels
- **Maximum:** 1000x1000 pixels (larger = slower loading)
- **File size:** Keep under 500KB per photo

### Photo Optimization Tips

Before uploading, optimize photos to load faster:

1. **Use an online compressor:**
   - https://tinypng.com (PNG files)
   - https://compressjpeg.com (JPEG files)

2. **Crop to square:**
   - Photos display as circles in the tree
   - Square images (1:1 ratio) work best

3. **Save for web:**
   - Quality: 80-85% is perfect
   - Format: JPEG for photos, PNG for graphics

---

## 🔍 Finding a Person's ID in familyData.json

### Method 1: Search by Name
1. Open `src/data/familyData.json`
2. Press `Ctrl + F` (or `Cmd + F` on Mac)
3. Search for the person's name
4. Look for the `"id"` field above their name

### Method 2: Check the Browser
1. Run the app locally: `npm run dev`
2. Click on the person's card
3. Open browser console (F12)
4. Type: `person.id` (in React DevTools)

---

## 🎯 Bulk Photo Upload

If you have **many photos** to add:

### Step 1: Prepare All Photos
1. Rename all photos with descriptive names
2. Copy all to `public/photos/` folder

### Step 2: Update JSON
1. Open `src/data/familyData.json`
2. For each person, update the `photo` field
3. Use find & replace to speed up

**Example find & replace:**
- Find: `"placeholder-male.jpg"`
- Replace with actual photo names one by one

### Step 3: Deploy Once
```bash
git add public/photos/ src/data/familyData.json
git commit -m "Add photos for multiple family members"
git push origin main
```

---

## 🐛 Troubleshooting

### Photo Not Showing?

**Check 1: File Location**
- Photo must be in: `public/photos/filename.jpg`
- NOT in: `photos/` or `src/photos/`

**Check 2: Path in JSON**
```json
✅ Correct: "/photos/john-smith.jpg"
❌ Wrong: "photos/john-smith.jpg"
❌ Wrong: "/public/photos/john-smith.jpg"
❌ Wrong: "public/photos/john-smith.jpg"
```

**Check 3: Filename Match**
- JSON path must match actual filename EXACTLY
- Case-sensitive: `John.jpg` ≠ `john.jpg`

**Check 4: Clear Browser Cache**
- Press `Ctrl + Shift + R` (or `Cmd + Shift + R` on Mac)
- Or open in incognito/private window

**Check 5: Verify Deployment**
- Go to Netlify dashboard
- Click "Deploys" → Check latest deploy succeeded
- Look for errors in deploy log

---

## 📝 Example: Complete Photo Addition

Let's add a photo for **Agnes Ohare**:

### 1. Find Agnes in familyData.json
```json
{
  "id": "agnes-ohare",
  "name": "Agnes",
  "photo": "/photos/placeholder-female.jpg",  ← Currently placeholder
  ...
}
```

### 2. Add Photo to Folder
- Copy `agnes-ohare.jpg` to `public/photos/`

### 3. Update JSON
```json
{
  "id": "agnes-ohare",
  "name": "Agnes",
  "photo": "/photos/agnes-ohare.jpg",  ← Updated!
  ...
}
```

### 4. Commit & Push
```bash
git add public/photos/agnes-ohare.jpg
git add src/data/familyData.json
git commit -m "Add photo for Agnes Ohare"
git push origin main
```

### 5. Wait for Netlify
- Netlify rebuilds automatically (2-3 minutes)
- Check your site - Agnes now has a photo!

---

## 💡 Pro Tips

1. **Test Locally First**
   ```bash
   npm run dev
   ```
   View at http://localhost:5173 before deploying

2. **Use Consistent Naming**
   - Pattern: `firstname-lastname.jpg`
   - Example: `john-aluko.jpg`, `mary-ohare.png`

3. **Keep Original Photos**
   - Save uncompressed originals in a separate folder
   - Upload optimized versions to the project

4. **Batch Your Updates**
   - Add 5-10 photos at once
   - One deployment for multiple photos = faster

5. **Document Photo Sources**
   - Keep a note of who provided each photo
   - Helpful for future reference

---

## 📞 Need Help?

If you run into issues:
1. Check this guide first
2. Test locally: `npm run dev`
3. Check browser console (F12) for errors
4. Verify file paths are correct
5. Clear cache and retry

---

**Remember:** After any changes, Netlify automatically rebuilds when you push to GitHub!
