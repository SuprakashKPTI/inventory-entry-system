# Deployment Guide

## Option 1: GitHub Pages (Recommended, Free)

### Step 1: Create GitHub Repository
1. Go to https://github.com
2. Click "+" → "New repository"
3. Name: `inventory-entry-system`
4. Make it Public
5. Click "Create repository"

### Step 2: Upload Files
```bash
# Navigate to your project folder
cd C:\Users\Suprakash\inventory-entry-page

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Rename branch to main
git branch -M main

# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/inventory-entry-system.git

# Push to GitHub
git push -u origin main
```

### Step 3: Enable GitHub Pages
1. Go to your repository on GitHub
2. Click "Settings" (top right)
3. Click "Pages" (left sidebar)
4. Under "Build and deployment" → "Source":
   - Select "Deploy from a branch"
   - Branch: `main`
   - Folder: `/ (root)`
5. Click "Save"

### Step 4: Access Your Site
- Wait 1-2 minutes for deployment
- Your site will be at: `https://YOUR_USERNAME.github.io/inventory-entry-system/`

## Option 2: Netlify (Easiest, Free)

### Step 1: Sign Up
1. Go to https://netlify.com
2. Sign up for free account

### Step 2: Deploy
1. Log in to Netlify
2. Click "Add new site" → "Deploy manually"
3. Drag and drop the `inventory-entry-page` folder
4. Wait for deployment (30 seconds)
5. Your site will be live with a URL like: `https://random-name.netlify.app`

### Step 3: Custom Domain (Optional)
1. Go to Site settings → Domain management
2. Add custom domain
3. Update DNS records

## Option 3: Vercel (Fast, Free)

### Step 1: Install Vercel CLI
```bash
npm i -g vercel
```

### Step 2: Deploy
```bash
cd C:\Users\Suprakash\inventory-entry-page
vercel
```

Follow the prompts and your site will be live!

## SharePoint Embedding

### Method 1: Embed Web Part
1. Go to your SharePoint page
2. Click "Edit"
3. Click "+" → "Embed"
4. Paste your landing page URL (e.g., `https://your-site.com/landing.html`)
5. Click "Edit" to adjust size
6. Save the page

### Method 2: Page Viewer Web Part
1. Edit SharePoint page
2. Add "Page Viewer" web part
3. Enter your landing page URL
4. Save

**Note:** Embed the landing page URL, not the entry page directly, so users can go through the login process.

## Important Notes

### ⚠️ Security Warning
- Current password is client-side only (not secure for production)
- Anyone can view source to see the password
- For production, implement server-side authentication

### ⚠️ Data Persistence
- Current implementation uses localStorage (browser-specific)
- Data is NOT shared between users
- Each user sees their own data only
- For multi-user access, implement a backend database

### Recommended Production Stack
- **Backend:** Node.js, Python (Flask/Django), or PHP
- **Database:** PostgreSQL, MySQL, or MongoDB
- **Authentication:** JWT or OAuth
- **Hosting:** AWS, Azure, or Google Cloud Platform

### Testing Before Rollout
1. Test from different browsers
2. Test from different devices
3. Test SharePoint embedding
4. Test with multiple users
5. Verify data persistence behavior

## URL Examples

After deployment, your URLs will look like:

**GitHub Pages:**
```
https://username.github.io/inventory-entry-system/landing.html
https://username.github.io/inventory-entry-system/entry-login.html
https://username.github.io/inventory-entry-system/index.html
https://username.github.io/inventory-entry-system/admin/login.html
```

**Netlify:**
```
https://your-site-name.netlify.app/landing.html
https://your-site-name.netlify.app/entry-login.html
https://your-site-name.netlify.app/index.html
https://your-site-name.netlify.app/admin/login.html
```

**Vercel:**
```
https://your-site-name.vercel.app/landing.html
https://your-site-name.vercel.app/entry-login.html
https://your-site-name.vercel.app/index.html
https://your-site-name.vercel.app/admin/login.html
```

## Support

For issues with:
- **GitHub Pages:** https://docs.github.com/en/pages
- **Netlify:** https://docs.netlify.com
- **Vercel:** https://vercel.com/docs
- **SharePoint:** Your SharePoint administrator
