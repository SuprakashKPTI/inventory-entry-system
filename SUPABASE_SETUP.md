# Supabase Setup Guide for Inventory Entry Page

This guide will help you set up Supabase for your inventory entry page with Microsoft authentication and GitHub Pages hosting.

## Prerequisites

- A GitHub account (for GitHub Pages hosting)
- A Microsoft account (for OAuth authentication)
- A Supabase account (free tier is sufficient)

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in the project details:
   - **Name**: `inventory-entry-page` (or your preferred name)
   - **Database Password**: Choose a strong password and save it securely
   - **Region**: Choose a region closest to your users
5. Click "Create new project"
6. Wait for the project to be created (this may take 1-2 minutes)

## Step 2: Get Your Supabase Credentials

1. Once your project is ready, go to **Project Settings** → **API**
2. Copy the following values:
   - **Project URL**: Looks like `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public** (anonymous key): Looks like `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
3. Keep these values safe - you'll need them in Step 6

## Step 3: Set Up the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the contents of `supabase-schema.sql` from your project
4. Paste it into the SQL Editor
5. Click "Run" to execute the schema
6. Verify that all tables were created successfully in the **Table Editor**

The schema includes:
- `items` - Inventory items
- `customers` - Customer information
- `booking_data` - Booking averages
- `shipping_data` - Shipping averages
- `spike_data` - User-submitted spike data
- `submission_control` - Controls when users can submit data

## Step 4: Set Up Microsoft OAuth Authentication

### 4.1 Register App in Microsoft Azure Portal

1. Go to [https://portal.azure.com](https://portal.azure.com)
2. Sign in with your Microsoft account
3. Navigate to **Microsoft Entra ID** (formerly Azure Active Directory)
4. Click **App registrations** → **New registration**
5. Fill in:
   - **Name**: `Inventory Entry Page`
   - **Supported account types**: "Accounts in any organizational directory and personal Microsoft accounts"
   - **Redirect URI**: Select "Web" and enter: `https://xxxxxxxxxxxxx.supabase.co/auth/v1/callback`
     - Replace `xxxxxxxxxxxxx` with your Supabase project ID (from your Project URL)
6. Click **Register**
7. Copy the **Application (client) ID** and **Directory (tenant) ID** - save these

### 4.2 Configure Authentication in Azure

1. In your app registration, go to **Authentication**
2. Add a platform → **Web**
3. Redirect URI: `https://xxxxxxxxxxxxx.supabase.co/auth/v1/callback`
   - Replace with your actual Supabase project URL
4. Under **Advanced settings**, check **Allow public client flows**
5. Click **Configure**

### 4.3 Create Client Secret

1. In your app registration, go to **Certificates & secrets**
2. Click **New client secret**
3. Name: `Supabase Secret`
4. Expiration: Choose an expiration date (recommended: 180 days or more)
5. Click **Add**
6. **IMPORTANT**: Copy the **Value** immediately (you won't see it again)
7. Save this secret securely

### 4.4 Configure Microsoft Provider in Supabase

1. Go back to your Supabase dashboard
2. Navigate to **Authentication** → **Providers**
3. Find **Microsoft** and click to expand
4. Enable the toggle to turn on Microsoft authentication
5. Fill in the credentials from Azure:
   - **Client ID**: The Application (client) ID from Step 4.1
   - **Client Secret**: The Value from Step 4.3
   - **Tenant ID**: The Directory (tenant) ID from Step 4.1
6. Click **Save**

## Step 5: Configure Redirect URLs in Supabase

1. In Supabase, go to **Authentication** → **URL Configuration**
2. Add your GitHub Pages URL to **Redirect URLs**:
   - For GitHub Pages: `https://yourusername.github.io/inventory-entry-page/index.html`
   - For local testing: `http://localhost:3000/index.html` (if using a local server)
3. Add the same URLs to **Site URL**
4. Click **Save**

## Step 6: Update Your Configuration File

1. Open `supabase-config.js` in your project
2. Replace the placeholder values:
   ```javascript
   const SUPABASE_CONFIG = {
       url: 'YOUR_SUPABASE_URL', // Replace with your actual URL
       anonKey: 'YOUR_SUPABASE_ANON_KEY', // Replace with your anon key
       // ... rest of config
   };
   ```
3. Save the file

## Step 7: Update HTML Files to Include Supabase SDK

### 7.1 Update index.html

Add the Supabase SDK in the `<head>` section:

```html
<head>
    <!-- Existing meta tags and title -->
    <link rel="stylesheet" href="styles.css">
    
    <!-- Add Supabase SDK -->
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    
    <!-- Add Supabase config -->
    <script src="supabase-config.js"></script>
</head>
```

Remove or comment out the old SharePoint scripts:
```html
<!-- Remove these lines -->
<!-- <script src="azure-config.js"></script> -->
<!-- <script src="sharepoint-api.js"></script> -->
```

### 7.2 Update Admin Panel HTML Files

Do the same for:
- `admin/admin.html`
- `admin/login.html`

## Step 8: Deploy to GitHub Pages

1. Push your updated code to your GitHub repository
2. Go to your repository on GitHub
3. Navigate to **Settings** → **Pages**
4. Under **Source**, select **Deploy from a branch**
5. Select branch: `main` (or your default branch)
6. Click **Save**
7. Your site will be available at: `https://yourusername.github.io/inventory-entry-page/`

## Step 9: Test the Application

### Test Authentication

1. Open your GitHub Pages URL
2. Try to sign in with Microsoft
3. Verify you can authenticate successfully

### Test Data Operations

1. As an admin, log in to the admin panel
2. Add some test items and customers
3. Try submitting spike data as a regular user
4. Verify data appears in Supabase database

### Check Supabase Dashboard

1. Go to **Table Editor** in Supabase
2. Verify data is being stored correctly
3. Check **Authentication** → **Users** to see authenticated users

## Troubleshooting

### Microsoft OAuth Issues

**Error: "AADSTS50011: The reply URL specified in the request does not match the reply URLs configured for the application"**

- Solution: Ensure the redirect URI in Azure matches exactly: `https://xxxxxxxxxxxxx.supabase.co/auth/v1/callback`
- Also check the redirect URLs in Supabase Authentication settings

**Error: "AADSTS50105: The application does not have permissions for this resource"**

- Solution: Ensure you've enabled Microsoft provider in Supabase and saved the credentials

### Database Connection Issues

**Error: "Failed to fetch" or network errors**

- Solution: Verify your Supabase URL and anon key are correct
- Check that Row Level Security (RLS) policies allow public read access for reference data

**Error: "Permission denied"**

- Solution: Check RLS policies in the database. The schema includes policies that should work, but you may need to adjust them

### Data Not Saving

**Issue: Data appears to save but doesn't persist**

- Solution: Check browser console for errors
- Verify the user is authenticated (for spike data inserts)
- Check Supabase logs in the dashboard

### Hosting Issues

**Issue: GitHub Pages not loading Supabase SDK**

- Solution: Ensure the CDN link is correct and accessible
- Check browser console for script loading errors

## Security Best Practices

1. **Never commit secrets**: Don't commit `supabase-config.js` with real credentials to public repositories
   - Use environment variables or a separate config file
   - Add `supabase-config.js` to `.gitignore` and create a template

2. **Use Row Level Security**: The schema includes RLS policies. Review and adjust them based on your security needs

3. **Rotate secrets**: Regularly rotate your Supabase anon key and Azure client secret

4. **Limit permissions**: The anon key has limited permissions. For admin operations, consider using a service role key (never exposed to client-side code)

5. **Monitor usage**: Check Supabase dashboard for API usage and set up alerts if needed

## Next Steps

After completing the setup:

1. Replace SharePoint API calls in `script.js` with Supabase functions
2. Replace SharePoint API calls in `admin/admin-script.js` with Supabase functions
3. Update authentication logic to use Supabase Auth instead of simple password
4. Test all functionality end-to-end
5. Remove old SharePoint-related files (`azure-config.js`, `sharepoint-api.js`)

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Microsoft OAuth Guide](https://supabase.com/docs/guides/auth/social-login/auth-microsoft)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
