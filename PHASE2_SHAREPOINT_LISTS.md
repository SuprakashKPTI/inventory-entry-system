# Phase 2: Create SharePoint Lists - Step-by-Step Guide

## Overview

This guide walks you through creating the 5 required SharePoint lists in your SharePoint site. These lists will store all the application data and will be accessed via Microsoft Graph API.

## Prerequisites

- Access to your SharePoint site: `https://kcptco.sharepoint.com/sites/YGSpikeplanning`
- Permission to create lists in SharePoint
- Completed Phase 1 (Azure AD Configuration)

## Implementation Order

Create the lists in this order:
1. InventoryItems (master data)
2. Customers (master data)
3. BookingData (reference data)
4. ShippingData (reference data)
5. SpikeData (user submissions)

**Why this order?**
- Master data first (items, customers)
- Reference data next (booking, shipping - depends on items/customers)
- User submissions last (spike data - depends on all above)

---

## Step-by-Step Instructions

### List 1: InventoryItems

**Purpose**: Stores fixed inventory item master data (admin-maintained)

**Steps:**

1. **Navigate to your SharePoint site**
   - Go to: `https://kcptco.sharepoint.com/sites/YGSpikeplanning`

2. **Create the list**
   - Click **Site Contents** (gear icon → Site contents)
   - Click **"New"** → **"List"**
   - Name: `InventoryItems`
   - Description: `Fixed inventory item master data`
   - Click **"Create"**

3. **Add columns**

   **Column 1: ItemID**
   - Click **"Add column"** → **"Text"**
   - Name: `ItemID`
   - Description: `Unique item identifier`
   - Required: ✅ (Check the box)
   - Click **"Save"**

   **Column 2: Description**
   - Click **"Add column"** → **"Multiple lines of text"**
   - Name: `Description`
   - Description: `Item description`
   - Required: ❌ (Leave unchecked)
   - Click **"Save"**

   **Column 3: Grade**
   - Click **"Add column"** → **"Text"**
   - Name: `Grade`
   - Description: `Item grade/classification`
   - Required: ❌ (Leave unchecked)
   - Click **"Save"**

4. **Verify the list**
   - You should see 3 columns: ItemID, Description, Grade
   - Add a test item to verify it works

---

### List 2: Customers

**Purpose**: Stores customer information with region association (admin-maintained)

**Steps:**

1. **Create the list**
   - Go to Site Contents
   - Click **"New"** → **"List"**
   - Name: `Customers`
   - Description: `Customer information with regions`
   - Click **"Create"**

2. **Add columns**

   **Column 1: CustomerCode**
   - Click **"Add column"** → **"Text"**
   - Name: `CustomerCode`
   - Description: `Unique customer code`
   - Required: ✅
   - Click **"Save"**

   **Column 2: CustomerName**
   - Click **"Add column"** → **"Text"**
   - Name: `CustomerName`
   - Description: `Customer name`
   - Required: ❌
   - Click **"Save"**

   **Column 3: Region**
   - Click **"Add column"** → **"Choice"**
   - Name: `Region`
   - Description: `Customer region`
   - Required: ❌
   - Type: **Drop-down menu**
   - Choices (one per line):
     ```
     South West
     North East
     North West
     South East
     Central
     ```
   - Click **"Save"**

3. **Verify the list**
   - You should see 3 columns: CustomerCode, CustomerName, Region
   - Region should be a dropdown with the 5 options
   - Add a test customer to verify

---

### List 3: BookingData

**Purpose**: Stores customer-specific booking averages (admin-maintained)

**Steps:**

1. **Create the list**
   - Go to Site Contents
   - Click **"New"** → **"List"**
   - Name: `BookingData`
   - Description: `Customer-specific booking averages`
   - Click **"Create"**

2. **Add columns**

   **Column 1: CustomerCode**
   - Click **"Add column"** → **"Text"**
   - Name: `CustomerCode`
   - Description: `Customer code (must match Customers list)`
   - Required: ✅
   - Click **"Save"**

   **Column 2: ItemID**
   - Click **"Add column"** → **"Text"**
   - Name: `ItemID`
   - Description: `Item ID (must match InventoryItems list)`
   - Required: ✅
   - Click **"Save"**

   **Column 3: AverageBooking**
   - Click **"Add column"** → **"Number"**
   - Name: `AverageBooking`
   - Description: `Average booking quantity`
   - Required: ❌
   - Minimum: `0`
   - Decimal places: `0`
   - Click **"Save"**

3. **Verify the list**
   - You should see 3 columns: CustomerCode, ItemID, AverageBooking
   - AverageBooking should only accept numbers
   - Add a test booking entry to verify

---

### List 4: ShippingData

**Purpose**: Stores customer-specific shipping averages (admin-maintained)

**Steps:**

1. **Create the list**
   - Go to Site Contents
   - Click **"New"** → **"List"**
   - Name: `ShippingData`
   - Description: `Customer-specific shipping averages`
   - Click **"Create"**

2. **Add columns**

   **Column 1: CustomerCode**
   - Click **"Add column"** → **"Text"**
   - Name: `CustomerCode`
   - Description: `Customer code (must match Customers list)`
   - Required: ✅
   - Click **"Save"**

   **Column 2: ItemID**
   - Click **"Add column"** → **"Text"**
   - Name: `ItemID`
   - Description: `Item ID (must match InventoryItems list)`
   - Required: ✅
   - Click **"Save"**

   **Column 3: AverageShipping**
   - Click **"Add column"** → **"Number"**
   - Name: `AverageShipping`
   - Description: `Average shipping quantity`
   - Required: ❌
   - Minimum: `0`
   - Decimal places: `0`
   - Click **"Save"**

3. **Verify the list**
   - You should see 3 columns: CustomerCode, ItemID, AverageShipping
   - AverageShipping should only accept numbers
   - Add a test shipping entry to verify

---

### List 5: SpikeData

**Purpose**: Stores user-submitted spike data (user-generated)

**Steps:**

1. **Create the list**
   - Go to Site Contents
   - Click **"New"** → **"List"**
   - Name: `SpikeData`
   - Description: `User-submitted spike data`
   - Click **"Create"**

2. **Add columns**

   **Column 1: CustomerCode**
   - Click **"Add column"** → **"Text"**
   - Name: `CustomerCode`
   - Description: `Customer code`
   - Required: ✅
   - Click **"Save"**

   **Column 2: ItemID**
   - Click **"Add column"** → **"Text"**
   - Name: `ItemID`
   - Description: `Item ID`
   - Required: ✅
   - Click **"Save"**

   **Column 3: Month1**
   - Click **"Add column"** → **"Number"**
   - Name: `Month1`
   - Description: `Month 1 spike value`
   - Required: ❌
   - Minimum: `0`
   - Decimal places: `0`
   - Click **"Save"**

   **Column 4: Month2**
   - Click **"Add column"** → **"Number"**
   - Name: `Month2`
   - Description: `Month 2 spike value`
   - Required: ❌
   - Minimum: `0`
   - Decimal places: `0`
   - Click **"Save"**

   **Column 5: Month3**
   - Click **"Add column"** → **"Number"**
   - Name: `Month3`
   - Description: `Month 3 spike value`
   - Required: ❌
   - Minimum: `0`
   - Decimal places: `0`
   - Click **"Save"**

   **Column 6: TotalSpike** (Calculated Column)
   - Click **"Add column"** → **"Calculated"**
   - Name: `TotalSpike`
   - Description: `Total spike (Month1 + Month2 + Month3)`
   - Formula: `=[Month1]+[Month2]+[Month3]`
   - Data type returned: **Number**
   - Decimal places: `0`
   - Click **"Save"**

   **Column 7: SubmitDate**
   - Click **"Add column"** → **"Date and Time"**
   - Name: `SubmitDate`
   - Description: `Submission date and time`
   - Required: ❌
   - Format: **Date and Time**
   - Click **"Save"**

   **Column 8: UserName**
   - Click **"Add column"** → **"Text"**
   - Name: `UserName`
   - Description: `User who submitted the data`
   - Required: ❌
   - Click **"Save"**

   **Column 9: Region**
   - Click **"Add column"** → **"Text"**
   - Name: `Region`
   - Description: `Customer region`
   - Required: ❌
   - Click **"Save"**

3. **Verify the list**
   - You should see 9 columns
   - TotalSpike should automatically calculate based on Month1, Month2, Month3
   - Add a test spike entry to verify

---

## Verification Checklist

After creating all 5 lists, verify:

### ✅ List Names
- [ ] InventoryItems
- [ ] Customers
- [ ] BookingData
- [ ] ShippingData
- [ ] SpikeData

### ✅ Column Names (Exact Match - Case Sensitive)

**InventoryItems:**
- [ ] ItemID
- [ ] Description
- [ ] Grade

**Customers:**
- [ ] CustomerCode
- [ ] CustomerName
- [ ] Region

**BookingData:**
- [ ] CustomerCode
- [ ] ItemID
- [ ] AverageBooking

**ShippingData:**
- [ ] CustomerCode
- [ ] ItemID
- [ ] AverageShipping

**SpikeData:**
- [ ] CustomerCode
- [ ] ItemID
- [ ] Month1
- [ ] Month2
- [ ] Month3
- [ ] TotalSpike
- [ ] SubmitDate
- [ ] UserName
- [ ] Region

### ✅ Data Types
- [ ] Text columns: CustomerCode, ItemID, UserName, Region, Description, Grade, CustomerName
- [ ] Number columns: AverageBooking, AverageShipping, Month1, Month2, Month3, TotalSpike
- [ ] Date/Time column: SubmitDate
- [ ] Choice column: Region (in Customers list)
- [ ] Calculated column: TotalSpike

### ✅ Test Data
- [ ] Add test item to InventoryItems
- [ ] Add test customer to Customers
- [ ] Add test booking to BookingData
- [ ] Add test shipping to ShippingData
- [ ] Add test spike to SpikeData

---

## Common Issues and Solutions

### Issue: Column name doesn't match exactly
**Solution**: Microsoft Graph API is case-sensitive. Ensure column names match exactly as specified (e.g., "ItemID" not "itemID" or "itemid").

### Issue: Calculated column not working
**Solution**: Ensure the formula uses the exact column names: `=[Month1]+[Month2]+[Month3]`

### Issue: Can't see the list in Microsoft Graph API
**Solution**: Verify the list is published and not in draft mode. Ensure you have proper permissions.

### Issue: Choice column options not appearing
**Solution**: Enter each choice on a separate line in the Choices field.

---

## Next Steps

After completing Phase 2:

1. **Phase 3**: Configure credentials in `azure-config.js`
2. **Phase 4**: Deploy to GitHub Pages
3. **Phase 5**: Test the integration
4. **Phase 6**: Embed in SharePoint

## Estimated Time

- InventoryItems: 5-10 minutes
- Customers: 5-10 minutes
- BookingData: 5-10 minutes
- ShippingData: 5-10 minutes
- SpikeData: 10-15 minutes
- **Total: 30-55 minutes**

## Tips

1. **Use copy-paste**: Copy column names from this guide to avoid typos
2. **Verify after each list**: Don't wait until the end to verify
3. **Add test data**: Test each list immediately after creation
4. **Take screenshots**: Document your list structures for reference
5. **Check permissions**: Ensure you have permission to create lists

---

## Success Criteria

✅ All 5 lists created
✅ All columns created with correct names and data types
✅ Test data added to each list
✅ Lists accessible via SharePoint UI
✅ Ready for Microsoft Graph API access

Once all lists are created and verified, you're ready for Phase 3 (Configure Credentials)!
