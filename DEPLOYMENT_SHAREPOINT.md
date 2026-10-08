# SharePoint Integration Deployment Guide

## Overview

This guide provides step-by-step instructions to deploy the inventory entry system with SharePoint integration for centralized cloud storage.

## Prerequisites

- GitHub account
- Azure AD tenant (included with your SharePoint site)
- SharePoint site: `https://kcptco.sharepoint.com/sites/YGSpikeplanning`
- Admin access to Azure Portal and SharePoint

## Architecture Note

This application uses **Microsoft Graph API** to access SharePoint data. Microsoft Graph API has better CORS support than SharePoint REST API, allowing external access from GitHub Pages without complex CORS configuration.

## Phase 1: Azure AD Configuration (30-45 minutes)

### Step 1: Register Azure AD Application

1. Go to https://portal.azure.com
2. Login with your Microsoft account
3. Search for and click **"App registrations"**
4. Click **"New registration"**
5. Fill in:
   - **Name**: `Inventory Entry System`
   - **Supported account types**: "Accounts in this organizational directory only"
   - **Redirect URI**: Leave blank
6. Click **"Register"**

### Step 2: Get Application IDs

After registration, copy and save:
- **Application (client) ID**: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
- **Directory (tenant) ID**: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

### Step 3: Create Client Secret

1. In the app registration, click **"Certificates & secrets"**
2. Click **"New client secret"**
3. Fill in:
   - **Description**: `Inventory System Client Secret`
   - **Expires**: "180 days" or longer
4. Click **"Add"**
5. **IMPORTANT**: Copy the **Value** (not Secret ID) - you won't see it again!
6. Save this client secret securely

### Step 4: Configure Microsoft Graph API Permissions

1. Click **"API permissions"**
2. Click **"Add a permission"**
3. Select **"Microsoft Graph"** → "Application permissions"
4. Search for and check:
   - `Sites.Read.All`
   - `Sites.ReadWrite.All`
5. Click **"Add permissions"**
6. Click **"Grant admin consent for [your organization]"**
7. Confirm the consent dialog

**Note**: Microsoft Graph API is used instead of SharePoint REST API for better CORS support from GitHub Pages.

## Phase 2: SharePoint List Creation (20-30 minutes)

Follow `SHAREPOINT_LISTS.md` to create these lists in your SharePoint site:

### Required Lists

1. **InventoryItems**
   - ItemID (Single line of text, required)
   - Description (Multiple lines of text)
   - Grade (Single line of text)

2. **Customers**
   - CustomerCode (Single line of text, required)
   - CustomerName (Single line of text)
   - Region (Choice: South West, North East, North West, South East, Central)

3. **BookingData**
   - CustomerCode (Single line of text, required)
   - ItemID (Single line of text, required)
   - AverageBooking (Number, 0 decimal places)

4. **ShippingData**
   - CustomerCode (Single line of text, required)
   - ItemID (Single line of text, required)
   - AverageShipping (Number, 0 decimal places)

5. **SpikeData**
   - CustomerCode (Single line of text, required)
   - ItemID (Single line of text, required)
   - Month1 (Number, 0 decimal places)
   - Month2 (Number, 0 decimal places)
   - Month3 (Number, 0 decimal places)
   - TotalSpike (Calculated column: Month1 + Month2 + Month3)
   - SubmitDate (Date and Time)
   - UserName (Single line of text)
   - Region (Single line of text)

## Phase 3: Configure Application Credentials (5 minutes)

1. Open `azure-config.js` in your project
2. Replace placeholder values with your actual credentials:

```javascript
const AZURE_CONFIG = {
    clientId: 'YOUR_ACTUAL_CLIENT_ID_HERE',
    tenantId: 'YOUR_ACTUAL_TENANT_ID_HERE',
    clientSecret: 'YOUR_ACTUAL_CLIENT_SECRET_HERE',
    siteUrl: 'https://kcptco.sharepoint.com/sites/YGSpikeplanning'
};
```

3. **IMPORTANT**: Never commit this file with real credentials to public GitHub!
4. Add `azure-config.js` to `.gitignore` to prevent accidental commits

## Phase 4: Deploy to GitHub Pages (15-30 minutes)

### Step 1: Initialize Git Repository

```bash
cd C:\Users\Suprakash\inventory-entry-page
git init
git add .
git commit -m "Initial commit with SharePoint integration"
git branch -M main
```

### Step 2: Create GitHub Repository

1. Go to https://github.com
2. Click **"New repository"**
3. Name: `inventory-system`
4. Make it **Public** (required for free GitHub Pages)
5. Click **"Create repository"**

### Step 3: Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/inventory-system.git
git push -u origin main
```

**Note**: You may need to create a Personal Access Token for authentication:
- Go to GitHub Settings → Developer settings → Personal access tokens
- Generate new token with `repo` scope
- Use token as password when prompted

### Step 4: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages** (left sidebar)
3. Under "Source", select:
   - Branch: `main`
   - Folder: `/ (root)`
4. Click **"Save"**
5. Wait 1-2 minutes for deployment
6. Your site will be available at: `https://YOUR_USERNAME.github.io/inventory-system/`

## Phase 5: Test the Integration (15-20 minutes)

### Test 1: Access the Application

1. Open: `https://YOUR_USERNAME.github.io/inventory-system/landing.html`
2. Click "Entry Page Login"
3. Login with:
   - Name: Your name
   - Password: `User@123`
4. Verify entry page loads

### Test 2: Admin Panel Access

1. Open: `https://YOUR_USERNAME.github.io/inventory-system/admin/login.html`
2. Login with password: `Admin@123`
3. Verify admin panel loads

### Test 3: SharePoint Connection

1. In admin panel, go to "Items" tab
2. Add a test item:
   - ItemID: `TEST001`
   - Description: `Test Item`
   - Grade: `A`
3. Click "Add Item"
4. Check if item appears in table
5. Check SharePoint "InventoryItems" list to verify data was saved

### Test 4: Entry Page Data Submission

1. In admin panel, add a test customer
2. Add booking/shipping data for that customer
3. Open submission window
4. Go to entry page
5. Select the customer
6. Fill in spike values
7. Click "Submit Data"
8. Check SharePoint "SpikeData" list to verify submission

### Test 5: Error Handling

1. Temporarily break Azure credentials (change clientId to invalid value)
2. Try to submit data
3. Verify fallback to localStorage works
4. Restore correct credentials
5. Verify SharePoint connection works again

## Phase 6: Embed in SharePoint (5 minutes)

1. Go to your SharePoint page where you want to embed
2. Click **Edit** → **Add web part** → **"Embed"**
3. Paste: `https://YOUR_USERNAME.github.io/inventory-system/landing.html`
4. Adjust width/height as needed
5. Click **Save**

## Security Considerations

### ⚠️ Critical Security Notes

1. **Client Secret Protection**
   - Never commit `azure-config.js` with real credentials
   - Add to `.gitignore`
   - Consider using environment variables in production
   - Rotate secrets regularly

2. **API Permissions**
   - The app has `Sites.ReadWrite.All` - very powerful
   - Consider limiting to specific site if possible
   - Monitor usage in Azure Portal

3. **HTTPS Required**
   - GitHub Pages provides HTTPS automatically
   - SharePoint requires HTTPS for API calls
   - Never use HTTP in production

4. **Password Security**
   - Current passwords are client-side (not production-secure)
   - Consider implementing server-side authentication
   - Use Azure AD authentication for production

## Troubleshooting

### Error: "AADSTS700016: Application not found"
**Solution**: Verify clientId is correct and app is registered in correct tenant

### Error: "401 Unauthorized"
**Solution**: Check client secret is correct and hasn't expired

### Error: "403 Forbidden"
**Solution**: Verify API permissions are granted and admin consent is given

### Error: "CORS policy"
**Solution**: Microsoft Graph API should handle CORS automatically. If you still see CORS errors, verify the API permissions include the correct scope and that you're using HTTPS.

### Error: "404 Not Found"
**Solution**: Verify SharePoint list names match exactly (case-sensitive)

### Error: "SharePoint connection failed"
**Solution**: Check browser console for detailed error messages, verify credentials

## Maintenance

### Regular Tasks

1. **Rotate Client Secrets** (every 180 days)
   - Create new client secret in Azure AD
   - Update `azure-config.js`
   - Deploy updated file

2. **Monitor API Usage**
   - Check Azure Portal for API call statistics
   - Monitor for unusual activity

3. **Backup Data**
   - Regularly export SharePoint lists
   - Keep offline backups

4. **Update Application**
   - Test changes in development environment
   - Deploy to GitHub Pages
   - Verify functionality

## Next Steps

After successful deployment:

1. **User Training**
   - Train users on login process
   - Explain data submission workflow
   - Provide troubleshooting guide

2. **Monitor Usage**
   - Track user adoption
   - Monitor data quality
   - Collect feedback

3. **Enhancements**
   - Consider Azure AD user authentication
   - Add data validation rules
   - Implement approval workflows

## Support

For issues with:
- **Azure AD**: https://docs.microsoft.com/en-us/azure/active-directory/
- **SharePoint API**: https://docs.microsoft.com/en-us/sharepoint/dev/sp-add-ins/rest-api/
- **GitHub Pages**: https://docs.github.com/en/pages

## Success Criteria

✅ Azure AD app registered and configured
✅ SharePoint lists created with correct schema
✅ CORS configured in SharePoint
✅ Credentials configured in azure-config.js
✅ Application deployed to GitHub Pages
✅ SharePoint connection verified
✅ Data submission tested
✅ Embedded in SharePoint
✅ Error handling verified
✅ Users can access from anywhere

Congratulations! Your inventory entry system is now live with centralized SharePoint storage!
