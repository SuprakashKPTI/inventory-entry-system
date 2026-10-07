# SharePoint Integration - Quick Start Guide

## Summary

Your inventory entry system is now fully integrated with SharePoint for centralized cloud storage. Here's what you need to do to deploy it.

## Deployment Steps (Order Matters!)

### 1. Azure AD Configuration (45 minutes)
**File**: `AZURE_SETUP.md`

1. Register Azure AD application
2. Get Application (client) ID and Directory (tenant) ID
3. Create client secret
4. Configure SharePoint API permissions
5. Grant admin consent

### 2. Create SharePoint Lists (30 minutes)
**File**: `SHAREPOINT_LISTS.md`

Create these 5 lists in your SharePoint site:
- InventoryItems
- Customers
- BookingData
- ShippingData
- SpikeData

### 3. Configure CORS (5 minutes)
**File**: `DEPLOYMENT_SHAREPOINT.md`

Add your GitHub Pages URL to SharePoint CORS configuration.

### 4. Configure Credentials (5 minutes)
**File**: `azure-config.js`

Replace placeholder values with your actual Azure AD credentials:
- clientId
- tenantId
- clientSecret

**IMPORTANT**: This file is in `.gitignore` - never commit real credentials!

### 5. Deploy to GitHub Pages (30 minutes)
**File**: `DEPLOYMENT_SHAREPOINT.md`

1. Initialize Git repository
2. Create GitHub repository
3. Push to GitHub
4. Enable GitHub Pages
5. Wait for deployment

### 6. Test Integration (20 minutes)
**File**: `DEPLOYMENT_SHAREPOINT.md`

1. Test admin panel (add item to SharePoint)
2. Test entry page (submit spike data to SharePoint)
3. Verify data in SharePoint lists
4. Test error handling (localStorage fallback)

### 7. Embed in SharePoint (5 minutes)
**File**: `DEPLOYMENT_SHAREPOINT.md`

Use SharePoint Embed web part to display the application.

## Key Files

- `DEPLOYMENT_SHAREPOINT.md` - **Complete deployment guide** (start here!)
- `AZURE_SETUP.md` - Azure AD registration
- `SHAREPOINT_LISTS.md` - SharePoint list creation
- `sharepoint-api.js` - SharePoint REST API service layer
- `azure-config.js` - Azure AD credentials (configure this!)
- `.gitignore` - Prevents credential commits

## Features Now Enabled

✅ **Centralized SharePoint Storage** - All data in SharePoint lists
✅ **Multi-User Support** - Admin can see all user submissions
✅ **External Access** - Users can access from anywhere via GitHub Pages
✅ **SharePoint Integration** - Both admin and entry pages use SharePoint
✅ **Error Handling** - localStorage fallback if SharePoint unavailable
✅ **CORS Configuration** - Ready for cross-origin API calls

## Architecture

```
GitHub Pages (Hosting)
    ↓
Entry Page / Admin Panel
    ↓
SharePoint REST API
    ↓
SharePoint Lists (Storage)
```

## Security Notes

⚠️ **Critical**:
- Azure AD client secret is sensitive - keep it secure
- Never commit `azure-config.js` with real credentials
- App has `Sites.ReadWrite.All` permissions - monitor usage
- Rotate client secrets every 180 days
- Current app passwords are client-side (for production, use Azure AD auth)

## Troubleshooting

**SharePoint connection fails**:
- Check Azure AD credentials in `azure-config.js`
- Verify API permissions are granted
- Check CORS configuration in SharePoint
- Review browser console for errors

**Data not saving to SharePoint**:
- Verify list names match exactly (case-sensitive)
- Check column names in SharePoint lists
- Verify user has write permissions
- Check network connectivity

**Error handling activated**:
- System falls back to localStorage automatically
- Data saved locally will sync when SharePoint is available
- Check console for SharePoint error messages

## Next Steps

1. **Read** `DEPLOYMENT_SHAREPOINT.md` (complete guide)
2. **Follow** Azure AD registration in `AZURE_SETUP.md`
3. **Create** SharePoint lists per `SHAREPOINT_LISTS.md`
4. **Configure** credentials in `azure-config.js`
5. **Deploy** to GitHub Pages
6. **Test** the integration
7. **Embed** in SharePoint

## Success Criteria

✅ Azure AD app registered
✅ SharePoint lists created
✅ CORS configured
✅ Credentials configured
✅ Deployed to GitHub Pages
✅ SharePoint connection tested
✅ Data submission verified
✅ Embedded in SharePoint

Your system is ready for SharePoint integration! Follow `DEPLOYMENT_SHAREPOINT.md` for complete step-by-step instructions.
