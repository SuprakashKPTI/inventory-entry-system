# GitHub Pages Deployment Guide

## Step-by-Step Instructions

### Step 1: Create GitHub Account (if you don't have one)

1. Go to https://github.com
2. Click "Sign up" in the top-right corner
3. Fill in your details and create account
4. Verify your email address

### Step 2: Create a New Repository

1. Log in to GitHub
2. Click the "+" icon in the top-right corner
3. Select "New repository"
4. Fill in the repository details:
   - **Repository name**: `inventory-entry-system` (or your preferred name)
   - **Description**: Inventory Details Entry System
   - **Public/Private**: Select **Public** (required for free GitHub Pages)
   - **Initialize with README**: Uncheck this (we'll upload our files)
5. Click "Create repository"

### Step 3: Install Git (if not already installed)

1. Download Git from https://git-scm.com/download/win
2. Run the installer
3. Accept default settings during installation
4. Open Command Prompt or PowerShell to verify:
   ```bash
   git --version
   ```

### Step 4: Upload Your Files to GitHub

**Option A: Using Git Command Line (Recommended)**

1. Open Command Prompt or PowerShell
2. Navigate to your project folder:
   ```bash
   cd C:\Users\Suprakash\inventory-entry-page
   ```

3. Initialize Git repository:
   ```bash
   git init
   ```

4. Add all files:
   ```bash
   git add .
   ```

5. Commit your files:
   ```bash
   git commit -m "Initial commit - Inventory Entry System"
   ```

6. Rename branch to main:
   ```bash
   git branch -M main
   ```

7. Add your GitHub repository (replace YOUR_USERNAME with your actual GitHub username):
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/inventory-entry-system.git
   ```

8. Push to GitHub:
   ```bash
   git push -u origin main
   ```

9. GitHub will ask for your credentials:
   - **Username**: Your GitHub username
   - **Password**: Your GitHub personal access token (see Step 5)

**Option B: Using GitHub Website (Easier for beginners)**

1. Go to your new repository on GitHub
2. Click "uploading an existing file" link
3. Drag and drop all files from `C:\Users\Suprakash\inventory-entry-page`
4. Make sure to include the `admin` folder
5. Add a commit message: "Initial commit"
6. Click "Commit changes"

### Step 5: Create Personal Access Token (Required for Git Push)

1. Log in to GitHub
2. Click your profile picture → Settings
3. Scroll down to "Developer settings" (left sidebar, bottom)
4. Click "Personal access tokens" → "Tokens (classic)"
5. Click "Generate new token" → "Generate new token (classic)"
6. Fill in:
   - **Note**: "Inventory System Deployment"
   - **Expiration**: Select "No expiration" or choose a date
   - **Scopes**: Check "repo" (this gives full repository access)
7. Click "Generate token"
8. **IMPORTANT**: Copy the token immediately (you won't see it again!)
9. Use this token as your password when git asks for credentials

### Step 6: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click "Settings" tab (top-right)
3. Click "Pages" in the left sidebar (under "Code and automation")
4. Under "Build and deployment":
   - **Source**: Select "Deploy from a branch"
   - **Branch**: Select `main`
   - **Folder**: Select `/ (root)`
5. Click "Save"

### Step 7: Wait for Deployment

1. GitHub will show a deployment progress indicator
2. Wait 1-2 minutes for deployment to complete
3. You'll see a green checkmark when it's done
4. Your site URL will appear at the top of the Pages settings

### Step 8: Access Your Deployed Site

Your site will be available at:
```
https://YOUR_USERNAME.github.io/inventory-entry-system/
```

**Important URLs:**
- **Landing Page**: `https://YOUR_USERNAME.github.io/inventory-entry-system/landing.html`
- **Entry Login**: `https://YOUR_USERNAME.github.io/inventory-entry-system/entry-login.html`
- **Entry Page**: `https://YOUR_USERNAME.github.io/inventory-entry-system/index.html`
- **Admin Login**: `https://YOUR_USERNAME.github.io/inventory-entry-system/admin/login.html`
- **Admin Panel**: `https://YOUR_USERNAME.github.io/inventory-entry-system/admin/admin.html`

### Step 9: Test Your Deployment

1. **Test Landing Page**:
   - Open your landing page URL
   - Verify both login buttons work

2. **Test Entry Page**:
   - Click "Entry Page Login"
   - Enter your name and password (`User@123`)
   - Verify you're redirected to entry page
   - Check that your name is auto-filled in "Submitted By"
   - Try submitting test data

3. **Test Admin Panel**:
   - Click "Admin Panel Login"
   - Enter password (`Admin@123`)
   - Verify you can access all tabs
   - Try adding test data

4. **Test from Different Browsers**:
   - Open in Chrome, Firefox, Edge
   - Verify everything works

5. **Test from Mobile**:
   - Open on your phone
   - Verify responsive design works

### Step 10: Share with Users

**Share the Landing Page URL:**
```
https://YOUR_USERNAME.github.io/inventory-entry-system/landing.html
```

**Share these credentials with users:**
- **Entry Page Password**: `User@123`
- **Admin Panel Password**: `Admin@123` (share only with admins)

### Step 11: Custom Domain (Optional)

If you want a custom domain (e.g., `inventory.yourcompany.com`):

1. Buy a domain from GoDaddy, Namecheap, etc.
2. Go to your repository → Settings → Pages
3. Click "Custom domain"
4. Enter your domain name
5. Update DNS records as instructed by GitHub
6. Wait for DNS propagation (can take 24-48 hours)

### Step 12: Update Documentation

Update your README with the actual deployed URLs:
- Replace placeholder URLs with your actual GitHub Pages URLs
- Share the landing page URL with your team

## Troubleshooting

### Issue: Git push asks for password but token doesn't work
**Solution**: Make sure you're using the correct token and that you have "repo" scope selected

### Issue: 404 error when accessing site
**Solution**: 
- Wait a few more minutes for deployment
- Check that you selected the correct branch in Pages settings
- Verify files are actually in the repository

### Issue: CSS or JavaScript not loading
**Solution**: 
- Clear browser cache
- Check that file paths are correct
- Verify all files were uploaded (including admin folder)

### Issue: Login not working
**Solution**: 
- Check that you're accessing the correct URLs
- Verify session storage is enabled in browser
- Try incognito/private browsing mode

### Issue: Data not saving across sessions
**Solution**: 
- This is expected with localStorage (browser-specific)
- Each user will have their own data
- For shared data, you need a backend (see README for options)

## Security Notes

⚠️ **Important Security Warnings:**

1. **Client-side passwords**: Current passwords are in JavaScript files. Anyone can view source to see them. For production, implement server-side authentication.

2. **localStorage limitations**: Data is stored in browser localStorage, not shared between users. Each user sees their own data only.

3. **Public repository**: Your code is publicly visible on GitHub. Don't commit sensitive information.

4. **HTTPS**: GitHub Pages provides HTTPS automatically, which is good for security.

## Next Steps for Production

For a production-ready system with shared data:

1. **Implement a backend** (Node.js, Python, PHP)
2. **Use a database** (PostgreSQL, MySQL, MongoDB)
3. **Server-side authentication** (JWT, OAuth)
4. **Centralized data storage**
5. **Consider cloud hosting** (AWS, Azure, Google Cloud)

## Support

For GitHub Pages issues:
- GitHub Pages Documentation: https://docs.github.com/en/pages
- GitHub Support: https://support.github.com

For application issues:
- Check the debug.html tool
- Review browser console for errors
- Check this deployment guide
