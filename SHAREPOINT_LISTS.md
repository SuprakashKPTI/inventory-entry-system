# SharePoint Lists Creation Guide

## Quick Instructions

Create these 5 lists in your SharePoint site: `https://kcptco.sharepoint.com/sites/YGSpikeplanning`

## List 1: InventoryItems

**Steps:**
1. Go to your SharePoint site
2. Click "Site Contents" → "Add an app" → "List"
3. Name: `InventoryItems`
4. Click "Create"
5. Click "Add column" → "Single line of text"
   - Column name: `ItemID`
   - Required: Yes
6. Click "Add column" → "Multiple lines of text"
   - Column name: `Description`
7. Click "Add column" → "Single line of text"
   - Column name: `Grade`

## List 2: Customers

**Steps:**
1. Create new list named: `Customers`
2. Add columns:
   - `CustomerCode` (Single line of text, required)
   - `CustomerName` (Single line of text)
   - `Region` (Choice with options: South West, North East, North West, South East, Central)

## List 3: BookingData

**Steps:**
1. Create new list named: `BookingData`
2. Add columns:
   - `CustomerCode` (Single line of text, required)
   - `ItemID` (Single line of text, required)
   - `AverageBooking` (Number, 0 decimal places)

## List 4: ShippingData

**Steps:**
1. Create new list named: `ShippingData`
2. Add columns:
   - `CustomerCode` (Single line of text, required)
   - `ItemID` (Single line of text, required)
   - `AverageShipping` (Number, 0 decimal places)

## List 5: SpikeData

**Steps:**
1. Create new list named: `SpikeData`
2. Add columns:
   - `CustomerCode` (Single line of text, required)
   - `ItemID` (Single line of text, required)
   - `Month1` (Number, 0 decimal places)
   - `Month2` (Number, 0 decimal places)
   - `Month3` (Number, 0 decimal places)
   - `TotalSpike` (Calculated column: formula = Month1 + Month2 + Month3)
   - `SubmitDate` (Date and Time)
   - `UserName` (Single line of text)
   - `Region` (Single line of text)

## Verification

After creating all lists, verify:
- Each list has the correct name
- All columns are created with correct data types
- Test adding a sample item to each list
- List permissions allow users to add items (for spike data)

## Next Steps

After creating lists:
1. Follow the Azure AD registration guide
2. Configure credentials in sharepoint-api.js
3. Test the connection
4. Deploy to GitHub Pages
