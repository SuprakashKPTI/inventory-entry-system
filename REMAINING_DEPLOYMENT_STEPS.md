# Remaining Deployment Steps - After Lists & Config

## ✅ Completed
- [x] SharePoint Lists created
- [x] azure-config.js configured with credentials

## 🔄 Remaining Steps

### Phase 1: Azure AD Registration (30-45 minutes)

**Purpose**: Register Azure AD application to authenticate with Microsoft Graph API

#### Step 1: Access Azure Portal
1. Go to https://portal.azure.com
2. Login with your Microsoft account (same one used for SharePoint)
3. You should see your tenant: `kcptco.sharepoint.com`

#### Step 2: Register Application
1. Search for and click **"App registrations"**
2. Click **"New registration"**
3. Fill in:
   - **Name**: `Inventory Entry System`
   - **Supported account types**: "Accounts in this organizational directory only" (Single tenant)
   - **Redirect URI**: Leave blank
4. Click **"Register"**

#### Step 3: Copy Application IDs
After registration, you'll see:
- **Application (client) ID**: Copy this → `YOUR_CLIENT_ID_HERE`
- **Directory (tenant) ID**: Copy this → `YOUR_TENANT_ID_HERE`

**Save both IDs somewhere safe!**

#### Step 4: Create Client Secret
1. Click **"Certificates & secrets"** in left menu
2. Click **"New client secret"**
3. Fill in:
   - **Description**: `Inventory System Client Secret`
   - **Expires**: "180 days" or longer
4. Click **"Add"**
5. **IMPORTANT**: Copy the **Value** (not Secret ID) → `YOUR_CLIENT_SECRET_HERE`
6. **You won't see it again!** Save it securely.

#### Step 5: Configure Microsoft Graph API Permissions
1. Click **"API permissions"** in left menu
2. Click **"Add a permission"**
3. Select **"Microsoft Graph"** → "Application permissions"
4. Search for and check:
   - `Sites.Read.All`
   - `Sites.ReadWrite.All`
5. Click **"Add permissions"**
6. Click **"Grant admin consent for [your organization]"**
7. Confirm the consent dialog

#### Step 6: Update azure-config.js with Real Credentials
Open `azure-config.js` and replace placeholders:

```javascript
const AZURE_CONFIG = {
    clientId: 'YOUR_ACTUAL_CLIENT_ID_HERE',        // Paste from Step 3
    tenantId: 'YOUR_ACTUAL_TENANT_ID_HERE',        // Paste from Step 3
    clientSecret: 'YOUR_ACTUAL_CLIENT_SECRET_HERE', // Paste from Step 4
    siteUrl: 'https://kcptco.sharepoint.com/sites/YGSpikeplanning'
};
```

**Verify:**
- Client ID matches what you copied
- Tenant ID matches what you copied
- Client Secret matches what you copied
- Site URL is correct

#### Step 7: Verify Azure AD Setup
1. Go to your app registration in Azure Portal
2. Check "Overview" - you should see:
   - Application (client) ID
   - Directory (tenant) ID
3. Check "Certificates & secrets" - you should see your client secret
4. Check "API permissions" - you should see:
   - Microsoft Graph: Sites.Read.All (Granted)
   - Microsoft Graph: Sites.ReadWrite.All (Granted)

---

### Phase 2: Deploy to GitHub Pages (15-30 minutes)

**Purpose**: Host the application on GitHub Pages for external access

#### Step 1: Initialize Git Repository
Open command prompt/PowerShell:

```bash
cd C:\Users\Suprakash\inventory-entry-page
git init
git add .
git commit -m "Initial commit with Microsoft Graph API integration"
git branch -M main
```

#### Step 2: Create GitHub Repository
1. Go to https://github.com
2. Click **"New repository"**
3. Fill in:
   - **Repository name**: `inventory-system`
   - **Description**: `Inventory entry system with SharePoint integration`
   - **Public**: ✅ (Required for free GitHub Pages)
   - **Initialize with README**: ❌ (Uncheck)
4. Click **"Create repository"**

#### Step 3: Push to GitHub
You may need a Personal Access Token:

**Create Personal Access Token:**
1. Go to GitHub → Settings → Developer settings → Personal access tokens
2. Click **"Generate new token"**
3. Select scopes: `repo` (full control of repositories)
4. Click **"Generate token"**
5. **Copy the token** - you won't see it again!

**Push to GitHub:**
```bash
git remote add origin https://github.com/YOUR_USERNAME/inventory-system.git
git push -u origin main
```

When prompted for password:
- **Username**: Your GitHub username
- **Password**: The Personal Access Token you just created

#### Step 4: Enable GitHub Pages
1. Go to your repository on GitHub
2. Click **"Settings"** (top navigation)
3. Click **"Pages"** (left sidebar)
4. Under "Source":
   - Branch: `main`
   - Folder: `/ (root)`
5. Click **"Save"**
6. Wait 1-2 minutes for deployment
7. Refresh the page - you'll see your site URL:
   ```
   https://YOUR_USERNAME.github.io/inventory-system/
   ```

#### Step 5: Verify Deployment
1. Open: `https://YOUR_USERNAME.github.io/inventory-system/landing.html`
2. You should see the landing page
3. Click "Entry Page Login" → should open login page
4. Click "Admin Panel Login" → should open admin login

---

### Phase 3: Test the Integration (15-20 minutes)

**Purpose**: Verify Microsoft Graph API connection works

#### Test 1: Admin Panel - Add Item
1. Open: `https://YOUR_USERNAME.github.io/inventory-system/admin/login.html`
2. Login with password: `Admin@123`
3. Go to "Items" tab
4. Add a test item:
   - ItemID: `TEST001`
   - Description: `Test Item via Graph API`
   - Grade: `A`
5. Click "Add Item"
6. **Expected**: Item appears in table

#### Test 2: Verify in SharePoint
1. Go to your SharePoint site
2. Open "InventoryItems" list
3. **Expected**: You should see the TEST001 item you just added
4. **This confirms Graph API is working!**

#### Test 3: Entry Page - Submit Data
1. Open: `https://YOUR_USERNAME.github.io/inventory-system/entry-login.html`
2. Login:
   - Name: `Test User`
   - Password: `User@123`
3. Open submission window in admin panel first
4. In entry page, select a customer
5. Fill in spike values
6. Click "Submit Data"
7. **Expected**: Success message

#### Test 4: Verify Spike Data in SharePoint
1. Go to SharePoint "SpikeData" list
2. **Expected**: You should see the spike submission
3. **This confirms data submission works!**

#### Test 5: Error Handling (Optional)
1. Temporarily break credentials in azure-config.js (change clientId to invalid)
2. Try to submit data
3. **Expected**: Falls back to localStorage with alert
4. Restore correct credentials
5. **Expected**: SharePoint connection works again

---

### Phase 4: Embed in SharePoint (5 minutes)

**Purpose**: Display the application within SharePoint

#### Step 1: Go to SharePoint Page
1. Navigate to the SharePoint page where you want to embed
2. Click **"Edit"** (if page is not in edit mode)

#### Step 2: Add Embed Web Part
1. Click **"+"** (Add web part)
2. Search for **"Embed"**
3. Click **"Embed"**

#### Step 3: Add URL
1. Paste your GitHub Pages URL:
   ```
   https://YOUR_USERNAME.github.io/inventory-system/landing.html
   ```
2. Adjust width/height as needed
3. Click **"Apply"**

#### Step 4: Save and Test
1. Click **"Save"** or **"Publish"**
2. Test the embedded application
3. Verify all functionality works

---

## Troubleshooting

### Azure AD Issues

**Error: "AADSTS700016: Application not found"**
- Verify clientId is correct
- Verify app is registered in correct tenant

**Error: "401 Unauthorized"**
- Check client secret is correct
- Check client secret hasn't expired
- Verify tenant ID is correct

**Error: "403 Forbidden"**
- Verify Microsoft Graph permissions are granted
- Check admin consent was given
- Verify permissions include `Sites.ReadWrite.All`

### GitHub Deployment Issues

**Error: "Authentication failed"**
- Create a Personal Access Token
- Use token as password (not your GitHub password)
- Verify token has `repo` scope

**Error: "Page not found"**
- Wait 2-3 minutes for GitHub Pages to deploy
- Check repository Settings → Pages is enabled
- Verify branch is `main` and folder is `/ (root)`

### Microsoft Graph API Issues

**Error: "Site not found"**
- Verify siteUrl in azure-config.js is correct
- Check SharePoint site is accessible
- Verify you have permission to access the site

**Error: "List not found"**
- Verify list names match exactly (case-sensitive)
- Check lists exist in SharePoint
- Verify list names: InventoryItems, Customers, BookingData, ShippingData, SpikeData

**Error: "CORS policy"**
- Microsoft Graph API should handle CORS automatically
- Verify you're using HTTPS
- Check browser console for specific error

---

## Success Criteria

✅ Azure AD app registered
✅ Client ID, Tenant ID, Client Secret obtained
✅ Microsoft Graph permissions granted
✅ azure-config.js updated with real credentials
✅ Application deployed to GitHub Pages
✅ Landing page accessible
✅ Admin panel accessible
✅ Entry page accessible
✅ Data saves to SharePoint via Graph API
✅ Data visible in SharePoint lists
✅ Application embedded in SharePoint

---

## Estimated Total Time

- Azure AD Registration: 30-45 minutes
- GitHub Deployment: 15-30 minutes
- Testing: 15-20 minutes
- SharePoint Embedding: 5 minutes
- **Total: 65-100 minutes (1-1.5 hours)**

---

## Next Steps After Deployment

1. **User Training**
   - Train users on login process
   - Explain data submission workflow
   - Provide credentials (User@123 for users, Admin@123 for admins)

2. **Monitor Usage**
   - Track user adoption
   - Monitor data quality
   - Check SharePoint lists regularly

3. **Maintenance**
   - Rotate client secrets every 180 days
   - Monitor Azure AD usage
   - Keep SharePoint lists organized

4. **Enhancements**
   - Consider Azure AD user authentication (individual logins)
   - Add data validation rules
   - Implement approval workflows

---

You're almost there! Follow these steps and your inventory entry system will be live with centralized SharePoint storage accessible from anywhere! 🚀
