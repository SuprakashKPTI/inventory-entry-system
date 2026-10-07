# Azure AD App Registration Guide

## Overview

This guide will walk you through registering an Azure AD application to authenticate with SharePoint REST API for external access.

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

### Step 5: Configure API Permissions

1. Click **"API permissions"** in the left menu
2. Click **"Add a permission"**
3. Select **"Microsoft Graph"** → "Application permissions"
4. Skip Graph for now (we'll use SharePoint permissions)
5. Click **"Add a permission"** again
6. Select **"SharePoint"** → "Application permissions"
7. Search for and check these permissions:
   - `Sites.Read.All` (Read access to all sites)
   - `Sites.ReadWrite.All` (Read and write access to all sites)
8. Click **"Add permissions"**
9. Click **"Grant admin consent for [your organization]"** button
10. Confirm the consent dialog

### Step 6: Copy Your Credentials

You should now have:
- **Client ID**: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
- **Tenant ID**: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
- **Client Secret**: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Step 7: Configure CORS in SharePoint

**For GitHub Pages to call SharePoint API:**

1. Go to your SharePoint site: `https://kcptco.sharepoint.com/sites/YGSpikeplanning`
2. Click **Settings** (gear icon) → **Site Settings**
3. Click **"Manage API access"**
4. Under **"Cross-origin requests"**, click **"Add"**
5. Add your GitHub Pages URL: `https://YOUR_USERNAME.github.io/inventory-system`
6. Add these allowed headers:
   - `Authorization`
   - `Content-Type`
   - `Accept`
7. Click **"Save"**

### Step 8: Configure the Application

Update the `sharepoint-api.js` file with your credentials:

```javascript
const SHAREPOINT_CONFIG = {
    siteUrl: 'https://kcptco.sharepoint.com/sites/YGSpikeplanning',
    lists: {
        items: 'InventoryItems',
        customers: 'Customers',
        bookingData: 'BookingData',
        shippingData: 'ShippingData',
        spikeData: 'SpikeData'
    },
    azure: {
        clientId: 'YOUR_CLIENT_ID_HERE',
        tenantId: 'YOUR_TENANT_ID_HERE',
        redirectUri: window.location.origin + '/index.html'
    }
};
```

Replace:
- `YOUR_CLIENT_ID_HERE` with your Application (client) ID
- `YOUR_TENANT_ID_HERE` with your Directory (tenant) ID

## Step 9: Create SharePoint Lists

In your SharePoint site, create these lists with the specified columns:

### 1. InventoryItems List
- List Name: `InventoryItems`
- Columns:
  - ItemID (Single line of text, required)
  - Description (Multiple lines of text)
  - Grade (Single line of text)

### 2. Customers List
- List Name: `Customers`
- Columns:
  - CustomerCode (Single line of text, required)
  - CustomerName (Single line of text)
  - Region (Choice: South West, North East, North West, South East, Central)

### 3. BookingData List
- List Name: `BookingData`
- Columns:
  - CustomerCode (Single line of text, required)
  - ItemID (Single line of text, required)
  - AverageBooking (Number, 0 decimal places)

### 4. ShippingData List
- List Name: `ShippingData`
- Columns:
  - CustomerCode (Single line of text, required)
  - ItemID (Single line of text, required)
  - AverageShipping (Number, 0 decimal places)

### 5. SpikeData List
- List Name: `SpikeData`
- Columns:
  - CustomerCode (Single line of text, required)
  - ItemID (Single line of text, required)
  - Month1 (Number, 0 decimal places)
  - Month2 (Number, 0 decimal places)
  - Month3 (Number, 0 decimal places)
  - TotalSpike (Calculated column: Month1 + Month2 + Month3)
  - SubmitDate (Date and Time)
  - UserName (Single line of text)
  - Region (Single line of text)

## Step 10: Test the Connection

After configuration, the application will:
1. Authenticate with Azure AD using the credentials
2. Get an access token
3. Call SharePoint REST API
4. Store all data in SharePoint lists
5. Allow users to access from anywhere via GitHub Pages

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
**Solution**: Verify API permissions are granted and admin consent is given.

### Error: "CORS policy"
**Solution**: Ensure CORS is configured in SharePoint and your GitHub Pages URL is added.

### Error: "404 Not Found"
**Solution**: Verify the SharePoint list names match exactly (case-sensitive).

## Next Steps

After completing these steps:
1. Update `sharepoint-api.js` with your credentials
2. Create the SharePoint lists
3. Test the API connection
4. Deploy to GitHub Pages
5. Test data submission to SharePoint

## Support

For Azure AD issues:
- Azure Portal Documentation: https://docs.microsoft.com/en-us/azure/
- Azure AD Documentation: https://docs.microsoft.com/en-us/azure/active-directory/

For SharePoint API issues:
- SharePoint REST API Documentation: https://docs.microsoft.com/en-us/sharepoint/dev/sp-add-ins/rest-api/
