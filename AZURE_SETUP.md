# Azure AD App Registration Guide (Microsoft Graph API)

## Overview

This guide will walk you through registering an Azure AD application to authenticate with Microsoft Graph API for accessing SharePoint data from GitHub Pages.

## Prerequisites

- Azure AD tenant (you already have this with your SharePoint site)
- Admin access to Azure Portal
- SharePoint site: `https://kcptco.sharepoint.com/sites/YGSpikeplanning`

## Step-by-Step Instructions

### Step 1: Access Azure Portal

1. Go to https://portal.azure.com
2. Login with your Microsoft account (the same one used for SharePoint)
3. You should see your tenant: `kcptco.sharepoint.com`

### Step 2: Register a New Application

1. In Azure Portal, search for and click **"App registrations"**
2. Click **"New registration"**
3. Fill in the registration form:
   - **Name**: `Inventory Entry System`
   - **Supported account types**: Select "Accounts in this organizational directory only" (Single tenant)
   - **Redirect URI (optional)**: Leave blank for now
4. Click **"Register"**

### Step 3: Get Application Details

After registration, you'll see:
- **Application (client) ID**: Copy this (you'll need it)
- **Directory (tenant) ID**: Copy this (you'll need it)
- Save both IDs somewhere safe

### Step 4: Create Client Secret

1. In the app registration page, click **"Certificates & secrets"** in the left menu
2. Click **"New client secret"**
3. Fill in:
   - **Description**: `Inventory System Client Secret`
   - **Expires**: Select "180 days" or "Custom"
4. Click **"Add"**
5. **IMPORTANT**: Copy the **Value** (not the Secret ID) - you won't see it again!
6. Save this client secret securely

### Step 5: Configure Microsoft Graph API Permissions

1. Click **"API permissions"** in the left menu
2. Click **"Add a permission"**
3. Select **"Microsoft Graph"** → "Application permissions"
4. Search for and check these permissions:
   - `Sites.Read.All` (Read access to all SharePoint sites)
   - `Sites.ReadWrite.All` (Read and write access to all SharePoint sites)
5. Click **"Add permissions"**
6. Click **"Grant admin consent for [your organization]"** button
7. Confirm the consent dialog

**Note**: Microsoft Graph API has better CORS support than SharePoint REST API, allowing external access from GitHub Pages without complex CORS configuration.

### Step 6: Copy Your Credentials

You should now have:
- **Client ID**: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
- **Tenant ID**: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
- **Client Secret**: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Step 7: Configure the Application

Update the `azure-config.js` file with your credentials:

```javascript
const AZURE_CONFIG = {
    clientId: 'YOUR_CLIENT_ID_HERE',
    tenantId: 'YOUR_TENANT_ID_HERE',
    clientSecret: 'YOUR_CLIENT_SECRET_HERE',
    siteUrl: 'https://kcptco.sharepoint.com/sites/YGSpikeplanning'
};
```

Replace:
- `YOUR_CLIENT_ID_HERE` with your Application (client) ID
- `YOUR_TENANT_ID_HERE` with your Directory (tenant) ID
- `YOUR_CLIENT_SECRET_HERE` with your client secret

### Step 8: Create SharePoint Lists

In your SharePoint site, create these lists with the specified columns (follow `SHAREPOINT_LISTS.md` for detailed instructions):

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

### Step 9: Test the Connection

After configuration, the application will:
1. Authenticate with Azure AD using the credentials
2. Get an access token for Microsoft Graph API
3. Call Microsoft Graph API to access SharePoint lists
4. Store all data in SharePoint lists
5. Allow users to access from anywhere via GitHub Pages

## Why Microsoft Graph API?

**Advantages over SharePoint REST API:**

1. **Better CORS Support**: Microsoft Graph API is designed for cross-origin requests, working seamlessly with GitHub Pages
2. **Modern API**: Microsoft's recommended way to access SharePoint data
3. **Unified Endpoint**: Single API endpoint for all Microsoft 365 services
4. **Better Documentation**: Comprehensive documentation and SDKs
5. **Future-Proof**: Actively maintained and updated by Microsoft

**No CORS Configuration Needed**: Unlike SharePoint REST API, Microsoft Graph API doesn't require CORS configuration in SharePoint.

## Security Notes

⚠️ **Important Security Considerations:**

1. **Client Secret Security**: Never commit the client secret to GitHub! Use environment variables or a separate config file that's not committed.

2. **Permissions**: The app has `Sites.ReadWrite.All` - this is powerful. Consider limiting to specific site if possible.

3. **HTTPS**: Always use HTTPS for API calls (GitHub Pages provides this automatically).

4. **Secrets Management**: In production, consider using Azure Key Vault for secret management.

## Troubleshooting

### Error: "AADSTS700016: Application with identifier... was not found"
**Solution**: Verify the client ID is correct and the app is registered in the correct tenant.

### Error: "401 Unauthorized"
**Solution**: Check that the client secret is correct and hasn't expired.

### Error: "403 Forbidden"
**Solution**: Verify Microsoft Graph API permissions are granted and admin consent is given.

### Error: "CORS policy"
**Solution**: Microsoft Graph API should handle CORS automatically. If you still see CORS errors, verify the API permissions include the correct scope.

### Error: "404 Not Found"
**Solution**: Verify the SharePoint list names match exactly (case-sensitive) and the site URL is correct.

### Error: "Site not found"
**Solution**: Ensure the SharePoint site URL in `azure-config.js` is correct and accessible.

## Next Steps

After completing these steps:
1. Update `azure-config.js` with your credentials
2. Create the SharePoint lists (follow `SHAREPOINT_LISTS.md`)
3. Test the API connection
4. Deploy to GitHub Pages
5. Test data submission to SharePoint

## Support

For Azure AD issues:
- Azure Portal Documentation: https://docs.microsoft.com/en-us/azure/
- Azure AD Documentation: https://docs.microsoft.com/en-us/azure/active-directory/

For Microsoft Graph API issues:
- Microsoft Graph Documentation: https://docs.microsoft.com/en-us/graph/
- Microsoft Graph Explorer: https://developer.microsoft.com/en-us/graph/graph-explorer
