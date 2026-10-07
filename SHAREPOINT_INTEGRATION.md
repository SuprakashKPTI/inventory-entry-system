# SharePoint Integration Guide

## Overview

This guide will help you integrate the inventory entry system with SharePoint for cloud data storage. All data (items, customers, booking data, shipping data, spike data) will be stored in SharePoint lists instead of localStorage.

## Prerequisites

1. **SharePoint Site Access**
   - You need a SharePoint site with appropriate permissions
   - Should have rights to create lists and add items
   - Should have read/write permissions for users

2. **SharePoint Details Needed**
   - SharePoint site URL (e.g., `https://yourcompany.sharepoint.com/sites/inventory`)
   - List names for each data type
   - Authentication method (Modern authentication recommended)

## Architecture

### Data Storage in SharePoint Lists

**Lists to Create:**

1. **Inventory Items** - Stores item master data
   - Columns: ItemID, Description, Grade

2. **Customers** - Stores customer information
   - Columns: CustomerCode, CustomerName, Region

3. **Booking Data** - Stores booking averages
   - Columns: CustomerCode, ItemID, AverageBooking

4. **Shipping Data** - Stores shipping averages
   - Columns: CustomerCode, ItemID, AverageShipping

5. **Spike Data** - Stores user-submitted spike data
   - Columns: CustomerCode, ItemID, Month1, Month2, Month3, TotalSpike, SubmitDate, UserName, SubmittedBy, Region

## Implementation Options

### Option 1: SharePoint REST API (Recommended)

**Pros:**
- Native SharePoint integration
- Uses SharePoint's built-in authentication
- Works within SharePoint context
- No additional authentication setup needed

**Cons:**
- Requires SharePoint site access
- CORS configuration may be needed
- SharePoint authentication complexity

### Option 2: Microsoft Graph API

**Pros:**
- Modern API
- Better security model
- More features available

**Cons:**
- Requires Azure AD app registration
- More complex setup
- Additional dependencies

### Option 3: SharePoint Power Automate (Low-Code)

**Pros:**
- No code required
- Easy to set up flows
- SharePoint native

**Cons:**
- Less flexible
- Limited to Power Automate capabilities
- May have delays

## Recommended Approach: SharePoint REST API

### Step 1: Create SharePoint Lists

**Create these lists in your SharePoint site:**

1. **Inventory Items List**
   - List Name: `InventoryItems`
   - Columns:
     - ItemID (Single line of text, required)
     - Description (Multiple lines of text)
     - Grade (Single line of text)

2. **Customers List**
   - List Name: `Customers`
   - Columns:
     - CustomerCode (Single line of text, required)
     - CustomerName (Single line of text)
     - Region (Choice: South West, North East, North West, South East, Central)

3. **Booking Data List**
   - List Name: `BookingData`
   - Columns:
     - CustomerCode (Single line of text, required)
     - ItemID (Single line of text, required)
     - AverageBooking (Number, 0 decimal places)

4. **Shipping Data List**
   - List Name: `ShippingData`
   - Columns:
     - CustomerCode (Single line of text, required)
     - ItemID (Single line of text, required)
     - AverageShipping (Number, 0 decimal places)

5. **Spike Data List**
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

### Step 2: Configure SharePoint for CORS

**For external hosting (GitHub Pages):**

1. Go to SharePoint Admin Center
2. Navigate to your site
3. Click "Advanced" → "Configure"
4. Under "CORS", add your GitHub Pages URL
5. Add these headers: `Authorization`, `Content-Type`, `Accept`

**For SharePoint embedding:**
- CORS may not be needed if hosted within SharePoint
- Use SharePoint's internal authentication

### Step 3: Update Application Configuration

**Create a configuration file:**

```javascript
// config.js
const SHAREPOINT_CONFIG = {
    siteUrl: 'https://yourcompany.sharepoint.com/sites/inventory',
    lists: {
        items: 'InventoryItems',
        customers: 'Customers',
        bookingData: 'BookingData',
        shippingData: 'ShippingData',
        spikeData: 'SpikeData'
    }
};
```

### Step 4: Implement SharePoint API Integration

**Key Functions to Implement:**

1. **Authentication**: Use SharePoint's built-in authentication
2. **CRUD Operations**: Create, Read, Update, Delete list items
3. **Data Sync**: Replace localStorage with SharePoint API calls
4. **Error Handling**: Handle SharePoint API errors gracefully

### Step 5: Deployment Options

**Option A: Host within SharePoint**
- Upload files to SharePoint Site Assets library
- Embed directly in SharePoint page
- Native authentication
- Best for internal use

**Option B: Host on GitHub Pages + SharePoint API**
- Use GitHub Pages for hosting
- Call SharePoint REST API for data
- Requires CORS configuration
- External access possible

## Development Implementation

I'll need to create:
1. SharePoint API service layer
2. Update data persistence functions
3. Update admin panel to use SharePoint
4. Update entry page to use SharePoint
5. Handle authentication
6. Error handling and fallback to localStorage

## Authentication Methods

### Method 1: SharePoint Context Authentication (SharePoint-Hosted)
- Uses SharePoint's built-in authentication
- Best for hosting within SharePoint
- No additional setup needed

### Method 2: Azure AD (External Hosting)
- Register app in Azure AD
- Get client ID and secret
- Use OAuth 2.0 authentication
- More complex but more secure

### Method 3: API Key / App-Only (Simple)
- Use SharePoint API key
- Simpler setup
- Less secure

## Next Steps

Would you like me to:

1. **Implement Option A** (Host within SharePoint with native authentication) - Easiest, works great for internal use
2. **Implement Option B** (GitHub Pages + SharePoint REST API) - Allows external access, requires CORS setup
3. **Create a Power Automate solution** - Low-code, no JavaScript changes needed

Please let me know which approach you prefer, and I'll implement the complete integration.
