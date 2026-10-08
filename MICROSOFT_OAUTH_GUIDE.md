# Microsoft OAuth Setup Guide

This guide walks you through registering a Microsoft OAuth app in Azure Portal and configuring it in Supabase.

## Part 1: Register Microsoft OAuth App in Azure Portal

### Step 1: Access Azure Portal
1. Go to https://portal.azure.com
2. Sign in with your Microsoft account (work/school account recommended)
3. If you don't have an Azure account, you can create a free one at https://azure.microsoft.com/free/

### Step 2: Navigate to Microsoft Entra ID
1. In the Azure Portal search bar, type "Microsoft Entra ID" (formerly Azure Active Directory)
2. Click on "Microsoft Entra ID" from the search results
3. You'll see the Microsoft Entra ID overview page

### Step 3: Register a New Application
1. In the left sidebar, click on **App registrations**
2. Click the **+ New registration** button at the top
3. Fill in the registration form:
   - **Name**: Enter `Inventory Entry Page` (or any name you prefer)
   - **Supported account types**: Select "Accounts in any organizational directory and personal Microsoft accounts" (this allows both work/school and personal Microsoft accounts)
   - **Redirect URI (optional)**: 
     - Select "Web" from the dropdown
     - Enter: `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`
     - **Important**: Replace `YOUR_PROJECT_ID` with your actual Supabase project ID (from your Supabase URL)
     - Example: If your Supabase URL is `https://abc123xyz.supabase.co`, then enter `https://abc123xyz.supabase.co/auth/v1/callback`
4. Click **Register**

### Step 4: Copy Application Credentials
After registration, you'll see the app overview page. Save these values:

1. **Application (client) ID**:
   - Located at the top of the overview page
   - Copy this value - you'll need it for Supabase
   - It looks like: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

2. **Directory (tenant) ID**:
   - Also at the top of the overview page
   - Copy this value - you'll need it for Supabase
   - It looks like: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

### Step 5: Configure Authentication
1. In the left sidebar, click on **Authentication**
2. Click **+ Add a platform**
3. Select **Web**
4. In the "Redirect URIs" section:
   - Enter: `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`
   - Replace `YOUR_PROJECT_ID` with your actual Supabase project ID
5. Under **Advanced settings**:
   - Check the box for **Allow public client flows**
6. Click **Configure**

### Step 6: Create Client Secret
1. In the left sidebar, click on **Certificates & secrets**
2. Click the **+ New client secret** button
3. Fill in the form:
   - **Description**: Enter `Supabase Secret` (or any description)
   - **Expires**: Select an expiration date (recommended: 180 days or more)
4. Click **Add**
5. **IMPORTANT**: Copy the **Value** immediately
   - You'll only see it once!
   - Do NOT copy the "Secret ID" - you need the "Value"
   - It looks like: `abc123~XYZ456.789-abc_DEF`
6. Save this secret securely - you'll need it for Supabase

### Step 7: Verify API Permissions (Optional but Recommended)
1. In the left sidebar, click on **API permissions**
2. You should see "User.Read" permission already added (default)
3. This is sufficient for basic authentication
4. If you need additional permissions, click **+ Add a permission**

## Part 2: Configure Microsoft Provider in Supabase

### Step 1: Access Your Supabase Project
1. Go to https://supabase.com/dashboard
2. Sign in to your Supabase account
3. Select your project from the dashboard

### Step 2: Navigate to Authentication Settings
1. In the left sidebar, click on **Authentication**
2. Click on **Providers** (under Authentication)

### Step 3: Enable Microsoft Provider
1. Find **Microsoft** in the list of providers
2. Click on it to expand the settings
3. Toggle the switch to **Enable** Microsoft authentication

### Step 4: Configure Microsoft Credentials
Fill in the fields with the values from Azure:

1. **Client ID**:
   - Paste the Application (client) ID from Azure
   - Example: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

2. **Client Secret**:
   - Paste the Value from Azure (not the Secret ID)
   - Example: `abc123~XYZ456.789-abc_DEF`

3. **Tenant ID**:
   - Paste the Directory (tenant) ID from Azure
   - Example: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

### Step 5: Configure Redirect URLs
1. Scroll down to the **Redirect URLs** section
2. Add your GitHub Pages URL:
   - Format: `https://yourusername.github.io/inventory-entry-page/index.html`
   - Replace `yourusername` with your GitHub username
   - Replace `inventory-entry-page` with your repository name
3. For local testing, you can also add:
   - `http://localhost:3000/index.html` (if using a local server)
   - `http://127.0.0.1:5500/index.html` (if using Live Server)
4. Click **Save**

### Step 6: Configure Site URL
1. In the same section, find **Site URL**
2. Add your GitHub Pages URL (without the path):
   - Format: `https://yourusername.github.io/inventory-entry-page/`
3. Click **Save**

### Step 7: Test the Configuration
1. Go to your GitHub Pages site
2. Try to sign in with Microsoft
3. You should be redirected to Microsoft's login page
4. After signing in, you should be redirected back to your app

## Troubleshooting

### Error: "AADSTS50011: The reply URL specified in the request does not match"
**Cause**: Redirect URI in Azure doesn't match Supabase configuration

**Solution**:
1. In Azure Portal, go to your app → Authentication
2. Verify the redirect URI is exactly: `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`
3. In Supabase, verify the redirect URLs include your GitHub Pages URL
4. Both must match exactly (case-sensitive)

### Error: "AADSTS50105: The application does not have permissions"
**Cause**: Microsoft provider not properly configured in Supabase

**Solution**:
1. Verify Client ID, Client Secret, and Tenant ID are correct in Supabase
2. Ensure Microsoft provider is enabled in Supabase
3. Check that "Allow public client flows" is enabled in Azure

### Error: "AADSTS700016: Application with identifier was not found"
**Cause**: Client ID is incorrect

**Solution**:
1. Double-check you copied the Application (client) ID (not the Object ID)
2. Verify the ID in Supabase matches Azure exactly

### Error: Login succeeds but redirects to wrong page
**Cause**: Redirect URL configuration issue

**Solution**:
1. In Supabase Authentication → URL Configuration
2. Ensure Site URL and Redirect URLs are correct
3. The redirect should include the full path to your index.html

### Error: "Invalid redirect_uri"
**Cause**: Redirect URI format is incorrect

**Solution**:
1. Ensure redirect URI ends with `/auth/v1/callback`
2. Use HTTPS (not HTTP) for production
3. No trailing slashes in the middle of the URL

## Important Notes

### Security Best Practices
1. **Never commit secrets to git**: Your supabase-config.js should be in .gitignore
2. **Rotate secrets regularly**: Update your Client Secret every 180 days
3. **Use environment variables**: For production, consider using environment variables instead of hardcoding
4. **Limit permissions**: Only request the permissions you actually need

### Common Mistakes
1. **Copying Secret ID instead of Value**: In Azure, there are two IDs - you need the "Value" column, not "Secret ID"
2. **Wrong redirect URI format**: Must be exactly `https://PROJECT_ID.supabase.co/auth/v1/callback`
3. **Forgetting to enable provider**: Microsoft provider must be enabled in Supabase
4. **Case sensitivity**: URLs are case-sensitive

### Testing Locally
To test OAuth locally:
1. Add `http://localhost:3000/index.html` to redirect URLs in Supabase
2. Or use a local tunnel like ngrok: `ngrok http 3000`
3. Add the ngrok URL to redirect URLs temporarily

## Summary Checklist

### Azure Portal
- [ ] Created Microsoft Entra ID app registration
- [ ] Copied Application (client) ID
- [ ] Copied Directory (tenant) ID
- [ ] Added Web platform with correct redirect URI
- [ ] Enabled "Allow public client flows"
- [ ] Created client secret and copied the Value

### Supabase Dashboard
- [ ] Enabled Microsoft provider
- [ ] Entered Client ID from Azure
- [ ] Entered Client Secret from Azure
- [ ] Entered Tenant ID from Azure
- [ ] Added GitHub Pages URL to Redirect URLs
- [ ] Added GitHub Pages URL to Site URL
- [ ] Saved configuration
- [ ] Tested Microsoft OAuth login

## Next Steps

After completing these steps:
1. Update your `supabase-config.js` with your Supabase URL and anon key
2. Switch to the new Supabase script files
3. Deploy to GitHub Pages
4. Test the complete authentication flow

For help with the remaining steps, refer to `SUPABASE_SETUP.md` and `MIGRATION_SUMMARY.md`.
