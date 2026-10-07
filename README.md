# Inventory Details Entry Page

A web-based inventory details entry system designed to be hosted on GitHub Pages and embedded in SharePoint. Includes both user entry page and admin panel for managing reference data.

## Features

### User Entry Page
- **Login Protection**: Password-protected access (Password: `User@123`)
- **User Name Capture**: Users enter their name during login, which auto-fills in Submitted By field
- **Session Management**: Auto-logout after 8 hours of inactivity
- **Customer Selection**: Dropdown to select customer code
- **Region Selection**: Pre-defined regions for data classification
- **User Tracking**: Tracks who submitted the data (auto-filled from login)
- **Item Management**: Fixed item data (ItemID, Description, Grade) maintained by admin
- **Data Lookup**: Automatic lookup of:
  - Last 4 months average booking (customer and region level)
  - Last 4 months average shipping (customer level)
  - Previous spike data (customer level)
- **Spike Entry**: Enter Month 1, 2, and 3 spike values
- **Auto-calculation**: Total spike is automatically calculated
- **Data Storage**: Submitted data stored in master table with all relevant details

### Admin Panel
- **Password Protection**: Single password required to access admin panel (Password: `Admin@123`)
- **Item Management**: Add, edit, delete, and bulk upload inventory items
- **Customer Management**: Add, edit, delete, and bulk upload customers with region association
- **Booking Data Management**: Separate management for booking averages by customer
- **Shipping Data Management**: Separate management for shipping averages by customer
- **Current Spike Data**: View new spike submissions with customer filter, export, and send to previous
- **Previous Spike Data**: View historical spike data with customer filter and export
- **Submission Control**: Open/close submission window to control when users can submit spike data
  - Automatic timestamp recording for when window is opened and closed
  - Status indicators show last opened/closed times
  - Auto-close scheduling: Set a specific date/time for the window to automatically close
  - Timer checks every 30 seconds and closes window at scheduled time
- **Bulk Upload**: CSV-based bulk upload for items, customers, booking data, and shipping data
- **Clear Page**: Password-protected clear page functionality for each data section
- **Data Persistence**: All admin data stored in localStorage (can be configured for cloud storage)
- **Auto-Region Association**: Customers are associated with regions; region data is automatically calculated
- **Session Management**: Auto-logout after 30 minutes of inactivity

## File Structure

```
inventory-entry-page/
├── landing.html        # Landing page with access selection
├── entry-login.html    # Entry page login
├── index.html          # Main entry page
├── styles.css          # Styling for entry page
├── script.js           # JavaScript for entry page
├── debug.html          # Debug tool for troubleshooting
├── README.md           # This file
├── DEPLOYMENT.md       # Deployment guide
├── admin/              # Admin panel directory
│   ├── login.html      # Admin panel login
│   ├── admin.html      # Admin panel interface
│   ├── admin-styles.css # Admin panel styling
│   └── admin-script.js # Admin panel functionality
└── data/               # (Optional) Data files for cloud storage
```

## Setup Instructions

### 1. Running Locally

**Open the Landing Page:**
- Open `landing.html` in your browser
- Choose between "Entry Page Login" or "Admin Panel Login"

**Entry Page Access:**
- Password: `User@123`
- Enter your name (required, not empty)
- Session expires after 8 hours
- Your name will auto-fill in the "Submitted By" field

**Admin Panel Access:**
- Password: `Admin@123`
- Session expires after 30 minutes
- Manage items, customers, booking/shipping data, and spike data

To test the application locally:

1. **Landing Page**: Open `landing.html` in your browser
2. **User Entry Page**: Click "Entry Page Login" and enter your name + password (`User@123`)
3. **Admin Panel**: Click "Admin Panel Login" and enter admin password (`Admin@123`)

**Default Entry Password**: `User@123` (Change this in `entry-login.html` for production)
**Default Admin Password**: `Admin@123` (Change this in both `admin/login.html` and `admin/admin-script.js` for production)

The admin panel and entry page share data through localStorage, so changes made in the admin panel will immediately reflect in the entry page.

### 2. GitHub Pages Setup

1. Create a new GitHub repository or use an existing one
2. Upload all files (including the admin folder) to the repository
3. Enable GitHub Pages:
   - Go to repository Settings → Pages
   - Select source: Deploy from a branch
   - Select branch: main (or your default branch)
   - Click Save
4. Your site will be available at: `https://username.github.io/repository-name/`
5. Admin panel login will be available at: `https://username.github.io/repository-name/admin/login.html`

### 3. Using the Admin Panel

The admin panel allows you to manage all reference data used by the entry page:

1. **Access the Admin Panel**: 
   - Click the "Admin Panel" link in the top-right corner of the entry page
   - Navigate directly to `admin/login.html`
   - Enter the admin password (default: `Admin@123`)

2. **Session Management**: 
   - Sessions expire after 30 minutes of inactivity
   - Click "Logout" button to end your session manually

2. **Manage Items**:
   - Click the "Items" tab
   - Click "Add New Item" to create inventory items
   - Enter ItemID, Description, and Grade
   - Edit or delete existing items as needed

3. **Manage Customers**:
   - Click the "Customers" tab
   - Click "Add New Customer" to create customer records
   - Enter Customer Code, Name, and Region
   - Edit or delete existing customers
   - Use "Bulk Upload" to import customers from CSV

4. **Manage Booking Data**:
   - Click the "Booking Data" tab
   - Click "Add Booking Data" to add booking averages
   - Select customer and item, then enter the average booking value
   - Use "Bulk Upload" to import booking data from CSV

5. **Manage Shipping Data**:
   - Click the "Shipping Data" tab
   - Click "Add Shipping Data" to add shipping averages
   - Select customer and item, then enter the average shipping value
   - Use "Bulk Upload" to import shipping data from CSV

6. **View Spike Data**:
   - Click the "Spike Data" tab
   - This section is read-only - data is entered by users via the Entry Page
   - Filter by customer to view specific spike data
   - View submit dates and user information for each entry
   - Use "🔄 Refresh Data" to load the latest submissions
   - Use "📊 Export to Excel" to download spike data as CSV file
   - Use "Clear Page" to remove all spike data (requires password confirmation)

7. **Clear Page Data**:
   - Each data section has a "Clear Page" button
   - Requires admin password confirmation
   - Clears all data in that specific section
   - Cannot be undone - use with caution

**Note**: All changes are automatically saved to localStorage and will immediately reflect in the entry page.

### Changing Admin Password

For security, change the default admin password before deploying:

1. Open `admin/login.html`
2. Find the line: `const ADMIN_PASSWORD = 'Admin@123';`
3. Change `'Admin@123'` to your desired password
4. Open `admin/admin-script.js`
5. Find the line: `const ADMIN_PASSWORD = 'Admin@123';`
6. Change `'Admin@123'` to the same password
7. Save both files

**Important**: Keep the password consistent in both files for proper functionality.

### Bulk Upload Instructions

The admin panel supports bulk upload via CSV files for faster data entry:

**Items CSV Format:**
```
ItemID,Description,Grade
ITM001,Steel Sheet 5mm,A
ITM002,Steel Sheet 10mm,B
```

**Customers CSV Format:**
```
CustomerCode,CustomerName,Region
CUST001,ABC Manufacturing,South West
CUST002,XYZ Industries,North East
```

**Booking Data CSV Format:**
```
CustomerCode,ItemID,AverageBooking
CUST001,ITM001,150
CUST001,ITM002,200
```

**Shipping Data CSV Format:**
```
CustomerCode,ItemID,AverageShipping
CUST001,ITM001,140
CUST001,ITM002,190
```

**Bulk Upload Steps:**
1. Click the "Bulk Upload" button in any data management tab
2. Review the CSV format instructions shown in the modal
3. Prepare your CSV file following the specified format
4. Select the CSV file using the file picker
5. Choose whether to append to existing data or replace all data
6. Click "Upload Data" to process the file
7. Review the results showing successful uploads and any errors

### 4. Data Configuration (Optional Cloud Storage)

The application currently uses localStorage for data persistence. For production use with cloud storage:

#### Option A: Google Sheets (Recommended)

1. Create a Google Sheet with the following sheets:
   - `items` - Item master data (ItemID, Description, Grade)
   - `customers` - Customer data (Code, Name, Region)
   - `booking_data` - Booking averages by customer
   - `shipping_data` - Shipping averages by customer
   - `spike_data` - Previous spike data
   - `inventory_data` - Master table for submitted data

2. Set up Google Sheets API:
   - Go to Google Cloud Console
   - Create a project and enable Google Sheets API
   - Create credentials (API key)
   - Share your sheet with the service account email

3. Update both `script.js` and `admin/admin-script.js`:
   ```javascript
   const DATA_CONFIG = {
       GOOGLE_SHEETS_API_KEY: 'YOUR_API_KEY',
       GOOGLE_SHEETS_SHEET_ID: 'YOUR_SHEET_ID'
   };
   ```

4. Implement cloud storage functions in both files to replace localStorage operations

#### Option B: GitHub API

1. Create a personal access token:
   - GitHub Settings → Developer settings → Personal access tokens
   - Grant repo permissions

2. Create a data file in your repository (e.g., `data/inventory-data.json`)

3. Update `script.js`:
   ```javascript
   const DATA_CONFIG = {
       GITHUB_TOKEN: 'YOUR_GITHUB_TOKEN',
       GITHUB_REPO: 'username/repo',
       GITHUB_DATA_FILE: 'data/inventory-data.json'
   };
   ```

4. Implement the `saveToGitHub()` function

#### Option C: Local Storage (For Testing Only)

The current implementation uses localStorage for demonstration. This is not suitable for production as data is stored in the user's browser only.

### 3. SharePoint Embedding

To embed this page in SharePoint:

1. **Using Embed Web Part**:
   - Edit your SharePoint page
   - Add "Embed" web part
   - Paste your GitHub Pages URL
   - Click "Embed"

2. **Using iframe**:
   ```html
   <iframe 
       src="https://username.github.io/repository-name/" 
       width="100%" 
       height="800px" 
       frameborder="0">
   </iframe>
   ```

3. **Using Page Viewer Web Part** (Classic SharePoint):
   - Add "Page Viewer" web part
   - Enter your GitHub Pages URL
   - Configure height and other settings

## Data Structure

### Master Table Columns

The submitted data is stored with the following columns:
- ItemID
- Description
- Grade
- Month 1 Spike
- Month 2 Spike
- Month 3 Spike
- User Name
- Customer
- Region
- Submit Date

### Admin-Managed Data

#### Item Data (maintained by admin)
```javascript
{ itemID: 'ITM001', description: 'Steel Sheet 5mm', grade: 'A' }
```

#### Customer Data (maintained by admin)
```javascript
{ code: 'CUST001', name: 'ABC Manufacturing' }
```

#### Average Data (maintained by admin)
```javascript
{
    'CUST001': {
        booking: { 'ITM001': 150, 'ITM002': 200 },
        shipping: { 'ITM001': 140, 'ITM002': 190 }
    }
}
```

## Customization

### Using the Admin Panel (Recommended)

Instead of editing code files directly, use the admin panel to:
- Add, edit, or delete items
- Add, edit, or delete customers with region association
- Manage booking data by customer
- Manage shipping data by customer
- Manage previous spike data
- Add or remove regions
- Bulk upload data via CSV

### Region Auto-Association

The system now automatically associates regions with customers:

1. **Customer-Region Link**: Each customer is assigned a specific region in the admin panel
2. **Auto-Selection**: When a customer is selected in the entry page, their region is automatically selected
3. **Region Aggregates**: Region-level booking and shipping data is automatically calculated by aggregating all customer data within that region
4. **Manual Override**: The region field can be manually changed if needed, but defaults to the customer's assigned region

This ensures data consistency and simplifies the data entry process.

### Manual Customization (Advanced)

If you prefer to edit code directly:

#### Adding New Items
Edit the sample data initialization in `script.js` or use the admin panel to add items dynamically.

#### Adding New Customers
Use the admin panel to add customers, or edit the sample data initialization.

#### Adding New Regions
Edit the regions array in the admin panel or in the initialization code.

### Styling Customization

Modify the CSS files to match your branding:
- `styles.css` - Entry page styling
- `admin/admin-styles.css` - Admin panel styling

Key color variables to change:
- Primary color: `#0078d4` (blue)
- Success color: `#107c10` (green)
- Error color: `#d13438` (red)

## Security Considerations

1. **Admin Password**: 
   - Change the default admin password before deployment
   - Keep the password consistent between login.html and admin-script.js
   - Use strong passwords with special characters, numbers, and mixed case
   - Consider implementing server-side authentication for production

2. **Session Management**:
   - Sessions expire after 30 minutes of inactivity
   - Users should logout when finished to prevent unauthorized access
   - Clear browser data after using public computers

3. **Data Persistence**: 
   - Current implementation uses localStorage (browser-based)
   - Data is stored in user's browser only
   - Not suitable for multi-user environments
   - Configure cloud storage for production use

4. **Clear Page Protection**:
   - Clear page operations require password confirmation
   - Cannot be undone - use with extreme caution
   - Consider implementing additional confirmation steps for critical data

5. **API Keys**: Never commit API keys to public repositories
   - Use environment variables
   - Use GitHub Secrets for Actions
   - Consider using a backend proxy

6. **Data Validation**: Add server-side validation
   - Validate input data
   - Check for duplicates
   - Implement data integrity checks

## Future Enhancements

- [ ] Admin interface for managing items, customers, and average data
- [ ] User authentication and authorization
- [ ] Data export functionality (CSV, Excel)
- [ ] Data visualization and reporting
- [ ] Email notifications on submission
- [ ] Audit trail for all changes
- [ ] Multi-language support
- [ ] Mobile-responsive design improvements

## Troubleshooting

### Admin panel changes not reflecting in entry page
- Both pages must be opened in the same browser
- Ensure localStorage is enabled in your browser
- Try refreshing the entry page after making admin changes
- Check browser console for localStorage errors

### Data not saving
- Check browser console for errors
- Verify localStorage is enabled
- Clear browser cache and try again
- For cloud storage, verify API credentials are correct

### SharePoint iframe not loading
- Check if the URL is accessible
- Verify SharePoint allows external sites
- Check browser security settings
- Ensure GitHub Pages is properly configured

### Lookup data not displaying
- Ensure customer is selected (region will auto-populate)
- Verify booking/shipping data exists in admin panel for selected customer
- Check browser console for JavaScript errors
- Ensure admin data has been saved properly
- Verify customers have regions assigned in the admin panel

### Admin panel not accessible
- Ensure admin folder structure is correct
- Check that all admin files are uploaded to GitHub
- Verify the URL path: `/admin/login.html` (not `/admin/admin.html`)
- Check that admin password is correct
- Clear browser cache and try again

### Login issues
- Verify password matches in both login.html and admin-script.js
- Check that JavaScript is enabled in your browser
- Clear browser cookies and localStorage
- Ensure you're not using an expired session (30-minute timeout)

### Bulk upload errors
- Check CSV format matches the required format exactly
- Ensure no extra spaces or special characters in data
- Verify that referenced customers and items exist before uploading booking/shipping data
- Check that region names match exactly (case-sensitive)
- Use the append option carefully to avoid duplicates

### Region data not calculating correctly
- Ensure customers have valid regions assigned in the admin panel
- Verify that booking/shipping data exists for customers in each region
- Region aggregates are calculated automatically from customer data
- Check that at least one customer exists in each region for proper aggregation

### Spike data not appearing in admin panel
- Ensure users have submitted data via the Entry Page
- Check that submitted data had valid spike values (Month 1, 2, or 3 > 0)
- Verify data is being saved to localStorage properly
- Refresh the admin panel after new submissions

## License

This project is provided as-is for educational and commercial use.

## Support

For issues or questions, please create an issue in the GitHub repository.
